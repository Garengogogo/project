import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App,ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ActionService } from '../../service/actionService';
import { CalendarService } from '../../service/calendarService';
import { LocUserInfo } from '../../service/locUser';
import { ActionDetailPage } from '../action_detail/action_detail';

/**
 * Generated class for the CalendarDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-calendar-detail',
  templateUrl: 'calendar-detail.html',
})
export class CalendarDetailPage {

  actions=[];
  currentUser={
    id:'',
    attributes:{
      username:''
    },
    createdAt:''
  };
  isLogedIn=false;
  rootNav=this.appCtrl.getRootNav();
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public appCtrl:App,
              private calendarService:CalendarService,
              private locUserInfo:LocUserInfo,
              public alertCtrl: AlertController,
  ) {
  }
//进入活动详情
  openActionDetailPage(action){
    console.log('openActionDetailPage...');
    this.rootNav.push(ActionDetailPage,{
      action:action
    });
  }
  //开启提醒
  saveToLocEvent(action){
    let thisPage=this;
    this.calendarService.findEvent(action,function(info){
      if(info.length==0){
        thisPage.calendarService.createLocEvent(action);
        action.haveLocEvent=true;
      }else{
        console.log('存在该事件',info);
        action.haveLocEvent=true;
      }

    },function(err){
      console.log('查找事件出错',err);
      thisPage.calendarService.createLocEvent(action);
    });
  }
  //关闭提醒
  deleteLocEvent(action){
    let thisPage=this;
    this.calendarService.deleteEvent(action,function(info){
      console.log('删除事件成功');
    },function(err){
      console.log('删除事件出错',err);
      thisPage.calendarService.createLocEvent(action);
    });
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad CalendarDetailPage');
  }


  ionViewWillEnter(){
    var thisPage=this;
    this.actions=this.navParams.get('detailAction');

  //判断是否登录
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
    },function(obj,err){
      //用户未登录不可查看小组成员及留言
      thisPage.isLogedIn=false;
      let alert = thisPage.alertCtrl.create({
        title: '请先登录',
        subTitle: '登录后可查看和管理活动日程',
        buttons: [{
          text:'OK',
          handler:data =>{

          }

        }]
      });
      alert.present();
    });




  }

}
