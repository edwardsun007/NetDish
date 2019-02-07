import { Component, OnInit } from '@angular/core';
import { MainService } from './../main.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'angular4-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angular4-social-login';
import { UserAuthService } from '../auth.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})

export class OrderHistoryComponent implements OnInit {
  current_user;
  order_admin: boolean;
  orders = [];

  constructor(private _service: MainService, private _router: Router, private _socialAuth: AuthService, private _auth: UserAuthService) { }

  ngOnInit() {

    if (this._service.social_user !== undefined) {   // copy from social user
      this.current_user = this._service.social_user;
      console.log('1-social user', this.current_user);
    }  else {
      //  initial object as non-social user
      this.current_user = {
        first_name: localStorage.getItem('firstname'),
        last_name: localStorage.getItem('lastname'),
        email: localStorage.getItem('email'),
        _id: localStorage.getItem('userId')   // match with social_user._id
      };

      // retrieve access level info from auth service 1st
      this.order_admin = this._auth.checkAccess();
      console.log('2 non-social user:', this.current_user);
    }

    if ( this.order_admin || (this.current_user.user_level !== undefined && this.current_user.user_level === 9) ) {
          console.log('admin can see all orders');
          this._service.retrieveAllOrder( (res) => {
              this.orders = res;
              console.log(res);
          });
    } else { // user_level = 0 || this.admin = 0
           console.log('common user find his order only');
           this._service.retrieveOrder( (res) => {
               this.orders = res;
          });
    }
    // if (this.current_user.user_level == 0) {
    //   this._service.retrieveOrder( (res) => {
    //     this.orders = res;
    //   })
    // } else {
    //   this._service.retrieveAllOrder( (res) => {
    //     this.orders = res;
    //     console.log(res);
    //   })
    // }

  }

  signOut() {
    if (this._service.social_user !== undefined) {
      console.log(1);
      this._auth.logout();
      this._socialAuth.signOut();
      this._router.navigate(['']);
    }

    // how to differentiate social_user from non-social-login user ??
    // if (this._service.user !== undefined) {
    if (this._auth.getUserId() !== undefined) {
      console.log(2);
      this._auth.logout();
      this._router.navigate(['']);
    }

  }

}
