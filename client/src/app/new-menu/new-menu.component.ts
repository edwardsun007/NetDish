import { Component, OnInit } from '@angular/core';
import { MainService } from './../main.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from './mime-type.validator'; // our own validator

@Component({
  selector: 'app-new-menu',
  templateUrl: './new-menu.component.html',
  styleUrls: ['./new-menu.component.css']
})
export class NewMenuComponent implements OnInit {
  // current_user;
  userId: string;
  private admin: boolean;

  form: FormGroup; // instance for the new menu form only
  imagePreview: string;

  image;
  input = new FormData();

  constructor(private _service: MainService, private _router: Router, private _auth: UserAuthService) { }

  new_food = {
    title: '',
    price: '',
    description: '',
    image: null,
  };

  ngOnInit() {
    // this.current_user = this._service.user;
    this.userId = this._auth.getUserId();
    console.log('this.userId=', this.userId);

    this._auth.hasAccess(this.userId).subscribe(
      (res) => {
          console.log('new-menu compo ngOnInit hasAccess res:', res);
          this.admin = (res.admin) ? true : false;
          console.log('this.admin = ', this.admin);
      });

    /* reactive form, initialize our form */
    const pricePattern = /^\d+(\.\d{0,2})*$/;
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(5)], updateOn: 'blur' }),
      price: new FormControl(null, {validators: [Validators.required, Validators.pattern(pricePattern)], updateOn: 'blur'}),
      desc: new FormControl(null, {validators: [Validators.required], updateOn: 'blur'}),
      image: new FormControl(null,
          {
            validators: [Validators.required],
            asyncValidators: [mimeType]
          })
    });
  }

  onImagePicked(event: Event) {
    // extract the file user uploaded
    const file = (event.target as HTMLInputElement).files[0];
    // convert event.target to HTMLInputElement type so that typescript recognizes it
    // files is array, 0 index is the one user selected
    this.form.patchValue({image: file});
    // store the extracted file in image formControl
    this.form.get('image').updateValueAndValidity();
    // tell angular the value changed and it should
    // check and store the new value and validate it
    const reader = new FileReader();
    reader.onload = () => {  // async code , we use callback function onload
       this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file); // once done read the file,
  }

  // onFileChange(event) {
  //   console.log(`new menu comp->onFileChange() called...`);
  //   let reader = new FileReader();
  //   if (event.target.files && event.target.files.length > 0) {
  //     console.log(`event.target.files=${event.target.files}`);
  //     let file = event.target.files[0]; // this is the one uploaded recently
  //     this.new_food.image = file;
  //     reader.onload = () => {
  //       this.new_food.image = reader.result;
  //       // format of result depend on which read method would be used
  //     };
  //     reader.readAsDataURL(file); // The result is a string with a data: URL representing the file's data.
  //   }
  // }

  createFood() {
    const new_food = {
      title: this.form.value.title,
      price: this.form.value.price,
      description: this.form.value.desc,
      image: this.form.value.image
    };

    console.log('new_food.description=', new_food.description);
    this._service.create_item( new_food, (res) => {
      // console.log('res.food=', res.food);
    });
    // this._service.create_item(this.new_food, (res) => {
    //   console.log('res.food=', res.food);
    //   // this.image = res[0].image;
    //   // this._router.navigate(["/"]);
    // });

    this.form.reset();
  }


}
