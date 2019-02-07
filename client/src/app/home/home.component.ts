import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainService } from './../main.service';
import { Router, Event } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'angular4-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angular4-social-login';
import { SocialUser } from 'angular4-social-login';
import { JsonPipe } from '@angular/common';
import { UserAuthService } from '../auth.service';
import { Subscribable, Subscription } from 'rxjs';
import { filterQueryId } from '@angular/core/src/view/util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {
  isLoading = true;
  userIsAuthenticated: boolean;

  private authStatusSub: Subscription;
  private onlineUserSub: Subscription;
  private admin = false;

  /* non-social user login */
  private current_user = {
    _id: '',
    first_name: '',
    last_name: '',
    email: ''
  };

  all_foods;
  /* for check out */
  total_items: any[];
  cur_subtotal: number;
  total_for_display: string;
  item = null;

  socialUser: SocialUser;   // from angular4-social-login package, you receive SocialUser object when user login, null when user log out
  loggedIn: boolean;
  imageurl = 'https://botw-pd.s3.amazonaws.com/styles/logo-original-577x577/s3/0010/8217/brand.gif'; // pandaExpress nextby user name
  socket;
  total_login_user = [];
  // tslint:disable-next-line:no-inferrable-types
  lat: number = 37.335480;
  // tslint:disable-next-line:no-inferrable-types
  lng: number = -121.893028;
  // tslint:disable-next-line:no-inferrable-types
  zoom: number = 12;

  constructor(private _service: MainService, private _auth: UserAuthService,
              private _socialAuth: AuthService, private _router: Router) { }

  ngOnInit() {

    this.socket = this._auth.socket;    // socket was the one in main, I moved socket to auth service
    this.cur_subtotal = 0;
    this.total_items = []; // checkbox fields start with default

    this._auth.autoAuthUser();
    this._socialAuth.authState.subscribe((user) => {
      this.loggedIn = (user != null); // loggedIn set to True if user object is not null

      if (user != null) {
        this.userIsAuthenticated = true; // SET TO Authenticated
        this.imageurl = user.photoUrl;
        this._service.social_user = user;
        this._service.check_user(user, (res) => { // call check_user to verify its existing using registered with us
          if (res.message === 'yes') {
            this._service.social_user = res.user; // if verify OK, then set social_user instance on service as the user we found
            localStorage.social_user = JSON.stringify(res.user);
            // _id save to localStorage.social_user
            // convert JSON string to javascript object using JSON.parse()
            // store found.user as JSON string to localStorage object called social_user
            this.current_user = res.user; // update current_user
            this._auth.connect(res.user); // emit login event with this user's id, first and last name
          } else if (res.message === 'none') {
            console.log(res);
            this._router.navigate(['/update']);
          }
        });
      }
    });


    // during init, every time get auth status from Auth, if its true, try retrieve these info from localStorage
    this.userIsAuthenticated = this._auth.getAuthStatus();
    if ( this.userIsAuthenticated === true) {
              this.current_user.first_name = localStorage.getItem('firstname');
              this.current_user.last_name = localStorage.getItem('lastname');
              this.current_user.email = localStorage.getItem('email');
              this.current_user._id = localStorage.getItem('userId');
    }

    // subscribe for any change on auth status from the listener in Auth service
    this.authStatusSub = this._auth.getAuthStatusListener() // can this
      .subscribe(
          isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;

      });

    // determine user access level
    if (this.userIsAuthenticated && this.current_user._id !== '') {

      const obs = this._auth.hasAccess(this.current_user._id);
      obs.subscribe(
        res => {
          this.admin = (res.admin) ? true : false;
        }
      );
    }

    this.getAllFoodFromService();

    /* update Online Users drop down */
    this.onlineUserSub = this._auth.getOnlineUsersListener()
      .subscribe( (users) => {

        this.total_login_user = users;

      });

    /* updateLike event handler, emitter down below */
    this.socket.on('updatelike', function (data) { // data = null

      this.getAllFoodFromService();
    }.bind(this));

    this.isLoading = false;
  }

  signIn() {
    this._router.navigate(['/login']);
  }

  signInWithGoogle(): void {
    this._socialAuth.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFB(): void {
    this._socialAuth.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {

    this.socket.emit('logout', { user: this.current_user });
    if (this.loggedIn === true) { // social user
      this._socialAuth.signOut();
      localStorage.removeItem('social_user');
      this.current_user = null;
      this._auth.logout();
    } else {
      console.log('signOut 2 - nonsocial');
      this._auth.logout();
      this.current_user = null;
    }
  }

  /* getFoodFromService */
  getAllFoodFromService() {

    this._service.retrieveAllFood((res) => {
      res.data.map((food) => {
        return food.quantity = null;
      }); // return ele.quantity = null
      this.all_foods = res.data;
    });
  }

  /* add button */
  addItem(food) { // quantity, price

    // console.log(typeof(quantity));
    const copy_food = Object.assign({}, food);

    const added_quan = parseInt(copy_food.quantity, 10);

    const added_cost = added_quan * parseFloat(copy_food.price);

    let exists = false;
    for ( let i = 0; i < this.total_items.length; i++) {
      if ( copy_food._id === this.total_items[i]._id ) {
        exists = true;
        const curQuan = parseInt(this.total_items[i].quantity, 10);
        const newQuan = curQuan + added_quan;

        this.total_items[i].quantity = newQuan;
      }
    }

    if ( !exists ) {
      this.total_items.push(copy_food); // push copied object
    }

    // update subtotal
    this.cur_subtotal += added_cost;

    this.total_for_display = this.cur_subtotal.toFixed(2);
  }

  /* del button in checkout box*/
  delItem(_id) {
    // -1 == 0 its gone,
    let idx = null;
    let remove_cost = 0;
    for (let i = 0; i < this.total_items.length; i++) {
      if (_id === this.total_items[i]._id) {
        this.total_items[i].quantity -= 1;
        remove_cost = 1 * parseFloat(this.total_items[i].price);
        this.cur_subtotal -= remove_cost;
        console.log('this.item.quantity after -1=', this.total_items[i].quantity);
        console.log('this.cur_subtotal after remove=', this.cur_subtotal);
        // here check if its 0
        if (this.total_items[i].quantity === 0) {
          idx = i;
        }
      }
    }
    // splice will reindex array and change length;
    if (idx !== null) {
      this.total_items.splice(idx, 1);
    }
    // display
    this.total_for_display = this.cur_subtotal.toFixed(2);
  }

  /* checkout box submit */
  place_order() {
    /* unAuthenticated user should not place order */
    console.log('start home->place_order()');
    console.log(this.userIsAuthenticated);
    if (this.userIsAuthenticated === false && this.loggedIn === false) {
      console.log('go to login now...');
      this._router.navigate(['/login']);
    } else {
      let summary = '';

      for (let i = 0; i < this.total_items.length; i++) {
        summary += this.total_items[i].quantity + ' ' + this.total_items[i].food_name + ';'; // 10  friedchicken;
      }

      const sure = confirm('Your order summary: ' + summary + '\nTotal due today is: $' + this.total_for_display +
      '.\nClick Okay to Checkout.');
      // pop up confirm window
      if (sure === true) {
        this._service.place_order(this.total_items, (res) => {
          console.log(res);
        });
        // this.total_item = [];
        // this._mainSrv.data = null;
      } else {
        this.total_items = [];
      }
    }

  }


  /*remove item from the menu*/
  delete_item(_id, food_name) {
    const sure = confirm(`Are you sure you want to delete this item from menu: ${food_name} ?` );
    if (sure === true) {
      console.log('call service delete_food');
      this._service.delete_food(_id, (res) => {
        console.log(res);
        this.getAllFoodFromService();
      });
    }
  }

  // foodLikes = array of user id
  like(_foodid, _foodLikes) {
    if (this.userIsAuthenticated === false && this.loggedIn === false) {
      this._router.navigate(['/login']);
    } else {
      // if this user already like the food
      const liked = _foodLikes.find(
        (uid) => {
          return uid === this.current_user._id;
        });
      if ( liked !== undefined ) { // already liked
        console.log('Your already liked this!');
        return;
      } else { // like undefined
        this._service.like(_foodid, (res) => {
          if (res.error) {
            console.log('API like returned error:', res.error);
          } else {
            console.log(res);
            this.socket.emit('updatelike', {});
          }
        });
      }
    }
  }

  /* create new item button */
  newItem() {
    this._router.navigate(['/new_menu']);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.onlineUserSub.unsubscribe();
  }

}
