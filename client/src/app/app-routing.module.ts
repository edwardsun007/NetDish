import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

import { MainService } from './main.service';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

import { NewMenuComponent } from './new-menu/new-menu.component';
import { NewUserComponent } from './new-user/new-user.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { OrderHistoryComponent } from './order-history/order-history.component';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', pathMatch: 'full', component: LoginComponent},
  {path: 'new_menu', pathMatch: 'full', component: NewMenuComponent},
  {path: 'new_user', pathMatch: 'full', component: NewUserComponent},
  {path: 'update', pathMatch: 'full', component: UpdateUserComponent},
  {path: 'orderhistory/:id', pathMatch: 'full', component: OrderHistoryComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
