import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }      from './app/app.component';
import { provideRouter }     from '@angular/router';
import { routes }            from './app/app.routes';
import {
  provideHttpClient,
  withInterceptors
}                             from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { importProvidersFrom } from '@angular/core';

// Import your interceptors
import { authInterceptor }  from './app/auth.interceptor';
import { errorInterceptor } from './app/error.interceptor';
// import { ErrorInterceptor } from './app/error.interceptor';
// import { ErrorInterceptor } from './app/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    // Register both interceptors in the order you want them applied
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),

    importProvidersFrom(
      MatNativeDateModule
    )
  ]
});
