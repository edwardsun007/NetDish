import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})

export class UserAuthService {
  login_users: Subject<any []> = new Subject();
  private online_users_state: any[];
  socket: SocketIOClient.Socket;
  private if_socket_disconnect: SocketIOClient.Socket;

  private isAuthenticated = false; // init as unauthenticated because post-list doesn't get updated userAuthenticated status and
  private token: string;
  private tokenTimer: any; // for token expiresIn timing
  private userId: string;  // for frontend authorization
  private firstName: string;
  private lastName: string;
  private email: string;
  private admin: boolean;

  private authStatusListener = new Subject<boolean>();  // Subject usually are used for things that can change overtime
  // token should be cleared after logout for example
  // authStatusListener will push new info to Component that subscribe it when there is change
  // here set it to boolean type, because Header doesn't need to consume the actual token header only need to know
  // whether there is a token
  constructor(private _http: HttpClient, private router: Router) {
    // this.socket = io('http://localhost:8000');
  }

  register(userreg) {
    console.log('start main->register...');
    return this._http.post<{message: string, user: any}>('http://localhost:8000/api/register', userreg);
  }

  login(userdata) {
    // console.log(userdata);
    return this._http.post<{first_name: string, last_name: string, email: string, token: string,
                            expiresIn: number, userId: string, admin: boolean}>
                            ('http://localhost:8000/api/login', userdata);
  }

  logout() {
    this.userId = null;
    this.token = null;
    this.firstName = null;
    this.lastName = null;
    this.email = null;
    this.admin = false;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer); // delete timer

  }


   /* _id, first_name, last_name for all case !*/
  connect(user) {
    this.socket.emit('login', {user: user});
  }

  update_loginusers(users) {
    this.online_users_state = users; // testing with private variable as state;
    this.login_users.next(users); // users array
  }

  /* created this method so that token retrieved in this service can be used by outer service */
  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  getOnlineUsers() {
    return this.online_users_state;
  }

  getAuthStatus() {
    return this.isAuthenticated;
  }

  setAuthStatus(status: boolean) {
    this.isAuthenticated = status;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getOnlineUsersListener() {
    return this.login_users.asObservable();
  }

  setAuthStatusListener(status: boolean) {
    this.authStatusListener.next(status);
  }

  /* get and set fields */
  getUserId() {
    return this.userId;
  }

  /* looks not safe */
  setUserId(userId: string) {
    this.userId = userId;
  }

  getfirstName() {
    return this.firstName;
  }

  setfirstName(firstName: string) {
    this.firstName = firstName;
  }

  getlastName() {
    return this.lastName;
  }

  setlastName(lastName: string) {
    this.lastName = lastName;
  }

  getEmail() {
    return this.email;
  }

  setEmail(email: string) {
    this.email = email;
  }

  checkAccess() {
    return this.admin;
  }

  setAccess(admin: boolean) {
    this.admin = admin;
  }

  /* consider this safe as field is private */
  getTokenTimer() {
    return this.tokenTimer;
  }

  setAuthTimer(duration: number) {
      this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);  // convert to ms
  }

  /* careful with this */
  hasAccess(userId: string) {
    // (`http://localhost:3000/api/accesslevel/${id}`)
    return this._http.get<{admin: boolean}>('http://localhost:8000/api/accesslevel/' + userId);
  }

  private getAuthData() {
    const token = localStorage.getItem( 'token' );
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const firstname = localStorage.getItem('firstname');
    const lastname = localStorage.getItem('lastname');
    const email = localStorage.getItem('email');
    if (expirationDate && token) {
      return {
        token: token,
        expirationDate: new Date(expirationDate),
        userId: userId,
        firstname: firstname,
        lastname: lastname,
        email: email
      };
    } else {
      return;
    }
  }

  /* automatic authenticate user with token found in localStorage */
  autoAuthUser() {
    const autoAuthInfo = this.getAuthData();
    if (!autoAuthInfo) { // only proceed if there is auth Info
        // this.router.navigate(['/login']);
        return; // stops here
    } else {
      // check if token expires or not
      const now = new Date();
      const expiresIn = autoAuthInfo.expirationDate.getTime() - now.getTime();
      if (expiresIn > 0) {

        this.token = autoAuthInfo.token;
        this.isAuthenticated = true;
        this.userId = autoAuthInfo.userId;
        this.firstName = autoAuthInfo.firstname;
        this.lastName = autoAuthInfo.lastname;
        this.email = autoAuthInfo.email;
        this.setAuthTimer(expiresIn /  1000); // in secs
        this.authStatusListener.next(this.isAuthenticated);

        const obs = this.hasAccess(this.userId);
        obs.subscribe(
          res => {
            this.admin = res.admin;
          }
        );

        // test
        console.log('autoAuth call connect(user)');
        const user = {
          _id: this.userId,
          first_name: this.firstName,
          last_name: this.lastName
        };
        this.connect(user); // { _id, first_name, last_name }
      } else {
        console.log (' token has expired! ');
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    }
  }

  /*
  Save AuthData: save Token and expiration Data into browser
  payload in token: firstname, lastname, userId, email
  */
  saveAuthData(token: string, userId: string, expiresDate: Date, firstname: string, lastname: string, email: string ) {
      console.log('authService->saveAuthData');
      localStorage.setItem('token', token);  // setItem(key, value)
      localStorage.setItem('expiration', expiresDate.toISOString());
      localStorage.setItem('userId', userId);
      localStorage.setItem('firstname', firstname);
      localStorage.setItem('lastname', lastname);
      localStorage.setItem('email', email);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    localStorage.removeItem('email');
  }


}
