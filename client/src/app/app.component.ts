import { Component, OnInit } from '@angular/core';
import { MainService } from './main.service';
import * as io from 'socket.io-client';
import { UserAuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  socket;
  constructor(private _mainService: MainService, private _auth: UserAuthService) {
      this.socket = io();             // he starts the socket from app root component, then assign it to service's socket
      this._auth.socket = this.socket;
      this.socket.on('online', (users) => {
        this._auth.update_loginusers(users.users);
      });
  }

  ngOnInit() {
    this._auth.autoAuthUser();
  }
}
