import { Component,ViewChild } from '@angular/core';
import { NavController,ToastController,Nav,Events,App } from 'ionic-angular';


import { ActionsPage } from '../actions/actions';
import { ActionPublishPage } from '../action_publish/action_publish';
import { TeamsPage } from '../teams/teams';
import { TeamPublishPage } from '../teams_publish/team_publish';
import { BoardPage } from '../board/board';
import { BoardPublishPage } from '../board_publish/board_publish';
import { CalendarPage } from '../calendar/calendar';

import { LoginPage } from '../login/login';
import { AMapPage } from '../amap/amap';
import { MessagesPage } from '../messages/messages';
import { UserDetailEditPage } from '../user_detail_edit/user_detail_edit';

import { LocUserInfo } from '../../service/locUser';
import { UserGeoLocation } from '../../service/userGeoLocation';

import { ActionService } from '../../service/actionService';
import { ActionDetailPage } from '../action_detail/action_detail';
import { ProfilesPage } from '../profiles/profiles';
import { MyPage } from '../my/my';
declare var Bmob;

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  rootNav=this.appCtrl.getRootNav();
  // tab1Root = BoardPage  ;
  // tab2Root = ActionsPage;
  // tab3Root = TeamsPage;
  // tab4Root = CalendarPage;
  tab1Root = ActionsPage  ;
  tab2Root = ActionsPage;
  tab3Root = ProfilesPage;
  tab4Root = MyPage;

  newMessageNum=0;
  userDetailPlus={
    attributes:{
      tel:'',
      major:'',
      birthday:'1900-01-08 00:00:00',
      resume:'',
      headimg:''
    }
  }
  userInfo={
    attributes:{
      headImage:'',
      username:''
    }
  };
  quitFlag=false;
  admAction;
  admActionClosed=false;

  constructor(
    public navCtrl: NavController,
    private locUserInfo:LocUserInfo,
    private userGeoLocation:UserGeoLocation,
    private toastCtrl:ToastController,
    public events:Events,
    private actionService:ActionService,
    public appCtrl:App
  ) {
    //Bmob.initialize("d04defbb3e804cf2a0c3db43dab381fe", "1197eaa0cbdf4d44032ab3db79d5e829");//test
    Bmob.initialize("b1565b27d1578486250a8f02c3126c80", "0f54d06248533d16a00632ae79b1cf75");//user
    events.subscribe('user:login', (user, time) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('Welcome', user, 'at', time);
      this.getUserDetailPlus(user);
    });
  }
  openLoginPage(){
  	console.log('login page...');
  	this.navCtrl.push(LoginPage);
  }
  openMapPage(){
    console.log('map page...');
    this.navCtrl.push(AMapPage);
  }
  openBoardPublishPage(){
    console.log('open Board Publish Page...');
    this.navCtrl.push(BoardPublishPage);
  }
  openActionPublishPage(){
    console.log('open Action Publish Page...');
    this.navCtrl.push(ActionPublishPage);
  }
  openMessagesPage(){
    console.log('open MessagesPage...');
    this.navCtrl.push(MessagesPage);
  }
  openTeamPublishPage(){
    console.log('open TeamPublishPage...');
    this.navCtrl.push(TeamPublishPage);
  }
  autoLogin(){
    var thisPage=this;
    this.locUserInfo.autoLogin(function(user){
       thisPage.userInfo=user;
       thisPage.getUserDetailPlus(user);

    },function(user,error){
      thisPage.openLoginPage();
    });
  }
  getUserDetailPlus(user){
    let thisPage=this;
    thisPage.locUserInfo.getUserDetailPlus(user.attributes.username,function(userDetailPlus){
       thisPage.userDetailPlus=userDetailPlus;
       console.log('userDetailPlus',userDetailPlus);
       thisPage.getNewMessageCount();
     },function(error){

     });
  }
  logOut(){
    var thisPage=this;
    this.locUserInfo.clearLocUser(function(){
      thisPage.navCtrl.push(LoginPage);
      thisPage.userInfo={
        attributes:{
          headImage:'',
          username:''
        }
      };
    });
  }
  testLogin(){
    console.log('testLogin',this.userInfo.attributes.username);
    if(!this.userInfo.attributes.username){

      this.autoLogin();
    }
  }
  openUserDetailEditPage(){
    console.log('open TeamPublishPage...');
    this.navCtrl.push(UserDetailEditPage);
  }
  getNewMessageCount(){
    var thisPage=this;
    this.locUserInfo.countNewMessages('all',function(count){
      thisPage.newMessageNum=count;
      console.log('获取新消息总数',count);
      setTimeout(function(){
        thisPage.getNewMessageCount();
      },10000);
    },function(err){

    });
  }
  savePos2Loc(){
    //保存坐标位置到本地存储
    let thisPage=this;
    this.userGeoLocation.getUserLocation(function(pos){
      console.log('获取用户位置成功并存储到localstorage,10秒后更新',pos);
      setTimeout(function(){
        thisPage.savePos2Loc();
      },10000);
    },function(err){
      console.log('获取用户位置失败，10秒后重试',err);
      setTimeout(function(){
        thisPage.savePos2Loc();
      },10000);

    });
  }

  getAdmActions(){
    console.log('获取管理员公告活动');
    var thisPage=this;

    this.actionService.getAdmActions(function(res){
      if(res.length>0){
        thisPage.admAction = res[0];
      }
    },function(err){

    });
  }
  openActionDetailPage(action){
    this.rootNav.push(ActionDetailPage,{
      action:action
    });

  }

  ngOnInit(){
    this.autoLogin();
    this.savePos2Loc();//定时存储用户位置到本地存储，以便快速使用位置信息。
    this.getAdmActions();

  }



  /*ionViewCanLeave():boolean{
    let thisPage=this;
    console.log('ionViewCanLeave tabs',this.quitFlag);
    if(!this.quitFlag){
      let toast = this.toastCtrl.create({
        message: '再点一次退出Maker',
        duration: 3000
      });
      toast.present();
      this.quitFlag=true;
      setTimeout(function(){
        thisPage.quitFlag=true;
      },2000);
      return false;
    }else{
      return true
    }


  }*/
}
