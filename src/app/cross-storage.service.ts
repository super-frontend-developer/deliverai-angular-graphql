import { Injectable } from '@angular/core';
const CrossStorageClient = require('cross-storage').CrossStorageClient;
const CrossStorageHub    = require('cross-storage').CrossStorageHub;

@Injectable({ providedIn: 'root' })
export class CrossStorageService {

  crossDomainItem: string;
  storage: any;

  constructor() {
    CrossStorageHub.init([
      { origin: /localhost:4200$/, allow: ['get', 'set', 'del', 'getKeys', 'clear'] },
      { origin: /localhost:4300$/, allow: ['get', 'set', 'del', 'getKeys', 'clear'] }
    ]);
    this.storage = new CrossStorageClient('http://localhost:4200/hub.html');

  }

  getTokenFromDomainLocalStorage() {
    this.crossDomainItem = this.storage.onConnect().then(() => {
      return this.storage.get('access-token');
    });
  }


}
