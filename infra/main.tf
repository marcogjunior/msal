terraform {
  required_version = ">= 1.7.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.116" }
    azuread = { source = "hashicorp/azuread", version = "~> 3.0" }
    random  = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "azurerm" {
  features {}
}

provider "azuread" {}

locals {
  project         = "minimalamp"
  location        = "brazilsouth"
  api_scope_value = "access_as_user"
  suffix         = "2x2mbt"
  # IMPORTANT: trailing slash for root callback
  spa_redirects = [
    "http://localhost:4200/",
    "http://localhost:4200/auth",
    "https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net/auth",
    "https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net/",
    "https://minimalampspa2x2mbt.z15.web.core.windows.net/auth",
    "https://minimalampspa2x2mbt.z15.web.core.windows.net/"
    ]
}


# ---------------- Core Infra ----------------
resource "azurerm_resource_group" "rg" {
  name     = "${local.project}-rg"
  location = local.location
}

resource "azurerm_service_plan" "asp" {
  name                = "${local.project}-asp"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku_name            = "B1"
  os_type             = "Linux"
}



resource "azurerm_linux_web_app" "api" {
  name                = "${local.project}-api-${local.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    application_stack { dotnet_version = "8.0" }
  }

  app_settings = {
    "ASPNETCORE_URLS" = "http://0.0.0.0:8080"
  }

  public_network_access_enabled = false
}

resource "azurerm_storage_account" "spa" {
  name                            = "${local.project}spa${local.suffix}"
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = true

  # host SPA in $web container
  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}

# ---------------- Entra ID (Azure AD) ----------------
resource "azuread_application" "api" {
  display_name = "MinimalAmp-API"

  # Do NOT set identifier_uris here to avoid global collisions.
  api {
    requested_access_token_version = 2

    oauth2_permission_scope {
      id                         = uuid()
      admin_consent_description  = "Permite que o SPA acesse a API em nome do usuário."
      admin_consent_display_name = "Acessar a API como usuário"
      user_consent_description   = "Permite que este app acesse a API em seu nome."
      user_consent_display_name  = "Acessar API"
      value                      = local.api_scope_value
      enabled                    = true
    }
  }
}

# Set a unique Application ID URI: api://<client-id>
resource "azuread_application_identifier_uri" "api" {
  application_id = azuread_application.api.id                   # object ID of the app
  identifier_uri = "api://${azuread_application.api.client_id}" # client ID in the URI

  # optional but helps avoid Graph propagation races
  depends_on = [azuread_service_principal.api_sp]
}

resource "azuread_service_principal" "api_sp" {
  client_id = azuread_application.api.client_id
}

resource "azuread_application" "spa" {
  display_name = "MinimalAmp-SPA"

  single_page_application {
    redirect_uris = local.spa_redirects
  }

  # Ask for the API delegated scope; select scope id by value
  required_resource_access {
    resource_app_id = azuread_application.api.client_id

    resource_access {
      id   = one([for s in azuread_application.api.api[0].oauth2_permission_scope : s.id if s.value == local.api_scope_value])
      type = "Scope"
    }
  }
}

resource "azuread_service_principal" "spa_sp" {
  client_id = azuread_application.spa.client_id
}

# Delegated consent (SPA -> API scope)
resource "azuread_service_principal_delegated_permission_grant" "spa_to_api" {
  service_principal_object_id          = azuread_service_principal.spa_sp.object_id
  resource_service_principal_object_id = azuread_service_principal.api_sp.object_id
  claim_values                         = [local.api_scope_value]
}

# ---------------- Azure Front Door Premium ----------------
resource "azurerm_cdn_frontdoor_profile" "afd" {
  name                = "${local.project}-afd"
  resource_group_name = azurerm_resource_group.rg.name
  sku_name            = "Premium_AzureFrontDoor"
}

resource "azurerm_cdn_frontdoor_endpoint" "ep" {
  name                     = "${local.project}-ep"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.afd.id
}

