import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { UntilDestroy } from '@ngneat/until-destroy';
import { environment } from '@environments/environment';

export const AUTH_TOKEN_STORAGE = new InjectionToken('AUTH_TOKEN_STORAGE');
export const AUTH_TOKEN_STORAGE_KEY = new InjectionToken('AUTH_TOKEN_STORAGE_KEY');

export interface AuthToken {
  type: string;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
}

@UntilDestroy({ arrayName: 'subscriptions' })
@Injectable({ providedIn: 'root' })
export class AuthService {

  localStorageItem: string;
  crossDomainItem: string;
  storage: any;

  private readonly tokenSubject: BehaviorSubject<AuthToken>;

  private readonly subscriptions = [];

  constructor(private http: HttpClient,
              @Inject(AUTH_TOKEN_STORAGE) storage: Storage,
              @Inject(AUTH_TOKEN_STORAGE_KEY) storageKey: string) {

    const existingTokenStr = storage.getItem(storageKey);
    const existingToken = existingTokenStr != null ? JSON.parse(existingTokenStr) : null
    this.tokenSubject = new BehaviorSubject<AuthToken>(existingToken)

    this.subscriptions.push(
      this.token$.subscribe(token => {
        const tokenStr = token != null ? JSON.stringify(token) : null;
        return storage.setItem(storageKey, tokenStr);
      })
    );
  }

  get token$() {
    return this.tokenSubject.asObservable()
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.token$.pipe(map(t => t != null))
  }

  login$(email: string, password: string, rememberMe: boolean): Observable<AuthToken> {
    const requestBody = {
      email,
      password,
      remember_me: rememberMe
    };

    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    return this.http.post<any>(`${environment.api.url}/login`, requestBody, { headers })
      .pipe(
        map(body => _.mapKeys(body, (value, key) => _.camelCase(key))),
        map(body => body as AuthToken),
        tap(token => {
          localStorage.setItem('access-token', token.accessToken);
          this.tokenSubject.next(token);
        })
      )
  }

  logout$(): Observable<void> {
    localStorage.setItem('businessId', '');
    localStorage.setItem('businessName', '');
    localStorage.setItem('storeId', '');
    localStorage.setItem('storeName', '');
    localStorage.setItem('storeIds', '');
    localStorage.setItem('access-token', null);
    localStorage.setItem('avatar', '');
    return defer(() => this.tokenSubject.next(null));
  }
}
