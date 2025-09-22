export const environment = {
  production: false,
  auth: {
    clientId: '00000000-0000-0000-0000-000000000000',
    tenantId: '11111111-1111-1111-1111-111111111111',
    redirectUri: 'http://localhost:4200/auth',
    postLogoutRedirectUri: 'http://localhost:4200/'
  },
  graph: {
    endpoint: 'https://graph.microsoft.com/v1.0',
    scopes: ['User.Read']
  }
};
