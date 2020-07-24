import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AppConfigService {

  constructor() {
  }

  apiUrl() {
    const api = environment.api;
    return api.url;
  }

  graphQlUrl() {
    const api = environment.api;
    return `${ this.apiUrl() }/${ api.graphQL.endpoint }`;
  }
}
