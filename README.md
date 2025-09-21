
# MinimalAmp — FIXED (Terraform + AFD Private Link + GitHub Actions)

✅ Fixes included:
- Uses **delegated permission grant** (`azuread_service_principal_delegated_permission_grant`) instead of `azuread_app_role_assignment` for OAuth2 scopes.
- Correctly selects **scope id** from `oauth2_permission_scope` (set) via `for ... if ...` + `one(...)`.
- SPA **redirect URI** has **trailing slash** (`http://localhost:4200/`).
- AFD **origin** for API with `private_link {}` also sets `certificate_name_check_enabled = true` and `enabled = true`.
- AFD **routes** depend on the corresponding origins; API route gated by `var.enable_api_route` to approve Private Link first.
- Compatible with `azurerm ~> 3.116` and `azuread ~> 3.0`.

## Quick start
```bash
cd infra
terraform init
terraform apply -auto-approve
# Approve Private Link on the Web App (Networking > Private endpoint connections)
terraform apply -auto-approve -var='enable_api_route=true'
terraform output
```
Then scaffold Angular from `spa/scaffold` into your CLI project and use the GitHub Actions under `.github/workflows/`.

## CI/CD (push to master)
Set repo **Secrets**: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`  
Set repo **Variables**: `AZURE_RG`, `WEBAPP_NAME`, `STORAGE_ACCOUNT_NAME`, `AFD_PROFILE`, `AFD_ENDPOINT`

Pipelines:
- `deploy-api.yml`: builds & deploys .NET API; purges AFD
- `deploy-spa.yml`: builds Angular; uploads to Static Website; purges AFD
