import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserAuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component ({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false; // disable spinner to do

  private authStatusSub: Subscription;

  password_confirm = {
    con: ''
  };

  error_message = {
    reg: '',
    login: ''
  };


  constructor(private _auth: UserAuthService, private _router: Router) {}

  ngOnInit() {
    this.authStatusSub = this._auth.getAuthStatusListener().subscribe(
      authStatus => {
        console.log('authStatus=', authStatus);
        this.isLoading = false;
      }
    );
  }

  login(form: NgForm) {
    this.isLoading = true; // start spin;
    const user_log = {
      email: form.value.email,
      password: form.value.password
    };

    const obs = this._auth.login(user_log);
    obs.subscribe(
      (res) => {
        const token = res.token;
        if (token) {
          const expiresInDuration = res.expiresIn;
          console.log('api returned expiresIn=', expiresInDuration);
          console.log('api returned userId=', res.userId);
          this._auth.setToken(res.token);
          this._auth.setAuthTimer(expiresInDuration);
          this._auth.setAuthStatus(true);
          console.log('_auth.isAuthenticated=', this._auth.getAuthStatus());
          // store userId in auth service ?
          this._auth.setUserId(res.userId);
          this._auth.setfirstName(res.first_name);
          this._auth.setlastName(res.last_name);
          this._auth.setEmail(res.email);
          this._auth.setAccess(res.admin); // set access level from here for now
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000); // argument: millionia secs
          console.log('login expirationDate = ', expirationDate);
          // fields should all got set now fire true to all components that listens !
          this._auth.setAuthStatusListener(true); // need to test this
          this._auth.saveAuthData(token, res.userId, expirationDate, res.first_name, res.last_name, res.email);
          // put token, expire, userId LocalStorage

          // call auth service connect to emmit login event
          const user = {
            _id: this._auth.getUserId(),
            first_name: this._auth.getfirstName(),
            last_name: this._auth.getlastName()
          };
          console.log('check login->user._id=', user._id);
          // emit login event by connect
          this._auth.connect(user);
          this._router.navigate(['/']);
        }
      }, (err) => {
      this.error_message.login = err.error.error;
    });
    // console.log('reset local vars');
    // this.user_log = {
    //   email: '',
    //   password: ''
    // };
  }

  register(form: NgForm) {
    this.isLoading = true; // start spin;

    const user_reg = {
      first_name: form.value.firstname,
      last_name: form.value.lastname,
      email: form.value.email,
      password: form.value.password
    };

    const obs = this._auth.register(user_reg);
    obs.subscribe(
      (res) => {
        if (res.message === 'success') {
          console.log('success block');
          // no login by default direct back to /
          // this._router.navigate(['/']);
        }
      }, (err) => {
        console.log('error from main service->register: ', err.error.error);
        this.error_message.reg = err.error.error;
      }
    );
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
