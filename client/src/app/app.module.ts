import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { MainService } from './main.service';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- Import FormsModule
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NewMenuComponent } from './new-menu/new-menu.component';
import { NewUserComponent } from './new-user/new-user.component';
import { SocialLoginModule, AuthServiceConfig } from 'angular4-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angular4-social-login';
import { UpdateUserComponent } from './update-user/update-user.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { AgmCoreModule } from '@agm/core';
import { HeaderComponent } from './home/header/header.component';

import { LikeColorDirective } from './shared/likeColor.directive';  // likeColor directive
// angular material
import {
  MatInputModule,
  MatMenuModule, MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatSidenavModule
  } from '@angular/material';
// compare validator
import { CompareValidatorDirective } from './shared/compare-validator.directive';
import { AuthInterceptor } from './auth-interceptor';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('2198200572-um5ibn7tsibb2t1qtlal7pavle417anv.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('243611733233274')
  }
]);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NewMenuComponent,
    NewUserComponent,
    UpdateUserComponent,
    OrderHistoryComponent,
    HeaderComponent,
    CompareValidatorDirective,
    LikeColorDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    MatInputModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    SocialLoginModule.initialize(config),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBqIZ2Ze6BZ7HRCeiZnhF3MYtIs8qfBzqo'  // google cloud
    })
  ],
  providers: [MainService, {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  // multi must be true so that it doesn't overwrite original http interceptors
  bootstrap: [AppComponent]
})
export class AppModule { }
