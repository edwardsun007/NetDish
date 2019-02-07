import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { UserAuthService } from './auth.service';
import { Injectable } from '@angular/core';
/* for outgoing request */

@Injectable()  // empty injectable means that other service can be injected into this .ts file !
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _auth: UserAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this._auth.getToken();
    const authRequest = req.clone({  // clone to make a copy of the original request before we make change to it
      headers: req.headers.set('Authorization', 'Bearer ' + authToken)
      // he said set overwrite the old header if it exists, otherwise it creates new one
    });
    return next.handle(authRequest);
  }
}
