import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appClickColor]'
})

export class LikeColorDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click') onclick() {
    console.log('likeColor->directive->onClick');
    if (this.el.nativeElement.style.color === 'gold') {
      return; // do nothing
    } else {
      this.el.nativeElement.style.color = 'gold';
    }
  }
}

/* if its not gold color, then set color to gold for clicked button only -- works with directive
backend notes:
  user not authenticated should not be able to like--works
*/
