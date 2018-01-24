import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LocUserInfo } from './locUser';
import { UserGeoLocation } from './userGeoLocation';

declare var Bmob;
@Injectable()
export class BoardService {
  constructor(
    public alertCtrl: AlertController,
    private locUserInfo:LocUserInfo,
    private userGeoLocation:UserGeoLocation
  ) {

  }
  
  //保存板子数据到服务器
  saveBoardData(data,successCallback,errorCallback){
    var boardClass = Bmob.Object.extend("Boards");
    var board=new boardClass();
    var thisPage=this;
    board.save(data, {
      success: function(resp) {
        console.log('板子话题发布成功',resp);
        successCallback(resp);
        
      },
      error: function(resp, error) {
        // 添加失败
        console.log('板子话题发布失败',resp);
        errorCallback(resp, error);
      }
    });
  }
  //发布板子（添加用户及地理位置信息）
  publishBoard(data,successCallback,errorCallback){
    var thisPage=this;
    this.addInfo2Data(data,function(formatData){
      thisPage.saveBoardData(formatData,function(resp){
          // 添加成功
           let alert = thisPage.alertCtrl.create({
           title: '板子话题发布成功',
           subTitle: '成功发布板子话题：'+resp.attributes.title,
           buttons: ['OK']
           });
           alert.present();
           successCallback(resp);
        },function(err){
          let alert = thisPage.alertCtrl.create({
            title: '板子话题发布失败',
            subTitle: '板子话题发布失败，请稍候重试',
            buttons: ['OK']
          });
          alert.present();
          errorCallback(err);
        });
    },function(){

    });

    
  }

  //获取板子列表
  getBoards(successCallback,errorCallback){
    var thisPage=this;
    var boardClass = Bmob.Object.extend("Boards");
    var query=new Bmob.Query(boardClass);

    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取板子列表成功',res);
        successCallback(res);
      },
      error:function(err){
        /*
        let alert = thisPage.alertCtrl.create({
          title: '数据查询失败',
          subTitle: '网络异常，数据查询失败',
          buttons: ['OK']
        });
        alert.present();
        */
        errorCallback(err);
      }
    });
  }
  
  getBoardsFromDate(lastTimestamp,successCallback,errorCallback){
    var thisPage=this;
    var boardClass = Bmob.Object.extend("Boards");
    var query=new Bmob.Query(boardClass);
    query.descending("createdAt");
    query.greaterThan('timestamp',lastTimestamp);
    query.find({
      success:function(res){
        console.log('获取新板子成功',res);
        successCallback(res);
      },
      error:function(err){
        
        errorCallback(err);
      }
    });
  }

  //获取附近的板子
  getBoardsNearby(lat,lng,successCallback,errorCallback){
    let locPoint = new Bmob.GeoPoint({latitude:lat, longitude: lng});
    let thisPage=this;
    let BoardClass = Bmob.Object.extend("Boards");
    let query=new Bmob.Query(BoardClass);
    let threeYearsAgo=new Date();
    threeYearsAgo.setDate(threeYearsAgo.getDate()-3);
    console.log('3天前',threeYearsAgo);
    query.greaterThan('createdAt',threeYearsAgo);
    query.near("location", locPoint);
    query.limit(10);
    query.select("title","location");
    query.find({
      success:function(res){
        console.log('附近的板子',locPoint,res);
        successCallback(res);
      },
      error:function(err){

        errorCallback(err);
      }
    });
  }

  //保存板子评论
  saveBoardComment(data,successCallback,errorCallback){
    var boardComment = Bmob.Object.extend("BoardComment");
    var comment=new boardComment();
    //var linkBoard = Bmob.Object.createWithoutData("Boards", data.boardId);
    //comment.set('parent',linkBoard);
    //var relation=boardComment.relation("board");
    //relation.add(linkBoard);
    var thisPage=this;
    comment.save(data, {
      success: function(resp) {
        console.log('评论成功',resp);
        thisPage.incrementBoardComment(data.boardId);
        successCallback(resp);
        
      },
      error: function(resp, error) {
        // 添加失败
        console.log('评论失败',resp);
        errorCallback(resp, error);
      }
    });
  }

  //板子评论计数
  incrementBoardComment(boardId){
    var thisPage=this;
    var Boards = Bmob.Object.extend("Boards");
    var query=new Bmob.Query(Boards);
    //query.equalTo('objectId',boardId);
    query.get(boardId,{
      success:function(board){
        console.log('获取板子记录成功',board);
        board.increment('commentsCount');
        board.save();
        //successCallback(res);
      },
      error:function(err){
        /*let alert = thisPage.alertCtrl.create({
          title: '数据查询失败',
          subTitle: '网络异常，数据查询失败',
          buttons: ['OK']
        });
        alert.present();*/
        //errorCallback(err);
      }
    });
  }

  //查询板子评论
  queryBoardComment(boardId,successCallback,errorCallback){
    var thisPage=this;
    var BoardComment = Bmob.Object.extend("BoardComment");
    var query=new Bmob.Query(BoardComment);
    query.equalTo('boardId',boardId);
    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取板子评论成功',res);
        successCallback(res);
      },
      error:function(err){
        /*let alert = thisPage.alertCtrl.create({
          title: '数据查询失败',
          subTitle: '网络异常，数据查询失败',
          buttons: ['OK']
        });
        alert.present();*/
        errorCallback(err);
      }
    });
  }

  //向数据中添加用户及位置
  addInfo2Data(data,successCallback,errorCallback){
    var formatData=data;
    var thisPage=this;
    var now=new Date();
    formatData.timestamp=Date.parse(now.toString());//添加时间戳用于控制下载数据量
    this.locUserInfo.isLoggedIn(function(val){
      formatData.userId=val.id;
      formatData.userName=val.attributes.username;
      thisPage.userGeoLocation.getUserLocationFromStorage(function(pos){
        formatData.location=new Bmob.GeoPoint({latitude: pos.lat, longitude: pos.lon});
        console.log('formatData',formatData);
        successCallback(formatData);
      },function(err){
        let alert = thisPage.alertCtrl.create({
          title: '位置获取失败',
          subTitle: '请允许Maker获取您的位置',
          buttons: ['OK']
        });
        alert.present();
        errorCallback(err);
      });
      
    },function(resp,err){
      let alert = thisPage.alertCtrl.create({
          title: '用户未认证',
          subTitle: '该功能只对认证用户开放',
          buttons: ['OK']
        });
        alert.present();
      errorCallback(err);
    });
    
  }
}
