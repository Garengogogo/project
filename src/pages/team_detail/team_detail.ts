import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NavController,App,ViewController ,Events} from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { TeamService } from '../../service/teamService';
import { LocUserInfo } from '../../service/locUser';
import { UserDetailPage } from '../user_detail/user_detail';



@Component({
  selector: 'page-team_detail',
  templateUrl: 'team_detail.html'
})
export class TeamDetailPage {
	comment={
		content:'',
		teamId:''
	};
	team={
		id:'',
    attributes:{
      title:'加载中...',
      userName:'',
      content:''
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
    private teamService:TeamService,
    private locUserInfo:LocUserInfo,
    public appCtrl:App,
    public events:Events
  ) {

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
  	this.teamService.addInfo2Data(this.comment,function(data){
  		thisPage.teamService.saveTeamComment(data,function(resp){
  			console.log('评论成功！',resp);
  			let alert = thisPage.alertCtrl.create({
           title: '评论成功！',
           subTitle: '对板子话题的评论发布成功：',
           buttons: [{
            text:'OK',
            handler:data =>{
              thisPage.comment.content='';
              thisPage.getComments(resp.attributes.teamId);
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
  getComments(teamId){
  	let thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "数据加载中..."
    });
    loader.present();
  	this.teamService.queryTeamComment(teamId,function(resp){
  		console.log('queryTeamComment',resp);
  		thisPage.comments=resp;
  		loader.dismiss();
  	},function(err){
		console.error('queryTeamComment[ERR]',err);
		loader.dismiss();
  	});

  }
  applyJoin(){
    if(this.team.id===''){
       return;
    }
    let thisPage=this;
    this.teamService.applyJoin(this.team.id,function(team){
       //thisPage.team=team;
       console.log('申请已发出',team);
    },function(team,err){

    });
  }
  //解散小组
  deleteTeam(team) {
    let thisPage=this;
    this.teamService.deleteTeam(team.id,function(resp){
      let alert = thisPage.alertCtrl.create({
        title: '解散小组',
        subTitle: '是否解散小组',
        inputs: [
          {
            name: 'reason',
            type: 'text',
            placeholder: '解散小组原因'
          }
        ],
        buttons: [{
          text:'OK',
          handler:data =>{
            for(let item of thisPage.applyList){
              console.log(item.attributes.applyUser)
              let sysmsg='小组【'+team.attributes.title+'】已取消，原因：'+data.reason;
              thisPage.locUserInfo.informTheUser(item.attributes.applyUser,sysmsg,0,function(msg){
              },function(err){

              });
            }
            thisPage.navCtrl.pop();
            thisPage.events.publish('teamDelete', team.id);
          }
        }]
      });
      alert.present();

    },function(err){


    });

  }
  getApplyList(){
    var thisPage=this;
    this.teamService.getApplyList(this.team.id,function(res){
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
    console.log(memb + "membmembmembmemb")
    this.rootNav.push(UserDetailPage,{
      userName:memb.attributes.userName,
      memberId:memb.id,
      teamId:this.team.id,
      teamTitle:this.team.attributes.title,
      isLeader:this.isLeader,
      status:memb.attributes.status,
      zhbtest:'hahaha'
    });
  }
  openUserDetailApply(memb){
    console.log(memb + "membmembmembmemb")
    this.rootNav.push(UserDetailPage,{
      userName:memb.attributes.applyUser,
      memberId:memb.id,
      teamId:this.team.id,
      teamTitle:this.team.attributes.title,
      isLeader:this.isLeader,
      status:memb.attributes.status,
      zhbtest:'hahaha'
    });
  }

  ngOnInit(){
   /* var thisPage=this;
  	this.team=this.navParams.get('team');
    console.log('this.team:',this.team);
  	this.comment.teamId=this.team.id;
  	console.log(this.team);
  	this.getComments(this.team.id);
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
    },function(obj,err){

    });
    this.getApplyList();//需要判断当前用户是否是小组创建者*/
  }


  ionViewWillEnter(){
    var thisPage=this;
    this.team=this.navParams.get('team');
    this.comment.teamId=this.team.id;

    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      thisPage.getApplyList();
      thisPage.getComments(thisPage.team.id);
      console.log('thisPage.currentUser',thisPage.currentUser);
      console.log('thisPage.team',thisPage.team);
      thisPage.isLeader=thisPage.currentUser.attributes.username==thisPage.team.attributes.userName;
      thisPage.isLogedIn=true;
    },function(obj,err){
      //用户未登录不可查看小组成员及留言
      thisPage.isLogedIn=false;
      let alert = thisPage.alertCtrl.create({
         title: '请先登录',
         subTitle: '登录后可查看小组成员及留言',
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
