import { Component, OnInit, Input, ViewChild } from '@angular/core';
// import { MatMenuTrigger } from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() parent_current_user: any;
  @Input() parent_logged: any;
  @Input() parent_total_users: any;
  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor() {
    console.log('in header-constructor');
  }

  onHover() {
    // this.trigger.openMenu();
  }

  onLeave() {
    // this.trigger.closeMenu();
  }

  ngOnInit() {
    console.log('in header-ngOnInit');
  }

}
