import { Component, OnInit } from '@angular/core';
import { MainService } from './../main.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  user;

  user_reg = {
    email: '',
    password: ''
  };

  password_confirm = {
    con: ''
  };

  error_message = {
    email: '',
  };

  constructor(private _service: MainService, private _router: Router) { }

  ngOnInit() {
    this.user = this._service.social_user;
    console.log(this.user);
  }

  update() {
    const data = {
      user: this.user,
      reg: this.user_reg
    };
    console.log('update-user->data', data);
    this._service.update_socialUser(data, (res) => {
      console.log(res);
      this._router.navigate(['/']);
    });
  }

}
