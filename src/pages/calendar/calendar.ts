import { Component } from '@angular/core';
import { NavController,App,ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ActionService } from '../../service/actionService';
import { CalendarService } from '../../service/calendarService';
import { LocUserInfo } from '../../service/locUser';
import { ActionDetailPage } from '../action_detail/action_detail';
import { CalendarDetailPage } from '../calendar-detail/calendar-detail';

@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html'
})
export class CalendarPage {

  eventSource;
  viewTitle;
  isToday:boolean;
  firstGo : string = 'first';
  calendar = {
    mode: 'month',
    currentDate: new Date(),
    allDayLabel : '待办事宜（天）',
    noEventsLabel : '暂无待办事宜'
  };
  currentUser={
    id:'',
    attributes:{
      username:''
    },
    createdAt:''
  };
  actions=[];
  detailAction={};
  isLogedIn=false;
   //falgFirst = false;
  //rootNav=this.appCtrl.getRootNav();

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private calendarService:CalendarService,
    private actionService:ActionService,
    private locUserInfo:LocUserInfo,
    public appCtrl:App
  ) {

  }

  loadEvents() {
    this.eventSource = this.createRandomEvents();
  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
     // this.navCtrl.push(CalendarDetailPage,{
     //   detailAction : [event.obj]
     // });
  }

  changeMode(mode) {
    this.calendar.mode = mode;
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  onTimeSelected(ev) {
    console.log(this.firstGo)
    if(this.firstGo == 'first'){
      this.firstGo = 'second';
    }else if(this.firstGo == 'second') {
      if((ev.events !== undefined && ev.events.length !== 0)) {
        //点击进入页面
        this.navCtrl.push(CalendarDetailPage,{
          detailAction : ev.events
        });
        this.firstGo = 'first';
      }
    }
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);

  }

  onCurrentDateChanged(event:Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  createRandomEvents() {
    var events = [];
    let thisPage=this;
    console.log(thisPage.actions);
    for(let value of thisPage.actions) {
      var dd : any = new Date(thisPage.locUserInfo.formatDateString(value.attributes.beginDateTime));
      if(dd.getHours()== "00" && dd.getMinutes()== "00" ) {
        events.push(
          {
            title: value.attributes.title,
            startTime: new Date(thisPage.locUserInfo.formatDateString(value.attributes.beginDateTime)),
            endTime: new Date(thisPage.locUserInfo.formatDateString(value.attributes.beginDateTime)),
            allDay: true,
            obj : value
          }
        );
      }else {
        events.push(
          {
            title: value.attributes.title,
            startTime: new Date(thisPage.locUserInfo.formatDateString(value.attributes.beginDateTime)),
            endTime: new Date(thisPage.locUserInfo.formatDateString(value.attributes.beginDateTime)),
            allDay: false,
            obj : value
          }
        );
      }

    }

    return events;
  }

  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }

  markDisabled = (date:Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  };

  getMyActions(){
    let thisPage=this;
    let alert = thisPage.alertCtrl.create({
      title: '获取日程失败',
      subTitle: '请稍候再试',
      buttons: [{
        text:'OK',
        handler:data =>{

        }

      }]
    });
    this.actionService.getUserMakedActions(thisPage.currentUser.attributes.username,false,function(myActions){
      console.log('我发布的活动',myActions);
      thisPage.actionService.getUserJoinedActions(thisPage.currentUser.attributes.username,false,function(joinedActions){
        console.log('我参加的活动',joinedActions);
        thisPage.actions=myActions.concat(joinedActions);
        //thisPage.sortActionByBeginDate();
        console.log('我的所有活动',thisPage.actions);
        thisPage.actions.sort(function(a,b):any{
          let aD=new Date(thisPage.locUserInfo.formatDateString(a.attributes.beginDateTime));
          let bD=new Date(thisPage.locUserInfo.formatDateString(b.attributes.beginDateTime));
          return aD>bD;
        });
        // thisPage.getActionsLocEvent();
        for(var i=0 ;i<thisPage.actions.length;i++){
          thisPage.saveToLocEvent(thisPage.actions[i]);
        }
        console.log('我的所有活动',thisPage.actions);
        thisPage.loadEvents();

      },function(err){
        alert.present();
      })
    },function(err){
      alert.present();
    });
  }







  ionViewWillEnter(){
    var thisPage=this;
    this.firstGo = 'first';
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      thisPage.getMyActions();
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



  ngOnInit(){

  }
}
