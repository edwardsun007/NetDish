import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { SocialUser } from 'angular4-social-login';
import { Router } from '@angular/router';
import { UserAuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})

export class MainService {
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();

  userId: string;
  social_user;
  data: Subject<any[]> = new Subject();
  // socket = null;
  // if_socket_disconnect = false;
  // login_users: Subject<any []> = new Subject();

  constructor(private _http: HttpClient, private _auth: UserAuthService) {
    // console.log(`service started... socket is ${this.socket} if_socket_disconnected=${this.if_socket_disconnect}`);

    // if (localStorage.userId !== undefined) {
    //   console.log(`localStorage.userId=${localStorage.userId}`);
    //   this.userId = localStorage.getItem('userId');
    //   console.log(`set MainService.userId from localStorage: ${this.userId}`);
    // }
    // tslint:disable-next-line:triple-equals
    if (localStorage.getItem('userId') != undefined) {
      console.log('localStorage.userId=', localStorage.getItem('userId'));
      this.userId = localStorage.getItem('userId');
    }

    if (localStorage.social_user !== undefined) {
      console.log(`localStorage.social_user=${localStorage.social_user}`);
      this.social_user = JSON.parse(localStorage.social_user); // parse into js object
    }
  }


  getDataUpdateListener() {
    console.log('start getDataUpdateListener');
    return this.data.asObservable();
  }

  // add a new user by admin
  add_new(userdata, callback) {
    this._http.post('http://localhost:8000/api/register', userdata).subscribe(
      (res) => {
        console.log('from service register: ', res);
        callback(res);
      },
      (err) => {
        console.log('from service add_new error: ', err);
      });
  }

  create_item(new_food, callback) {
    const postData = new FormData();
    postData.append('title', new_food.title);
    postData.append('price', new_food.price);
    postData.append('description', new_food.description);
    postData.append('image', new_food.image);
    console.log('after appending,postData=', postData);
    this._http.post('http://localhost:8000/api/foods', postData).subscribe(
      (res) => {
        console.log('from api create food: ', res);
        // callback(res);
      },
       (err) => {
         console.log('error from api create food: ', err);
      });
  }

  retrieveAllFood(callback) {
    this._http.get('http://localhost:8000/api/foods').subscribe((res) => {
      callback(res);
    });
  }

  place_order(order: any[], callback) {
    const userId = this._auth.getUserId();

    if (userId) {  // this.user
      // path, list of food
      this._http.post('http://localhost:8000/api/orders/' + userId, order).subscribe((res) => {
        callback(res);
      });
    } else if (this.social_user) {
      this._http.post('http://localhost:8000/api/orders/' + this.social_user._id, order).subscribe((res) => {
        callback(res);
      });
    }

  }

  check_user(social_user: SocialUser, callback) {
    console.log('check_user', social_user);
    this._http.post('http://localhost:8000/api/checkuser', social_user).subscribe((res) => {
      callback(res);
    });
  }

  update_socialUser(data, callback) {
    this._http.post('http://localhost:8000/api/social_update', data).subscribe((res) => {
      callback(res);
    });
  }

  /* for admin only */
  retrieveAllOrder(callback) {
    console.log('main->retrieveAllOrder starts');
    this._http.get('http://localhost:8000/api/getallorders').subscribe((res) => {
      callback(res);
    });
  }

  /* non-admin user */
  retrieveOrder(callback) {
       if (this.userId) {
          this._http.get('http://localhost:8000/api/orders/' + this.userId).subscribe( (res) => {
            console.log('main check api res:', res);
            callback(res);
          });
       } else if (this.social_user) {
        this._http.get('http://localhost:8000/api/orders/' + this.social_user._id).subscribe((res) => {
          console.log('main check api res:', res);
          callback(res);
        });
       }
  }

  like(food_id, callback) {
    console.log('main->like starts');
    if (this.userId) {
      console.log('like by common user:', this.userId);
      this._http.post('http://localhost:8000/api/like/' + this.userId + '/' + food_id, {}).subscribe(
        (res) => {
          callback(res);
        }, (err) => {
          callback(err);
        }
      );
    } else if (this.social_user) {
      this._http.post('http://localhost:8000/api/like/' + this.social_user._id + '/' + food_id, {}).subscribe(
        (res) => {
          callback(res);
        }, (err) => {
          callback(err);
        }
      );
    }
  }

  delete_food(id, callback) {
    console.log('main starts delete_food');
    this._http.delete('http://localhost:8000/api/deletefood/' + id, {}).subscribe((res) => {
      callback(res);
    });
  }
}
