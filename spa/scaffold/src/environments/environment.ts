export const environment = {
  production: true,

  // Entra ID (SPA)
  auth: {
    clientId: '0eff342c-2653-4f39-8701-52201f42ed3d',
    tenantId: '6dbb1d5c-d749-4eda-9302-4967a4675d09',
    // Use o domínio público do seu site (replique exatamente no App Registration > Redirect URIs)
    redirectUri: 'https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net/auth',
    postLogoutRedirectUri: 'https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net/'
    // Se você for publicar no Static Website direto (sem AFD),
    // troque para: 'https://minimalampspa2x2mbt.z15.web.core.windows.net/auth'
  },

  graph: {
    endpoint: 'https://graph.microsoft.com/v1.0',
    scopes: ['User.Read']
  },

  // Produção chama sua API atrás do Front Door
  api: {
    baseUrl: 'https://minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net',          // roteie no AFD para o backend da API
    identifier: 'api://000a147f-f391-4b7b-ab57-6de0f1b1d30d',
    scopes: ['api://000a147f-f391-4b7b-ab57-6de0f1b1d30d/access_as_user'],
    clientId: '000a147f-f391-4b7b-ab57-6de0f1b1d30d'
  },

  hosting: {
    staticWebsiteUrl: 'https://minimalampspa2x2mbt.z15.web.core.windows.net/',
    storageAccount: 'minimalampspa2x2mbt',
    afd: {
      profileName: 'minimalamp-afd',
      endpointName: 'minimalamp-ep',
      defaultHostname: 'minimalamp-ep-erfhf2d8f4bjb2c9.z03.azurefd.net'
    }
  },

  infra: {
    resourceGroup: 'minimalamp-rg'
  }
};
