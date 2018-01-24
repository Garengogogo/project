import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MessagesDetailPage } from '../message_detail/messages_detail';
import { MessagesDetailProvider } from '../../providers/messages-detail/messages-detail';
//import { MessagesDetailProvider } from '../../providers/messages-detail/messages-detail';
import { LocUserInfo } from '../../service/locUser';


@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {
  items :any;
  newSystemMessageNum=0;
  currentUser={
    attributes:{
      username:'tempUser'
    }
  };
  friends1=[];
  friends2=[];
  timer;
  constructor(
    public navCtrl: NavController,
    private MessagesDetailProvider: MessagesDetailProvider,
    private locUserInfo:LocUserInfo
  ) {

  }
  openMessageDetailPage(team){

    this.navCtrl.push(MessagesDetailPage,{
      team:team
    });

  }
  openSysMessagesDetail(from,newMsgs){
    this.navCtrl.push(MessagesDetailPage,{
      from:from
    });
    
    for(var i=0;i<newMsgs.length;i++){
      console.log('需要将这些消息置为已读',newMsgs[i]);
      
      newMsgs[i].set('status',1);
      newMsgs[i].save();
    }
  }

  ngOnInit() {
    //this.getPosts();
    let thisPage=this;
    thisPage.timer=setInterval(function(){
      //定时刷新好友列表
      thisPage.getFrdAndMsg();
    },20000);
    thisPage.getFrdAndMsg();
  }
  getFrdAndMsg(){
    let thisPage=this;
    
    this.locUserInfo.getLcoUserInfo(function(locUser){
      thisPage.currentUser=locUser;
      thisPage.countSysNewMsg();
      thisPage.getAllNewMsg(function(allNewMsg){

        thisPage.getFriendList(allNewMsg);
        
      });
      
    },function(err){

    });
  }

  /*getPosts(){
    this.MessagesDetailProvider.getPosts().subscribe(response => {
      console.log(response)
      this.items = response.data;
    });
  }*/

  countSysNewMsg(){
    let thisPage=this;
    this.locUserInfo.countNewMessages('system',function(count){
      thisPage.newSystemMessageNum=count;
    },function(err){

    });
  }
  getAllNewMsg(thenFun){
    let thisPage=this;
    this.locUserInfo.getNewSysMessages('all',function(allNewMsg){
      console.log('所有新消息',allNewMsg);
      thenFun(allNewMsg);
    },function(err){

    });
  }
  getFriendList(allNewMsg){
    //todo:待优化，需运用storage减少请求数
    let thisPage=this;
    this.locUserInfo.getFriendList1(
      thisPage.currentUser.attributes.username,
      function(userList){
        thisPage.friends1=userList;
        //将新消息绑定到用户
        for(let i=0;i<thisPage.friends1.length;i++){
          thisPage.friends1[i].newMsg=[];
          thisPage.friends1[i].newMsgCount=0;
          for(let j=0;j<allNewMsg.length;j++){
            if(thisPage.friends1[i].attributes.username==allNewMsg[j].attributes.from){
              thisPage.friends1[i].newMsg.push(allNewMsg[j]);
              thisPage.friends1[i].newMsgCount++;
            }
          }
        }
      },
      function(err){

      }
    );
    this.locUserInfo.getFriendList2(
      thisPage.currentUser.attributes.username,
      function(userList){
        thisPage.friends2=userList;
        //将新消息绑定到用户
        for(let i=0;i<thisPage.friends2.length;i++){
          thisPage.friends2[i].newMsg=[];
          thisPage.friends2[i].newMsgCount=0;
          for(let j=0;j<allNewMsg.length;j++){
            if(thisPage.friends2[i].attributes.username==allNewMsg[j].attributes.from){
              thisPage.friends2[i].newMsg.push(allNewMsg[j]);
              thisPage.friends2[i].newMsgCount++;
            }
          }
        }
      },
      function(err){

      }
    );
  }
  
  ionViewCanLeave():boolean{
    clearInterval(this.timer);
    console.log('ionViewCanLeave 好友列表定时器关闭');
    return true;
  }
}
