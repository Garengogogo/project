import { Component } from '@angular/core';
import { NavController,App,ViewController ,Events} from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { TeamService } from '../../service/teamService';
import { TeamDetailPage } from '../team_detail/team_detail';
import { LocUserInfo } from '../../service/locUser';

@Component({
  selector: 'page-teams',
  templateUrl: 'teams.html'
})
export class TeamsPage {
  team: string = "allteam";
  lastValue : boolean = false;
  // dataArr:any =[];
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private teamService:TeamService,
    public viewCtrl:ViewController,
    public appCtrl:App,
    public events:Events,
    private locUserInfo:LocUserInfo

  ) {
    events.subscribe('teamDelete', (id) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      if(id) {
         this.selectedFriends(this.currentUser.attributes.segmentType)
      }
    });
    events.subscribe('user:login', (user, date) => {
      var thisPage=this;
      // user and time are the same arguments passed in `events.publish(user, time)`
      if(user.attributes.username) {
        this.changeUser();
      }
    });
  }
  teams=[];
  joinedTeams=[];
  joinedTeamsMy=[];
  rootNav=this.appCtrl.getRootNav();
  currentUser={
    attributes:{
      username:'system',
      segmentType : 'default'
    }
  };
  //用户all活动
  getTeams(){
  	var thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "正在获取所有小组列表"
    });
    loader.present();
    this.teamService.getTeams(function(res){
      thisPage.teams= [];
      thisPage.teams= res;
    	loader.dismiss();

    },function(err){
    	loader.dismiss();
    });
  }
  // getTeamsPulldown(){
  //   var thisPage=this;
  //   this.teamService.getTeams(function(res, flag){
  //     thisPage.teams= res;
  //     thisPage.lastValue = flag;
  //   },function(err){
  //
  //   });
  // }
  //上拉刷新
  doInfinite(infiniteScroll)
  {
    setTimeout(() => {
      this.selectedFriends(this.currentUser.attributes.segmentType);
      infiniteScroll.complete();
    },500);
  }
//用户加入的活动
  getJoinedTeams(){
    let thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在获取加入的小组列表"
    });
    loader.present();
    this.teamService.getUserJoinedTeams(this.currentUser.attributes.username,function(joinedTeams){
      thisPage.joinedTeams=[];
      thisPage.joinedTeams=joinedTeams;
      loader.dismiss();
    },function(err){
      loader.dismiss();
    })
  }
  getUserMakeAc() {
    //用户创建的活动
    let thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在获取创建的小组列表"
    });
    loader.present();
    this.teamService.getUserMakedActions(this.currentUser.attributes.username,function(res){
      thisPage.joinedTeamsMy =[];
      thisPage.joinedTeamsMy=res;
      loader.dismiss();
    },function(err){
      loader.dismiss();
    });
  }
  doRefresh(event){
  	var thisPage=this;
    if(this.currentUser.attributes.segmentType == 'myteam'){
      this.teamService.skipValueCreate = 0;
      this.getUserMakeAc();
      event.complete();
    } else if(this.currentUser.attributes.segmentType == 'jointeam') {
      this.teamService.skipValueJoin = 0;
      this.getJoinedTeams();
      event.complete();
    } else {
      this.teamService.skipValue = 0;
      this.getTeams();
      event.complete();
      // this.teamService.getTeamsRefresh(function(res){
      //   thisPage.teams=[];
      //   thisPage.teams=res;
      //   event.complete();
      //
      // },function(err){
      //
      //   event.complete();
      // });
    }



  }

  segmentChangedTeam(ev){
    this.currentUser.attributes.segmentType = ev.value;
    console.log(ev)
    if(ev.value == 'myteam'){
      this.getUserMakeAc();
    } else if(ev.value == 'jointeam') {
      this.getJoinedTeams();
    } else {
      this.getTeams();
    }
  }
  selectedFriends(value) {
      if(value == 'myteam'){
        this.teamService.skipValueCreate += 5;
        this.getUserMakeAc();
      } else if(value == 'jointeam') {
        this.teamService.skipValueJoin += 5;
        this.getJoinedTeams();
      } else {
        this.teamService.skipValue += 5;
        this.getTeams();
      }
  }
  ionViewWillEnter(){
    let thisPage=this;
  	 // this.getTeams();
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      thisPage.currentUser.attributes.segmentType = thisPage.team;
      if(thisPage.team == 'myteam'){
        thisPage.getUserMakeAc();
      } else if(thisPage.team == 'jointeam') {
        thisPage.getJoinedTeams();
      } else {
        thisPage.getTeams();
      }
    },function(err){

    });
  }
  //切换用户刷新页面
  changeUser() {
    // let thisPage=this;
    // this.currentUser={
    //   attributes:{
    //     username: thisPage.currentUser.attributes.username,
    //     segmentType : thisPage.currentUser.attributes.segmentType
    //   }
    // };
    // if(this.currentUser.attributes.segmentType == 'myteam'){
    //   this.teamService.skipValueCreate = 0;
    //   this.getUserMakeAc();
    // } else if(this.currentUser.attributes.segmentType == 'jointeam') {
    //   this.teamService.skipValueJoin = 0;
    //   this.getJoinedTeams();
    // } else {
    //   this.teamService.skipValue = 0;
    //   this.getTeams();
    // }
  }

  openTeamDetailPage(team){
    console.log('openTeamDetailPage...');
    console.log('viewCtrl：',this.viewCtrl);
    console.log('this.appCtrl',this.rootNav);
    this.rootNav.push(TeamDetailPage,{
      team:team
    });
  }

  ngOnInit(){

  }
}
