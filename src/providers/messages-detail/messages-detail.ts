import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the MessagesDetailProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class MessagesDetailProvider {
  http : any;
  baseUrl : String;
  constructor(http: Http) {
    this.http = http;
    this.baseUrl ='../../assets/data/smg.json';
    console.log('Hello MessagesDetailProvider Provider');
  }

  getPosts() {
      return this.http.get(this.baseUrl )
        .map(res => res.json());
  }

}
