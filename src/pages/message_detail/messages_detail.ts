import { Component,ViewChild } from '@angular/core';
import { App,ViewController,Content } from 'ionic-angular';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { LocUserInfo } from '../../service/locUser';

/**
 * Generated class for the MessagesDetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page_messages_detail',
  templateUrl: 'messages_detail.html'
})
export class MessagesDetailPage {
  @ViewChild(Content) content: Content;
  constructor(
  	public navCtrl: NavController,
  	public navParams: NavParams,
  	private locUserInfo:LocUserInfo
  ){
  }
  messages=[];
  from:any;
  fromUserIcon='';
  fromUserInfo={
    attributes:{
      username:'system',
      headimg:'assets/images/defaulthead.png',
    }
  };
  pageTitle='系统消息';
  msgText='';
  currentUser={
    attributes:{
      username:'system'
    }
  };
  timer;
  getNewSysMessages(){
  	let thisPage=this;
    console.log('消息类型:',this.from);
    if(this.navParams.get('fromFlag')) {
      if(this.from=='system'){
        this.pageTitle='系统消息';
        this.locUserInfo.getNewSysMessages(this.from,function(res){
          thisPage.messages=res;
          setTimeout(function(){
            thisPage.content.scrollToBottom(0);
          },500);
        },function(err){

        });
      }else{

        if(this.navParams.get('fromFlag')) {
          this.fromUserInfo= {
            'attributes' : {
              username: this.navParams.get('from'),
              headimg: this.navParams.get('fromUserIcon'),
            }
          };
        }else {
          this.fromUserInfo=this.from;
        }
        this.pageTitle= this.fromUserInfo.attributes.username;
        // this.pageTitle= this.navParams.get('from');
        this.locUserInfo.getUserdialogue(this.fromUserInfo.attributes.username,function(res){
          thisPage.messages=res;
          setTimeout(function(){
            thisPage.content.scrollToBottom(0);
          },500);
        },function(err){

        });
      }
    } else {
      if(this.from=='system'){
        this.pageTitle='系统消息';
        this.locUserInfo.getNewSysMessages(this.from,function(res){
          thisPage.messages=res;
          setTimeout(function(){
            thisPage.content.scrollToBottom(0);
          },500);
        },function(err){

        });
      }else{

        if(this.navParams.get('fromFlag')) {
          this.fromUserInfo= {
            'attributes' : {
              username: this.navParams.get('from'),
              headimg: this.navParams.get('fromUserIcon'),
            }
          };
        }else {
          this.fromUserInfo=this.from;
        }
        this.pageTitle= this.fromUserInfo.attributes.username;
        // this.pageTitle= this.navParams.get('from');
        this.locUserInfo.getUserdialogue(this.fromUserInfo.attributes.username,function(res){
          thisPage.messages=res;
          setTimeout(function(){
            thisPage.content.scrollToBottom(0);
          },500);
        },function(err){

        });
      }
    }


  }
  sendMsg(){
    let thisPage=this;

    this.locUserInfo.informTheUser(this.fromUserInfo.attributes.username,this.msgText,1,function(msg){
      thisPage.msgText='';
      thisPage.getNewSysMessages();

    },function(){

    })
  }
  ionViewDidLoad() {
    let thisPage=this;
    this.from=this.navParams.get('from');
    //this.fromUserIcon=this.navParams.get('fromUserIcon');
    if(this.from!=='system'){
      // this.fromUserIcon=this.from.attributes.headimg;
      this.fromUserIcon= this.navParams.get('fromUserIcon');
    }
    this.getNewSysMessages();
    this.timer=setInterval(function(){
      //定时获取消息
      thisPage.getNewSysMessages();
    },10000);
    /*this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
    },function(err){

    });*/
    this.locUserInfo.getUserDetailPlusFromLoc(function(locUser){
      thisPage.currentUser=locUser;
      if(!thisPage.currentUser.attributes){
        thisPage.currentUser.attributes=locUser;
      }
      console.log('我：',thisPage.currentUser);

    });
  }
  viewWillUnload(){
    console.log('viewWillUnload messages_detail');
  }
  viewDidLeave(){
    console.log('viewDidLeave messages_detail');
  }
  ionViewCanLeave():boolean{
    clearInterval(this.timer);
    console.log('ionViewCanLeave messages_detail');
    return true;
  }
}
