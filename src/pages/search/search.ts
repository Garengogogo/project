import { Component } from '@angular/core';
import {NavController, NavParams,App } from 'ionic-angular';
import {SearchDetailPage} from 'ionic-angular';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  search: string = "myuser";
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public appCtrl:App,
  ) {
  }
    getItems(ev: any) {
        // Reset items back to all of the items
      //  this.initializeItems();

        // set val to the value of the searchbar
        let val = ev.target.value;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {

        }
    }

  rootNav=this.appCtrl.getRootNav();
  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }
  openSearchDetailPage(search){
    this.rootNav.push(SearchDetailPage,{
      search:search
    });
  }

}
