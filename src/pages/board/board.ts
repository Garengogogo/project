import { Component } from '@angular/core';
import { NavController,App,ViewController } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { BoardService } from '../../service/boardService';
import { BoardCommentPage } from '../board_comment/board_comment';
import { BoardPublishPage } from '../board_publish/board_publish';
import { UserDetailPage } from '../user_detail/user_detail';
import { LocUserInfo } from '../../service/locUser';
import { UserGeoLocation } from '../../service/userGeoLocation';

@Component({
  selector: 'page-board',
  templateUrl: 'board.html'
})
export class BoardPage {
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private boardService:BoardService,
    public viewCtrl:ViewController,
    public appCtrl:App,
    private locUserInfo:LocUserInfo,
    private UserGeoLocation:UserGeoLocation
  ) {

  }
  private time: any;
  // 时间差
  private _diff : any;
  private get diff() {
    return this._diff;
  }
  private set diff( second_time ){
       this._diff = second_time/1000;
  this.time = Math.floor(this._diff) + "秒";
  if( Math.floor(this._diff )> 60){

    var second = Math.floor(this._diff) % 60;
    var min = Math.floor(this._diff / 60);
    this.time = min + "分" + second + "秒";

    if( min > 60 ){
      min = Math.floor(this._diff / 60) % 60;
      var hour = Math.floor( Math.floor(this._diff / 60) /60 );
      this.time = hour + "小时" + min + "分" + second + "秒";

      if( hour > 24 ){
        hour = Math.floor( Math.floor(this._diff / 60) /60 ) % 24;
        var day = Math.floor( Math.floor( Math.floor(this._diff / 60) /60 ) / 24 );
        this.time = day + "天" + hour + "小时" + min + "分" + second + "秒";
      }
    }
  }
}
  // 定时器
  private timer;
  boards=[];
  wd : any;
  jd :any;
  rootNav=this.appCtrl.getRootNav();
  getBoards(){
  	var thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "正在获取板子列表"
    });
    loader.present();
    this.boardService.getBoards(function(res){
    	thisPage.boards=res;
    	loader.dismiss();

    },function(err){
    	loader.dismiss();
    });
  }

  //距离三公里之内的板子
  getThree() {
    var thisPage=this;
       this.UserGeoLocation.getUserLocation(function (weidu ,jingdu) {
         console.log(weidu);
         thisPage.wd = weidu;
         thisPage.jd = jingdu;
         console.log(jingdu);
         for (let item of thisPage.boards) {
           let three =  thisPage.UserGeoLocation.getDistance(item.attributes.location.latitude ,item.attributes.location.longitude, thisPage.wd, thisPage.jd);
           // item.three = three;
           if(three < 1) {
             item.three = three * 1000;
             item.one = false;
           }else {
             item.three = three;
             item.one = true;
           }

           console.log(three)
         }

       }, function (err) {
       });

  };

  doRefresh(event){
  	var thisPage=this;

  	/*this.boardService.getBoards(function(res){
    	thisPage.boards=res;
    	event.complete();

    },function(err){

    	event.complete();
    });*/

    this.getBoardsPlus(function(){
      event.complete();
    });

  }
  ionViewWillEnter(){
  	//this.getBoards();
    this.getBoardsPlus(function(){

    });
  }

  openBoardCommentPage(board){
    console.log('openBoardCommentPage...');
    console.log('viewCtrl：',this.viewCtrl);

    console.log('this.appCtrl',this.rootNav);
    this.rootNav.push(BoardCommentPage,{
      board:board
    });




  }
  //点击title进入详情
  openBoardDetail(board){
    console.log('openBoardDetail...');
    this.rootNav.push(BoardCommentPage,{
      board:board
    });

  }
  //点击用户名进入用户名详情
  openBoardUserDetail(board){
    console.log('openBoardUserDetail...'+ board);
    this.rootNav.push(UserDetailPage,{
      userName:board.attributes.userName
    });

  }

  //获取本地板子-->获取板子--> 存储到本地 --> 从本地获取板子数据
  getBoardsPlus(thenCallback){

    var thisPage=this;
    var lastTimestamp=0;
    var now=new Date();
    now.setDate(now.getDate()-3);
    lastTimestamp=Date.parse(now.toString());
    thisPage.boardService.getBoardsFromDate(lastTimestamp,function(lastBoards){
      // var allBoards=lastBoards.concat(thisPage.boards);
      var allBoards=lastBoards;
      thisPage.boards=lastBoards;
      thisPage.getThree();
      //countdown倒计时
      thisPage.timer = setInterval(() => {
        let todaTime = new Date();
        for (let a of thisPage.boards) {

          //let myDate = new Date(a.createdAt);
          let myDate = new Date(thisPage.locUserInfo.formatDateString(a.createdAt));
          a.countdown = ((myDate.getTime() + 3*24*60*60*1000) - todaTime.getTime());
          if(a.countdown > 0) {
            a.countdown = ((myDate.getTime() + 3*24*60*60*1000) - todaTime.getTime());
          } else {
            a.countdown = 0;
          }
          //console.log(a.countdown + "countdowncountdowncountdown")
          thisPage.diff = a.countdown;
          thisPage.diff = a.countdown;
          a.time = thisPage.time;
        }

      }, 1000);



      thisPage.locUserInfo.setLocData('boards',allBoards,function(val){
        //存储板子到本地成功
        console.log('存储板子到本地成功');
      });
      thenCallback();
    },function(err){
      thenCallback();
    });

    // this.locUserInfo.getLocData('boards',function(locBoards){
    //   if(!locBoards){
    //     locBoards=[];
    //   }
    //   thisPage.boards=locBoards;//先显示本地存储的板子
    //
    //
    //   if(locBoards.length>0){
    //     lastTimestamp=locBoards[0].attributes.timestamp;
    //   }
    //
    // });
  }


  ngOnInit(){

  }

  // 销毁组件时清除定时器
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  //离开时清楚定时器
  ionViewDidLeave ():boolean{
    clearInterval(this.timer);
    console.log('ionViewDidLeave board');
    return true;
  }
}
