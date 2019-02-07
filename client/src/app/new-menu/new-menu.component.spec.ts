import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMenuComponent } from './new-menu.component';

describe('NewMenuComponent', () => {
  let component: NewMenuComponent;
  let fixture: ComponentFixture<NewMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
