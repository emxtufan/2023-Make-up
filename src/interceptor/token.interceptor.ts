import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenService } from 'src/Service/token.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private token : TokenService) { }
    tokens:any
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       // adaugă antetul de autentificare cu jwt dacă contul este autentificat și cererea este către adresa URL a API
      
       const isExpire = this.token.verifyToken()

      const tokenClient = this.token.getTokenLocalStorage() 
      const tokenAdmin = this.token.getTokenLocalStorageAdmin()

      if (tokenClient == null) {
        this.tokens = tokenAdmin
      }else{
        this.tokens = tokenClient
      }


      if (this.tokens != null) {
        let clone = request.clone({
          setHeaders: { Authorization: `Bearer ${this.tokens}` , Range: 'bytes=0-'}
      });

      return next.handle(clone).pipe(
        catchError(error=>{
          if (error.status == 401) {
              this.token.deleteToken()
          }
          return throwError(error.error.message)
        })
      )
      }
        return next.handle(request);
    }
}
