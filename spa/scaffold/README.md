# Angular MSAL + Entra ID + Microsoft Graph (Exemplo)

## Como usar
1. Edite `src/environments/environment.development.ts` e `src/environments/environment.ts` com **clientId** e **tenantId** do seu App Registration (Entra ID).
2. Garanta que o App Registration (SPA) tem **Redirect URIs**: `http://localhost:4200` e `http://localhost:4200/auth`, e permissão **Microsoft Graph**: `User.Read` (delegada).
3. Instale e rode:
   ```bash
   npm install
   npm start
   ```
4. Abra `http://localhost:4200`, entre e clique em **Ver meus dados** para consultar `https://graph.microsoft.com/v1.0/me`.

> Este projeto foi gerado manualmente (não via `ng new`) apenas para demonstração mínima.
