import { Component, ViewChild} from '@angular/core';
import { NavController,App,ViewController, Events, Content, TextInput } from 'ionic-angular';
import { NavParams,IonicPage } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { ActionService } from '../../service/actionService';
import { LocUserInfo } from '../../service/locUser';
import { UserDetailPage } from '../user_detail/user_detail';

import { ChatService, ChatMessage, UserInfo } from "../../providers/chat-service";


declare var AMapUI;
declare var AMap;

@Component({
  selector: 'page-action_detail',
  templateUrl: 'action_detail.html'
})
export class ActionDetailPage {
  @ViewChild(Content) content: Content;
  @ViewChild('chat_input') messageInput: TextInput;
  public myMarker:any;
	comment={
		content:'',
		actionId:''
	};
	action={
		id:'',
    attributes:{
      title:'加载中...',
      userName:'',
      content:'',
      pos:{
        lng:104,
        lat:32
      }
    },
    createdAt:''
	};
	comments=[];
  currentUser={
    id:'',
    attributes:{
      username:''
    },
    createdAt:''
  };
  applyList=[];
  isMember=false;
  isLeader=false;
  isLogedIn=false;
  constructor(
    public navCtrl: NavController,
    private navParams:NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private actionService:ActionService,
    private locUserInfo:LocUserInfo,
    public appCtrl:App,
    private chatService: ChatService,
    public events:Events
  ) {
    this.toUser = {
      id: navParams.get('toUserId'),
      name: navParams.get('toUserName')
    };
    // Get mock user information
    this.chatService.getUserInfo()
      .then((res) => {
        this.user = res
      });
  }


  msgList: ChatMessage[] = [];
  user: UserInfo;
  toUser: UserInfo;
  editorMsg = '';
  showEmojiPicker = false;

  ionViewWillLeave() {
    // unsubscribe
    this.events.unsubscribe('chat:received');
  }

  ionViewDidEnter() {
    //get message list
    this.getMsg();

    // Subscribe to received  new message events
    this.events.subscribe('chat:received', msg => {
      this.pushNewMsg(msg);
    })
  }

  onFocus() {
    this.showEmojiPicker = false;
    this.content.resize();
    this.scrollToBottom();
  }

  switchEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }
    this.content.resize();
    this.scrollToBottom();
  }

  /**
   * @name getMsg
   * @returns {Promise<ChatMessage[]>}
   */
  private getMsg() {
    // Get mock message list
    return this.chatService
      .getMsgList()
      .subscribe(res => {
        this.msgList = res;
        this.scrollToBottom();
      });
  }

  /**
   * @name sendMsg
   */
  sendMsg() {
    if (!this.editorMsg.trim()) return;

    // Mock message
    const id = Date.now().toString();
    let newMsg: ChatMessage = {
      messageId: Date.now().toString(),
      userId: this.user.id,
      userName: this.user.name,
      userAvatar: this.user.avatar,
      toUserId: this.toUser.id,
      time: Date.now(),
      message: this.editorMsg,
      status: 'pending'
    };

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.messageInput.setFocus();
    }

    this.chatService.sendMsg(newMsg)
      .then(() => {
        let index = this.getMsgIndexById(id);
        if (index !== -1) {
          this.msgList[index].status = 'success';
        }
      })
  }

  /**
   * @name pushNewMsg
   * @param msg
   */
  pushNewMsg(msg: ChatMessage) {
    const userId = this.user.id,
      toUserId = this.toUser.id;
    // Verify user relationships
    if (msg.userId === userId && msg.toUserId === toUserId) {
      this.msgList.push(msg);
    } else if (msg.toUserId === userId && msg.userId === toUserId) {
      this.msgList.push(msg);
    }
    this.scrollToBottom();
  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex(e => e.messageId === id)
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom();
      }
    }, 400)
  }




























  rootNav=this.appCtrl.getRootNav();
  applyList_status2=0;
  applyList_status0=0;
  sendComment(){
  	var thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "正在保存，请稍候..."
    });
    loader.present();
  	this.actionService.addInfo2Data(this.comment,function(data){
  		thisPage.actionService.saveActionComment(data,function(resp){
  			console.log('评论成功！',resp);
  			let alert = thisPage.alertCtrl.create({
           title: '评论成功！',
           subTitle: '对活动的评论发布成功：',
           buttons: [{
            text:'OK',
            handler:data =>{
              thisPage.comment.content='';
              thisPage.getComments(resp.attributes.actionId);
            }

          }]
        });
        loader.dismiss();
        alert.present();


  		},function(err){
			console.log('评论失败！',err);
			loader.dismiss();
  		})
  	},function(err){
  		console.log('评论失败！',err);
  		loader.dismiss();
  	})
  }
  getComments(actionId){
  	let thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "数据加载中..."
    });
    loader.present();
  	this.actionService.queryActionComment(actionId,function(resp){
  		console.log('queryActionComment',resp);
  		thisPage.comments=resp;
  		loader.dismiss();
  	},function(err){
		console.log('queryActionComment[ERR]',err);
		loader.dismiss();
  	});

  }
  applyJoin(){
    if(this.action.id===''){
       return;
    }
    let thisPage=this;
    this.actionService.applyJoin(this.action.id,function(action){
       //thisPage.action=action;
       console.log('申请已发出',action);
    },function(action,err){

    });
  }
  //解散action
  deleteAction(action) {
    let thisPage=this;
    this.actionService.deleteAction(action.id,function(resp){
      let alert = thisPage.alertCtrl.create({
        title: '解散活动',
        subTitle: '是否解散活动',
        inputs: [
          {
            name: 'reason',
            type: 'text',
            placeholder: '解散活动原因'
          }
        ],
        buttons: [{
          text:'OK',
          handler:data =>{
            if(data.reason) {
                console.log(data);
                // this.locUserInfo.informTheUser();
              for(let item of thisPage.applyList){
                  console.log(item.attributes.applyUser)
                  let sysmsg='活动【'+action.attributes.title+'】已取消，原因：'+data.reason;
                thisPage.locUserInfo.informTheUser(item.attributes.applyUser,sysmsg,0,function(msg){

                },function(err){

                });
              }
            }
            thisPage.navCtrl.pop();
            thisPage.events.publish('actionDelete', action.id);
          }
        }]
      });
      alert.present();
    },function(err){

    });
  }

  //开始action
  beginAction(action) {
    let thisPage=this;
    this.actionService.changeActionStatus(2,action.id,function(resp){
      let alert = thisPage.alertCtrl.create({
        title: '开始活动',
        subTitle: '确定要开始活动',
        inputs: [
          {
            name: 'reason',
            type: 'text',
            placeholder: '备注'
          }
        ],
        buttons: [{
          text:'OK',
          handler:data =>{
            if(data.reason) {
                console.log(data);
                // this.locUserInfo.informTheUser();
              for(let item of thisPage.applyList){
                  console.log(item.attributes.applyUser)
                  let sysmsg='活动【'+action.attributes.title+'】已开始，备注：'+data.reason;
                thisPage.locUserInfo.informTheUser(item.attributes.applyUser,sysmsg,0,function(msg){

                },function(err){

                });
              }
            }
            thisPage.navCtrl.pop();
            thisPage.events.publish('actionDelete', action.id);
          }
        }]
      });
      alert.present();
    },function(err){

    });
  }

  //完成action
  completeAction(action) {
    let thisPage=this;
    this.actionService.changeActionStatus(3,action.id,function(resp){
      let alert = thisPage.alertCtrl.create({
        title: '完成活动',
        subTitle: '确定要结束活动',
        inputs: [
          {
            name: 'reason',
            type: 'text',
            placeholder: '备注'
          }
        ],
        buttons: [{
          text:'OK',
          handler:data =>{
            if(data.reason) {
                console.log(data);
                // this.locUserInfo.informTheUser();
              for(let item of thisPage.applyList){
                  console.log(item.attributes.applyUser)
                  let sysmsg='活动【'+action.attributes.title+'】已结束，备注：'+data.reason;
                thisPage.locUserInfo.informTheUser(item.attributes.applyUser,sysmsg,0,function(msg){

                },function(err){

                });
              }
            }
            thisPage.navCtrl.pop();
            thisPage.events.publish('actionDelete', action.id);
          }
        }]
      });
      alert.present();
    },function(err){

    });
  }

  //恢复action
  renewAction(action) {
    let thisPage=this;
    this.actionService.changeActionStatus(1,action.id,function(resp){
      let alert = thisPage.alertCtrl.create({
        title: '恢复活动',
        subTitle: '确定要恢复活动',
        inputs: [
          {
            name: 'reason',
            type: 'text',
            placeholder: '备注'
          }
        ],
        buttons: [{
          text:'OK',
          handler:data =>{
            if(data.reason) {
                console.log(data);
                // this.locUserInfo.informTheUser();
              for(let item of thisPage.applyList){
                  console.log(item.attributes.applyUser)
                  let sysmsg='活动【'+action.attributes.title+'】已重新开启，备注：'+data.reason;
                thisPage.locUserInfo.informTheUser(item.attributes.applyUser,sysmsg,0,function(msg){

                },function(err){

                });
              }
            }
            thisPage.navCtrl.pop();
            thisPage.events.publish('actionDelete', action.id);
          }
        }]
      });
      alert.present();
    },function(err){

    });
  }



  //发消息
  // sendMsg(){
  //   let thisPage=this;
  //
  //   this.locUserInfo.informTheUser(this.fromUserInfo.attributes.username,this.msgText,1,function(msg){
  //
  //   },function(){
  //
  //   })
  // }


  getApplyList(){
    var thisPage=this;
    this.actionService.getApplyList(this.action.id,function(res){
      thisPage.applyList=res;
      console.log('thisPage.applyList',thisPage.applyList);
      thisPage.applyList_status2=0;
      thisPage.applyList_status0=0;
      thisPage.isMember=false;
      for(var i=0;i<res.length;i++){
        //console.log('thisPage.currentUser.attributes.username',thisPage.currentUser.attributes.username,res[i].attributes.applyUser);
        if(res[i].attributes.applyUser==thisPage.currentUser.attributes.username && res[i].attributes.status==2){
          thisPage.isMember=true;
        }
        if(res[i].attributes.status==0){
          thisPage.applyList_status0++;
        }else if(res[i].attributes.status==2){
          thisPage.applyList_status2++;

          //这里就是参与活动的人员

        }
        console.log('applyList i:',i,thisPage.applyList[i]);
        thisPage.getUserHeadimg(i);
      }
    },function(err){

    });
  }

  getUserHeadimg(i){
    var thisPage=this;
    thisPage.locUserInfo.getUserDetailPlus(thisPage.applyList[i].attributes.applyUser,function(udp){
      thisPage.applyList[i].attributes.headimg=udp.attributes.headimg;
      //console.log('thisPage.applyList[i].attributes.headimg',thisPage.applyList[i].attributes.headimg);
    },function(err){

    });
  }

  openUserDetail(memb){
    this.rootNav.push(UserDetailPage,{
      userName:memb.attributes.userName,
      actionId:this.action.id,
      memberId:memb.id,
      actionTitle:this.action.attributes.title,
      isLeader:this.isLeader,
      status:memb.attributes.status,
    });
  }
  openUserDetailApply(memb){
    this.rootNav.push(UserDetailPage,{
      userName:memb.attributes.applyUser,
      actionId:this.action.id,
      memberId:memb.id,
      actionTitle:this.action.attributes.title,
      isLeader:this.isLeader,
      status:memb.attributes.status,
    });
  }

  ngOnInit(){

  }

  markMe(lnglat,map){
    console.log('活动地点',lnglat);
    this.myMarker = new AMap.Marker({
      position: lnglat,
      title: '活动地点',
      map: map
    });
  }
  mapInit(){
    var thisPage=this;
    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
      var map = new AMap.Map('mapPosPicker',{
          zoom:12,
          resizeEnable: true,
          center: [thisPage.action.attributes.pos.lng,thisPage.action.attributes.pos.lat]
      });
      setTimeout(function(){
        var lnglat= AMap.LngLat(thisPage.action.attributes.pos.lng,thisPage.action.attributes.pos.lat);
        map.panTo(lnglat);
        thisPage.markMe(lnglat,map);
      },1000);


      map.plugin('AMap.Geolocation', function () {
          let geolocation = new AMap.Geolocation({
              enableHighAccuracy: true,//是否使用高精度定位，默认:true
              timeout: 10000,          //超过10秒后停止定位，默认：无穷大
              maximumAge: 0,           //定位结果缓存0毫秒，默认：0
              convert: false,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
              showButton: true,        //显示定位按钮，默认：true
              buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
              buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
              showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
              showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
              panToLocation: false,     //定位成功后将定位到的位置作为地图中心点，默认：true
              zoomToAccuracy:false      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          });
          map.addControl(geolocation);
          geolocation.getCurrentPosition();
          AMap.event.addListener(geolocation, 'complete', function(geolocationResult){
            console.log('AMap----geolocationResult',geolocationResult);


          });//返回定位信息
          AMap.event.addListener(geolocation, 'error', function(err){
            console.log('AMap----geolocationResult--err',err);
          });      //返回定位出错信息
      });


    });
  }

  ionViewWillEnter(){
    var thisPage=this;
    this.action=this.navParams.get('action');
    this.comment.actionId=this.action.id;

    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      thisPage.getApplyList();
      thisPage.getComments(thisPage.action.id);
      console.log('thisPage.currentUser',thisPage.currentUser);
      console.log('thisPage.action',thisPage.action);
      thisPage.isLeader=thisPage.currentUser.attributes.username==thisPage.action.attributes.userName;
      thisPage.isLogedIn=true;
      thisPage.actionService.getActionDetail(thisPage.action.id,function(act){
        thisPage.action=act;
        thisPage.mapInit();
      },function(err){
        console.log('获取活动详情失败',err);
      })


    },function(obj,err){
      //用户未登录不可查看小组成员及留言
      thisPage.isLogedIn=false;
      let alert = thisPage.alertCtrl.create({
         title: '请先登录',
         subTitle: '登录后可查看活动成员及留言',
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
