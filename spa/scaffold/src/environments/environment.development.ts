export const environment = {
  production: false,

  // Entra ID (SPA)
  auth: {
    clientId: '0eff342c-2653-4f39-8701-52201f42ed3d',                // spa_client_id
    tenantId: '6dbb1d5c-d749-4eda-9302-4967a4675d09',                // tenant_id
    redirectUri: 'http://localhost:4200/auth',
    postLogoutRedirectUri: 'http://localhost:4200/'
  },

  // Microsoft Graph (opcional – se você usa /me)
  graph: {
    endpoint: 'https://graph.microsoft.com/v1.0',
    scopes: ['User.Read']
  },

  // Sua API protegida (dev aponta para o App Service direto)
  api: {
    baseUrl: 'https://minimalamp-api-2x2mbt.azurewebsites.net',      // api_url_appsvc
    identifier: 'api://000a147f-f391-4b7b-ab57-6de0f1b1d30d',        // api_identifier
    scopes: ['api://000a147f-f391-4b7b-ab57-6de0f1b1d30d/access_as_user'], // api_scope
    clientId: '000a147f-f391-4b7b-ab57-6de0f1b1d30d'                 // api_app_client_id (informativo)
  },

  // Infra/hosting (informativo/útil para links)
  hosting: {
    staticWebsiteUrl: 'https://minimalampspa2x2mbt.z15.web.core.windows.net/', // spa_static_website_url
    storageAccount: 'minimalampspa2x2mbt',                                      // spa_storage_account
    afd: {
      profileName: 'minimalamp-afd',                                            // afd_profile_name
      endpointName: 'minimalamp-ep',                                            // afd_endpoint_name
      defaultHostname: 'minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net'         // afd_default_hostname
    }
  },

  infra: {
    resourceGroup: 'minimalamp-rg'                                              // resource_group_name
  }
};
