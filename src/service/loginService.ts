import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';
let http=new HTTP();
@Injectable()
export class UserService {

  constructor(

  ) {

  }
  registUser(){

    http.get('http://baidu.com', {}, {}).then(data => {

        console.log(data.status);
        console.log(data.data); // data received by server
        console.log(data.headers);

      })
      .catch(error => {

        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);

      });
  }
}
