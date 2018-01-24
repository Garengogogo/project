import { Component } from '@angular/core';
import { NavController,App,ViewController , Events} from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ActionService } from '../../service/actionService';
import { ActionDetailPage } from '../action_detail/action_detail';
import { LocUserInfo } from '../../service/locUser';

@Component({
  selector: 'page-actions',
  templateUrl: 'actions.html'
})
export class ActionsPage {
  action: string = "allaction";
  lastValue : boolean = false;
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private actionService:ActionService,
    public viewCtrl:ViewController,
    public appCtrl:App,
    private locUserInfo:LocUserInfo,
    public events:Events
  ) {
    events.subscribe('actionDelete', (id) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      if(id) {
        this.selectedFriends(this.currentUser.attributes.segmentType)
      }
    });

  }
  actions=[];
  actionsCreate=[];
  actionsJoin=[];
  rootNav=this.appCtrl.getRootNav();
  currentUser={
    attributes:{
      username:'system',
      segmentType : 'default'
    }
  };
  jionedActIds=[];
  now;
  getActions(){
  	var thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "正在获取活动列表"
    });
    //loader.present();
    this.actionService.getActions(function(res){
      console.log(thisPage);
      thisPage.actions = [];
      thisPage.actions = res;
    	//loader.dismiss();
    },function(err){
    	//loader.dismiss();
    });
  }
  getActionsPulldown(){
    var thisPage=this;
    this.actionService.getActions(function(res, flag){
      console.log(thisPage);
      thisPage.actions = res;
      thisPage.lastValue = flag;
    },function(err){
    });
  }
  //上拉刷新
  doInfinite(infiniteScroll)
  {
    setTimeout(() => {
      // if(this.currentUser.attributes.segmentType == 'myaction'){
      //   this.getUserMakeAc();
      // } else if(this.currentUser.attributes.segmentType == 'joinaction') {
      //   //用户加入的活动
      //   this.getJoinedActions();
      // } else {
      //   this.getActionsPulldown();
      // }
      this.selectedFriends(this.currentUser.attributes.segmentType);
      infiniteScroll.complete();
    },500);
  }



  getJoinedActions(){
    this.now=new Date();
    let thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在获取加入的活动列表"
    });
    //loader.present();
    // this.actionService.getUserJoinedActionsIDs(this.currentUser.attributes.username,function(actIds){
    //   thisPage.jionedActIds=actIds;
    //   loader.dismiss();
    // },function(err){
    //   loader.dismiss();
    // })

    this.actionService.getUserJoinedActions(this.currentUser.attributes.username,true, function(actIds){
      thisPage.actionsJoin =[];
      thisPage.actionsJoin=actIds;
      //loader.dismiss();
    },function(err){
      //loader.dismiss();
    })
  }
  doRefresh(event){
  	var thisPage=this;
    //用户创建的活动
    if(this.currentUser.attributes.segmentType == 'myaction'){
      this.actionService.skipValueCreate = 0;
      this.getUserMakeAc();
      event.complete();
    } else if(this.currentUser.attributes.segmentType == 'joinaction') {
      //用户加入的活动
      this.actionService.skipValueJoin = 0;
      thisPage.getJoinedActions();
      event.complete();
    }
    else {
      //所有活动
      this.actionService.skipValue = 0;
      this.getActions();
      event.complete();
      // this.actionService.getActionsRefresh(function(res){
      //   thisPage.actions =[];
      //   thisPage.actions=res;
      //
      //   event.complete();
      //
      // },function(err){
      //
      //   event.complete();
      // });
    }


  }
  openActionDetailPage(action){
    console.log('openActionDetailPage...');
    console.log('viewCtrl：',this.viewCtrl);

    console.log('this.appCtrl',this.rootNav);

    this.rootNav.push(ActionDetailPage,{
      action:action
    });

  }

  getUserMakeAc() {
    //用户创建的活动
    let thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在获取创建的活动列表"
    });
   // loader.present();
    this.actionService.getUserMakedActions(this.currentUser.attributes.username,false,function(res){
      thisPage.actionsCreate =[];
      thisPage.actionsCreate=res;
     // loader.dismiss();
    },function(err){
     // loader.dismiss();
    });
  }
  //segmentChanged点击切换
  segmentChanged(ev){
    this.currentUser.attributes.segmentType = ev.value;
    console.log(ev)
    if(ev.value == 'myaction'){
      this.getUserMakeAc();
    } else if(ev.value == 'joinaction') {
      this.getJoinedActions();
    } else {
      this.getActions();
    }
  }
  selectedFriends(value) {
    if(value == 'myaction'){
      this.actionService.skipValueCreate += 2;
      this.getUserMakeAc();
    } else if(value == 'joinaction') {
      this.actionService.skipValueJoin += 2;
      this.getJoinedActions();
    } else {
      this.actionService.skipValue += 2;
      this.getActions();
    }
  }

  ionViewWillEnter(){
    let thisPage=this;
    // this.getActions();
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      // thisPage.getJoinedActions();
      thisPage.currentUser.attributes.segmentType = thisPage.action;
      if(thisPage.action == 'myaction'){
        thisPage.getUserMakeAc();
      } else if(thisPage.action == 'joinaction') {
        thisPage.getJoinedActions();
      } else {
        thisPage.getActions();
      }
    },function(err){

    });
  }

  ngOnInit(){

  }
}
