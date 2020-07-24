export const environment = {
  production: true,
  api: {
    url: 'https://api.deliverai.io',
    graphQL: {
      endpoint: 'graphql'
    },
  },
  security: {
    xsrf: {
      cookie: 'XSRF-TOKEN',
      header: 'X-XSRF-TOKEN'
    }
  },
  router: {
    tracing: {
      enabled: true
    }
  }
};
