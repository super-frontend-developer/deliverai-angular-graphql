import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppConfigService } from '@app/app-config.service';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { split } from 'apollo-link';
import { AuthService } from '@app/@core/services/auth/auth.service';

export function createApollo(appConfig: AppConfigService, httpLink: HttpLink, authService: AuthService) {

  const basic = setContext((operation, context) => ({
    headers: {
      Accept: 'charset=utf-8'
    }
  }));

  const token = localStorage.getItem('access-token');
  const auth = setContext((operation, context) => ({
    headers: {
      Authorization: `Bearer ${token}`
    },
  }));

  const ws = new WebSocketLink({
    uri: `wss://api.deliverai.io/subscriptions`,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: token,
      },
    }
  });

  const http = ApolloLink.from([basic, auth, httpLink.create({ uri: appConfig.graphQlUrl(), withCredentials: true })]);

  const link = split(({ query }) => {
    const { kind, operation }: any = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  }, ws, http);

  const cache = new InMemoryCache();

  return {
    link,
    cache
  };
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [ ApolloModule, HttpLinkModule ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [ AppConfigService, HttpLink ],
    },
  ],
})
export class GraphqlModule {
}
