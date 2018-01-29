import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { TeamService } from '../../service/teamService';
import { ActionService } from '../../service/actionService';
import { LocUserInfo } from '../../service/locUser';
import { MessagesDetailPage } from '../message_detail/messages_detail';
/**
 * Generated class for the MyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-my',
  templateUrl: 'my.html',
})
export class MyPage {

  userName='';
  isLeader=false;
  applyToTeam='';
  applyToTeamTitle='';
  applyToAction='';
  applyToActionTitle='';
  memberId = '';
  status ='';
  userDetail={
    attributes:{
      username:''
    },
    createdAt:'2017-07-24 17:53:25'
  };
  userDetailPlus={
    attributes:{
      tel:'',
      major:'',
      birthday:'1900-01-08 00:00:00',
      resume:'',
      headimg:''
    }
  }
  currentUser={
    attributes:{
      username:'system'
    }
  };
  isFriend=false;
  constructor(
    public navCtrl: NavController,
    private navParams:NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private teamService:TeamService,
    private actionService:ActionService,
    private locUserInfo:LocUserInfo
  ) {

  }

  getUserInfo(){
    var thisPage=this;
    console.log('getUserInfo',this.userName);
    this.locUserInfo.getUserInfo(this.userName,function(res){
      console.log('user detail:',res);
      thisPage.userDetail=res[0];
      thisPage.locUserInfo.getUserDetailPlus(thisPage.userDetail.attributes.username,function(userDetailPlus){
        thisPage.userDetailPlus=userDetailPlus;
        thisPage.testFriend();
      },function(error){
        console.log('用户详情数据获取失败');
      });
    },function(err){

    });
  }
  alowApply(){
    var thisPage=this;
    if(this.applyToTeam){
      this.teamService.changeApplyStatus(this.userName,this.applyToTeam,2,function(res){
        thisPage.navCtrl.pop();
        thisPage.locUserInfo.informTheUser(thisPage.userName,
          '小组['+thisPage.applyToTeamTitle+']欢迎您加入，一起行动吧！',
          0,
          function(msg){

          },function(err){

          }
        );
      },function(err){

      });
    }else if(this.applyToAction){
      this.actionService.changeApplyStatus(this.userName,this.applyToAction,2,function(res){
        thisPage.navCtrl.pop();
        thisPage.locUserInfo.informTheUser(thisPage.userName,
          '活动['+thisPage.applyToActionTitle+']组织者欢迎您加入，一起行动吧！',
          0,
          function(msg){

          },function(err){

          }
        );


      },function(err){

      });
    }

  }
  openSysMessagesDetail(){
    //console.log('this.userName',this.userDetail.attributes.username);
    this.navCtrl.push(MessagesDetailPage,{
      from:this.userDetail.attributes.username,
      fromUserIcon:this.userDetailPlus.attributes.headimg,
      fromFlag: true
    });
  }
  addFriend(){
    let thisPage=this;
    this.locUserInfo.addFriend(
      this.currentUser.attributes.username,
      this.userDetail.attributes.username,
      function(res){
        thisPage.isFriend=true;
      },
      function(err){

      }
    );
  }
  testFriend(){
    let thisPage=this;
    this.locUserInfo.isFriends(
      this.currentUser.attributes.username,
      this.userDetail.attributes.username,
      function(res){
        if(res.length>0){
          thisPage.isFriend=true;
          console.log('是好友');
        }else{
          thisPage.isFriend=false;
          console.log('不是好友');
        }

      },function(err){

      }
    );
  }
//踢出成员
  deleteApply() {
    let thisPage=this;
    if(thisPage.applyToTeam) {
      this.teamService.deleteMember(
        thisPage.applyToTeam,
        thisPage.memberId,
        function(res){
          thisPage.navCtrl.pop();
        },function(err){
        }
      );
    }else if(thisPage.applyToAction) {

      this.actionService.deleteMember(
        thisPage.applyToAction,
        thisPage.memberId,
        function(res){
          thisPage.navCtrl.pop();
        },function(err){
        }
      );

    }

  }

  ngOnInit(){
    let thisPage=this;
    this.userName=this.navParams.get('userName');
    this.applyToTeam=this.navParams.get('teamId');
    this.applyToTeamTitle=this.navParams.get('teamTitle');
    this.applyToAction=this.navParams.get('actionId');
    this.applyToActionTitle=this.navParams.get('actionTitle');
    this.isLeader=this.navParams.get('isLeader');
    this.status=this.navParams.get('status');
    this.memberId =this.navParams.get('memberId');
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      thisPage.getUserInfo();
    },function(err){

    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyPage');
  }

}
