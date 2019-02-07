import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if ( typeof(control.value) === 'string' ) {
    // of is a quick and easy way to emit object in rxjs
    return of(null); // when its string , this means its valid to us developer, so we simply want the validator to be valid.
  }

  const file = control.value as File;
  const fileReader = new FileReader();

  // we created our own Observable here
  const frObs = Observable.create((observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => { // equivalent to fileReader.onloadend = () => { do something }
        const arr = new Uint8Array(<ArrayBuffer>fileReader.result).subarray(0, 4);
        let header = '';
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        switch (header) {
          case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        if (isValid) {
          observer.next(null); // is file valid, emit null / return null, null means valid
        } else {
          observer.next({ invalidMimeType: true }); // true means invalid
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return frObs;
};
