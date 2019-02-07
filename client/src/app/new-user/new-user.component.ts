import { Component, OnInit } from '@angular/core';
import { MainService } from './../main.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../auth.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  // current_user;
  userId: string;
  admin: boolean;

  new_user = {
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };

  error_message = {
    email: '',
    login: ''
  };

  password_confirm = {
    con: ''
  };

  constructor(private _service: MainService, private _router: Router, private _auth: UserAuthService) { }

  ngOnInit() {
    this.userId = this._auth.getUserId();
    this.admin = this._auth.checkAccess();
    // this.current_user = this._service.user;
    // if (localStorage.user == undefined || this.current_user.user_level != 9) {
    //   console.log(`no localStorage.user or userlevel is not 9,redirect back to root`);
    //   this._router.navigate(['/']);
    // }
  }

  add_new() {
    console.log(`from comp add_new(): ${this.new_user}`);
    this._service.add_new(this.new_user,
      (res) => {
        if (res.success === 'success') {
          this._router.navigate(['/']);
        } else {
          this.error_message.email = 'This email has been registered.';
        }
        this.new_user = {
          first_name: '',
          last_name: '',
          email: '',
          password: ''
        };
        this.password_confirm = {
          con: ''
        };
      });
  }

   /* create new item button */
   newItem() {
    this._router.navigate(['/new_menu']);
  }

  logout() {
    // this._service.logout();
    this._auth.logout();
    this._router.navigate(['/']);
  }

}