# ---- OG-API + Origin-API (Private Link) ----
resource "azurerm_cdn_frontdoor_origin_group" "og_api" {
  name                     = "og-api"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.afd.id

  health_probe {
    protocol            = "Https"
    interval_in_seconds = 30
    path                = "/api/ping"
    request_type        = "GET"
  }

  load_balancing {
    additional_latency_in_milliseconds = 0
    sample_size                        = 16
    successful_samples_required        = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "api_origin" {
  name                          = "api-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.og_api.id

  host_name                      = azurerm_linux_web_app.api.default_hostname
  origin_host_header             = azurerm_linux_web_app.api.default_hostname
  https_port                     = 443
  http_port                      = 80
  enabled                        = true
  certificate_name_check_enabled = true

  private_link {
    request_message        = "AFD -> API (Private Link)"
    location               = azurerm_resource_group.rg.location
    private_link_target_id = azurerm_linux_web_app.api.id
    target_type            = "sites"
  }
}

# ---- OG-SPA + Origin-SPA ----
resource "azurerm_cdn_frontdoor_origin_group" "og_spa" {
  name                     = "og-spa"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.afd.id

  health_probe {
    protocol            = "Https"
    interval_in_seconds = 30
    path                = "/"
    request_type        = "GET"
  }

  load_balancing {
    additional_latency_in_milliseconds = 0
    sample_size                        = 16
    successful_samples_required        = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "spa_origin" {
  name                           = "spa-origin"
  cdn_frontdoor_origin_group_id  = azurerm_cdn_frontdoor_origin_group.og_spa.id
  host_name                      = azurerm_storage_account.spa.primary_web_host
  origin_host_header             = azurerm_storage_account.spa.primary_web_host
  https_port                     = 443
  http_port                      = 80
  enabled                        = true
  certificate_name_check_enabled = true
}

# ---- Routes ----
resource "azurerm_cdn_frontdoor_route" "route_api" {
  name                          = "route-api"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.ep.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.og_api.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.api_origin.id]

  patterns_to_match      = ["/api/*"]
  supported_protocols    = ["Http", "Https"]
  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  link_to_default_domain = true

  depends_on = [azurerm_cdn_frontdoor_origin.api_origin]
}

resource "azurerm_cdn_frontdoor_route" "route_spa" {
  name                          = "route-spa"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.ep.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.og_spa.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.spa_origin.id]

  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]
  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  link_to_default_domain = true

  depends_on = [azurerm_cdn_frontdoor_origin.spa_origin]
}


# Dá permissão de Blob Data Contributor para o usuário atual
data "azuread_client_config" "current" {}

resource "azurerm_role_assignment" "uploader_current_user" {
  scope                = azurerm_storage_account.spa.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azuread_client_config.current.object_id
}


# ---------------- Outputs ----------------

output "resource_group_name" { value = azurerm_resource_group.rg.name }
output "tenant_id" { value = data.azuread_client_config.current.tenant_id }
output "spa_client_id" { value = azuread_application.spa.client_id }
output "api_identifier" { value = azuread_application_identifier_uri.api.identifier_uri }
output "api_scope" { value = "${azuread_application_identifier_uri.api.identifier_uri}/${local.api_scope_value}" }
output "api_app_client_id" { value = azuread_application.api.client_id }
output "api_app_name" { value = azurerm_linux_web_app.api.name }
output "api_url_appsvc" { value = "https://${azurerm_linux_web_app.api.default_hostname}" }
output "spa_storage_account" { value = azurerm_storage_account.spa.name }
output "spa_static_website_url" { value = azurerm_storage_account.spa.primary_web_endpoint }
output "afd_profile_name" { value = azurerm_cdn_frontdoor_profile.afd.name }
output "afd_endpoint_name" { value = azurerm_cdn_frontdoor_endpoint.ep.name }
output "afd_default_hostname" { value = azurerm_cdn_frontdoor_endpoint.ep.host_name }
