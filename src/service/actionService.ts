import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LocUserInfo } from './locUser';
import { UserGeoLocation } from './userGeoLocation';

declare var Bmob;
@Injectable()
export class ActionService {
  constructor(
    public alertCtrl: AlertController,
    private locUserInfo:LocUserInfo,
    private userGeoLocation:UserGeoLocation
  ) {

  }
  dataArr:any =[];
  dataArrCreate:any =[];
  dataArrJoin:any =[];
  total: number =0;
  flag : boolean = false;
  skipValueCreate=0;
  skipValue=0;
  skipValueJoin=0;
  //保存活动数据到服务器
  saveActionData(data,successCallback,errorCallback){
    var ActionClass = Bmob.Object.extend("Actions");
    var action=new ActionClass();
    var thisPage=this;
    //action.set('beginDateTime',Date);
    console.log('input datetime',data.beginDateTime);
    var tempDT=data.beginDateTime;
    tempDT=tempDT.substring(0,16)+':00+08:00';
    data.beginDateTime=new Date(tempDT);
    console.log('format datetime',data.beginDateTime);
    action.save(data, {
      success: function(resp) {
        console.log('活动创建成功',resp);
        successCallback(resp);

      },
      error: function(resp, error) {
        // 添加失败
        console.log('活动创建失败',resp);
        errorCallback(resp, error);
      }
    });
  }
  //发布活动（添加用户及地理位置信息）
  publishAction(data,successCallback,errorCallback){
    var thisPage=this;
    this.addInfo2Data(data,function(formatData){
      thisPage.saveActionData(formatData,function(resp){
          // 添加成功
           let alert = thisPage.alertCtrl.create({
           title: '活动发布成功',
           subTitle: '成功发布活动：'+resp.attributes.title,
           buttons: ['OK']
           });
           alert.present();
           successCallback(resp);
        },function(err){
          let alert = thisPage.alertCtrl.create({
            title: '活动发布失败',
            subTitle: '活动发布失败，请稍候重试',
            buttons: ['OK']
          });
          alert.present();
          errorCallback(err);
        });
    },function(){

    });


  }

  //解散action
  deleteAction(actionId,successCallback, errorCallback) {
    let ActionClass = Bmob.Object.extend("Actions");
    let query=new Bmob.Query(ActionClass);
    query.get(actionId, {
      success: function (gameScore) {
        // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
        gameScore.set('actionStatus', 0);
        gameScore.save();
        successCallback(gameScore);
        // The object was retrieved successfully.
      },
      error: function (object, error) {
        errorCallback(error)
      }
    });
  }

  //更改活动状态
  changeActionStatus(status,actionId,successCallback, errorCallback) {
    let ActionClass = Bmob.Object.extend("Actions");
    let query=new Bmob.Query(ActionClass);
    query.get(actionId, {
      success: function (gameScore) {
        // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
        gameScore.set('actionStatus', status);
        gameScore.save();
        successCallback(gameScore);
        // The object was retrieved successfully.
      },
      error: function (object, error) {
        errorCallback(error)
      }
    });
  }


  //获取活动列表
  getActions(successCallback,errorCallback){
    let thisPage=this;
    let ActionClass = Bmob.Object.extend("Actions");
    let query=new Bmob.Query(ActionClass);
    let yesterday=new Date();
    yesterday.setDate(yesterday.getDate()-1);
    console.log('昨天',yesterday);
    query.greaterThan('beginDateTime',yesterday);
    query.descending("createdAt");
    //分页
    query.skip(this.skipValue);
    query.greaterThanOrEqualTo("actionStatus", 1);
    query.limit(3);
    query.find({
      success:function(res){
        console.log('获取Action列表成功',res);
        if(res.length == 0) {
          thisPage.flag = true;
        }
        if(thisPage.skipValue == 0) {
          thisPage.dataArr = res;
        }else {
          thisPage.dataArr = [...thisPage.dataArr, ...res];
        }
        // Object.assign(thisPage.dataArr, res);
        successCallback(thisPage.dataArr, thisPage.flag);
      },
      error:function(err){
        errorCallback(err);
      }
    });

  }
  //获取官方最近一条活动
  getAdmActions(successCallback,errorCallback){
    let thisPage=this;
    let ActionClass = Bmob.Object.extend("Actions");
    let query=new Bmob.Query(ActionClass);
    // let yesterday=new Date();
    // yesterday.setDate(yesterday.getDate()-1);
    // console.log('昨天',yesterday);
    // query.greaterThan('beginDateTime',yesterday);
    query.descending("createdAt");
    //分页
    query.skip(this.skipValue);
    //query.greaterThanOrEqualTo("actionStatus", 1);
    query.greaterThanOrEqualTo("userType", 100);
    //todo 条件官方活动
    query.limit(1);
    query.find({
      success:function(res){
        console.log('获取官方置顶活动成功',res);
        if(res.length == 0) {
          thisPage.flag = true;
        }
        if(thisPage.skipValue == 0) {
          thisPage.dataArr = res;
        }else {
          thisPage.dataArr = [...thisPage.dataArr, ...res];
        }
        // Object.assign(thisPage.dataArr, res);
        successCallback(thisPage.dataArr, thisPage.flag);
      },
      error:function(err){
        errorCallback(err);
      }
    });

  }
  //下来刷新重新
  getActionsRefresh(successCallback,errorCallback){
    let thisPage=this;
    let ActionClass = Bmob.Object.extend("Actions");
    let query=new Bmob.Query(ActionClass);
    let yesterday=new Date();
    yesterday.setDate(yesterday.getDate()-1);
    console.log('昨天',yesterday);
    query.greaterThan('beginDateTime',yesterday);
    query.descending("createdAt");
    //分页
    query.skip(this.skipValue);
    query.equalTo("actionStatus", 1);
    query.limit(2);
    query.find({
      success:function(res){
        console.log('获取Action列表成功',res);
        if(res.length == 0) {
          thisPage.flag = true;
        }
        //thisPage.dataArr = [...thisPage.dataArr, ...res];
        // Object.assign(thisPage.dataArr, res);
        successCallback(res, thisPage.flag);
      },
      error:function(err){
        errorCallback(err);
      }
    });

  }


  //获取附近的活动
  getActionNearby(lat,lng,successCallback,errorCallback){
    let locPoint = new Bmob.GeoPoint({latitude:lat, longitude: lng});
    let thisPage=this;
    let ActionClass = Bmob.Object.extend("Actions");
    let query=new Bmob.Query(ActionClass);
    let yesterday=new Date();
    yesterday.setDate(yesterday.getDate()-1);
    console.log('昨天',yesterday);
    query.greaterThan('beginDateTime',yesterday);
    query.near("location", locPoint);
    query.limit(10);
    query.select("beginDateTime", "title","addr","pos","location");
    query.find({
      success:function(res){
        console.log('附近的活动',locPoint,res);
        successCallback(res);
      },
      error:function(err){

        errorCallback(err);
      }
    });
  }

  //获取用户创建的活动
  getUserMakedActions(username,getAll,successCallback,errorCallback){
    var thisPage=this;
    var ActionClass = Bmob.Object.extend("Actions");
    var query=new Bmob.Query(ActionClass);
    let yesterday=new Date();
    yesterday.setDate(yesterday.getDate()-1);
    console.log('昨天',yesterday);
    if(!getAll){
      query.greaterThan('beginDateTime',yesterday);
    }
    query.descending("createdAt");
    query.equalTo("userName", username);
    query.skip(this.skipValueCreate);
    query.greaterThan("actionStatus", 0);
    query.limit(2);
    query.find({
      success:function(res){
        console.log('获取Action列表成功',res);
        if(thisPage.skipValueCreate == 0) {
          thisPage.dataArrCreate = res;
        }else {
          thisPage.dataArrCreate = [...thisPage.dataArrCreate, ...res];
        }
        successCallback(thisPage.dataArrCreate);
      },
      error:function(err){

        errorCallback(err);
      }
    });

  }
  //获取用户已加入的活动
  getUserJoinedActions(username,getAll,successCallback,errorCallback){
    let thisPage=this;
    let ApplyJoin=Bmob.Object.extend('applyJoinAction');
    let query=new Bmob.Query(ApplyJoin);

    query.equalTo('applyUser',username);
    query.equalTo('status',2);
    //query.equalTo('status',status);
    query.skip(this.skipValueJoin);
    query.limit(2);
    query.find({
      success:function(res){
        console.log('申请人列表',res);
        let actionIds=[];
        for(let i=0;i<res.length;i++){
          actionIds.push(res[i].attributes.actionId);
        }
        let Actions=Bmob.Object.extend('Actions');
        let actQuery=new Bmob.Query(Actions);
        actQuery.containedIn("objectId", actionIds);
        let yesterday=new Date();
        yesterday.setDate(yesterday.getDate()-1);
        if(!getAll){
          console.log('昨天',yesterday);
          actQuery.greaterThan('beginDateTime',yesterday);
        }

        actQuery.select("beginDateTime","actionStatus", "title","content","addr","pos", "image");
        actQuery.find({
          success:function(acts){
            console.log(username,'参加的活动',acts);
            if(thisPage.skipValueJoin == 0) {
              thisPage.dataArrJoin = acts;
            }else {
              thisPage.dataArrJoin = [...thisPage.dataArrJoin, ...res];
            }
            successCallback(thisPage.dataArrJoin)
          },
          error:function(err){
            console.log('获取申请人列表失败',err);
            errorCallback(err);
          }
        });
        //successCallback(res);
      },
      error:function(err){
        console.log('获取申请人列表失败',err);
        errorCallback(err);
      }

    });
  }
  //获取用户已加入的活动IDs
  // getUserJoinedActionsIDs(username,successCallback,errorCallback){
  //   let thisPage=this;
  //   let ApplyJoin=Bmob.Object.extend('applyJoinAction');
  //   let query=new Bmob.Query(ApplyJoin);
  //   query.equalTo('applyUser',username);
  //   query.equalTo('status',2);
  //   //query.equalTo('status',status);
  //   query.skip(this.skipValueJoin);
  //   query.limit(2);
  //   query.find({
  //     success:function(res){
  //       console.log('申请人列表',res);
  //       let actionIds=[];
  //       for(let i=0;i<res.length;i++){
  //         actionIds.push(res[i].attributes.actionId);
  //       }
  //       successCallback(actionIds);
  //     },
  //     error:function(err){
  //       console.log('获取申请人列表失败',err);
  //       errorCallback(err);
  //     }
  //
  //   });
  // }

  getActionDetail(actionId,successCallback,errorCallback){
    let Actions=Bmob.Object.extend('Actions');
    let actQuery=new Bmob.Query(Actions);
    actQuery.get(actionId,{
      success:function(act){
        console.log('活动详情',act);
        successCallback(act)
      },
      error:function(err){
        console.log('获取活动详情失败',err);
        errorCallback(err);
      }
    });
  }

  //保存活动评论
  saveActionComment(data,successCallback,errorCallback){
    var ActionComment = Bmob.Object.extend("ActionComment");
    var comment=new ActionComment();
    var thisPage=this;
    comment.save(data, {
      success: function(resp) {
        console.log('评论成功',resp);
        thisPage.incrementActionComment(data.actionId);
        successCallback(resp);

      },
      error: function(resp, error) {
        // 添加失败
        console.log('评论失败',resp);
        errorCallback(resp, error);
      }
    });
  }

  //活动评论计数
  incrementActionComment(actionId){
    var thisPage=this;
    var Actions = Bmob.Object.extend("Actions");
    var query=new Bmob.Query(Actions);

    query.get(actionId,{
      success:function(action){
        console.log('获取活动记录成功',action);
        action.increment('commentsCount');
        action.save();
        //successCallback(res);
      },
      error:function(err){

      }
    });
  }

  //查询评论
  queryActionComment(actionId,successCallback,errorCallback){
    var thisPage=this;
    var ActionComment = Bmob.Object.extend("ActionComment");
    var query=new Bmob.Query(ActionComment);
    query.equalTo('actionId',actionId);
    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取活动评论成功',res);
        successCallback(res);
      },
      error:function(err){

        errorCallback(err);
      }
    });
  }

  //向数据中添加用户及位置
  addInfo2Data(data,successCallback,errorCallback){
    var formatData=data;
    var thisPage=this;
    this.locUserInfo.isLoggedIn(function(val){
      formatData.userId=val.id;
      formatData.userName=val.attributes.username;
      if(data.pos){
        formatData.location=new Bmob.GeoPoint({latitude: data.pos.lat, longitude: data.pos.lng});
        successCallback(formatData);
      }else{
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
      }
      
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
  //获取活动Bmob对象
  getActionObject(actionId,successCallback,errorCallback){
    var thisPage=this;
    var Actions = Bmob.Object.extend("Actions");
    var query=new Bmob.Query(Actions);
    query.get(actionId,{
      success:function(action){

        successCallback(action);
      },
      error:function(obj,error){
        let alert = thisPage.alertCtrl.create({
          title: '活动信息获取失败',
          subTitle: '该功能只对认证用户开放',
          buttons: ['OK']
        });
        alert.present();
        errorCallback(error);
      }
    })
  }


  //申请加入小组
  applyJoin(actionId,successCallback,errorCallback){
    var thisPage=this;

    this.getActionObject(actionId,function(action){
      thisPage.locUserInfo.getLcoUserInfo(function(currentUser){

        thisPage.checkApplied(currentUser.attributes.username,action.id,function(res){
          console.log('已申请过，不可重复申请',res);
          let alert = thisPage.alertCtrl.create({
            title: '已发出申请',
            subTitle: '请等待活动组织者审批',
            buttons: ['OK']
          });
          alert.present();
        },function(err){
          console.log('没有申请过，添加申请',err);
          var ApplyJoin=Bmob.Object.extend('applyJoinAction');
          var applyJoin=new ApplyJoin;
          applyJoin.save({
            actionId:action.id,
            applyUser:currentUser.attributes.username,
            ActionOwner:action.attributes.userId,
            status:0
          }, {
            success: function(resp) {
              console.log('申请已发出',resp);
              thisPage.locUserInfo.informTheUser(action.attributes.userName,
                '用户['+currentUser.attributes.username+']想参加您组织的活动['+action.attributes.title+']，请尽快处理',
                0,
                function(msg){

                },function(err){

                }
              );

              let alert = thisPage.alertCtrl.create({
                title: '已发出申请',
                subTitle: '请等待活动组织者审批',
                buttons: ['OK']
              });
              alert.present();
              successCallback(resp);

            },
            error: function(resp, error) {
              // 添加失败
              console.log('申请失败',resp);
              thisPage.alertErr(error);
            }
          });
        });




      },function(obj,err){
        thisPage.alertErr(err);
        errorCallback(err);
      });
    },function(obj,err){
      thisPage.alertErr(err);
      errorCallback(err);
    });

  }

  //申请人列表
  getApplyList(actionId,successCallback,errorCallback){
    var thisPage=this;
    var ApplyJoin=Bmob.Object.extend('applyJoinAction');
    var query=new Bmob.Query(ApplyJoin);
    query.equalTo('actionId',actionId);
    //query.equalTo('status',status);
    query.find({
      success:function(res){
        console.log('申请人列表',res);
        successCallback(res);
      },
      error:function(err){
        console.log('获取申请人列表失败',err);
        errorCallback(err);
      }

    });
  }

  //更改申请状态；
  changeApplyStatus(userName,actionId,status,successCallbakc,errorCallback){
    //status:0未处理，1拒绝，2允许，4踢出
    this.checkApplied(userName,actionId,function(res){
      console.log('要修改状态的申请人列表获取成功',res);
      res.set('status',status);
      res.save(null,{
        success:successCallbakc,
        error:successCallbakc
      });
    },function(err){
      console.log('要修改状态的申请人列表获取失败',err);
      errorCallback(err);
    });

  }
  //检查是否已有加入小组的记录
  checkApplied(userName,actionId,successCallback,errorCallback){
    var ApplyJoin=Bmob.Object.extend('applyJoinAction');
    var query=new Bmob.Query(ApplyJoin);
    query.equalTo('actionId',actionId);
    query.equalTo('applyUser',userName);
    query.first({
      success:function(res){
        console.log('已存在申请记录',res);
        if(res){
          successCallback(res);
        }else{
          errorCallback();
        }


      },
      error:function(err){
        console.log('没有申请记录',err);
        errorCallback(err);
      }

    });
  }


  //添加成员（限小组Owner）Todo:修改为直接申请状态，小组成员也通过查询申请状态来完成
  addMember(userId,actionId,successCallback,errorCallback){
    var thisPage=this;
    thisPage.changeApplyStatus(userId,actionId,2,function(res){

    },function(err){

    });

    this.getActionObject(actionId,function(action){
      console.log('当前小组',action);
      if(!action.attributes.member){
         action.attributes.member=[];
      }
      if(action.attributes.member.indexOf(userId)!==-1){
        let alert = thisPage.alertCtrl.create({
          title: '该用户已是小组成员',
          subTitle: '请勿重复添加',
          buttons: ['OK']
        });
        alert.present();
        return;
      }
      action.attributes.member.push(userId);
      action.save(null,{
        success:function(res){

          let alert = thisPage.alertCtrl.create({
            title: '成功添加成员',
            subTitle: '已将用户添加到小组'+action.attributes.title,
            buttons: ['OK']
          });
          alert.present();
          successCallback(res);
        },
        error:function(obj,err){
          thisPage.alertErr(err);
          errorCallback(err);
        }
      });
    },function(obj,err){
      thisPage.alertErr(err);
      errorCallback(err);
    });

  }

  deleteMember(actionId,memberId,successCallback,errorCallback){

     var thisPage=this;
    this.getApplyList(actionId,function(action){
      console.log('当前小组',action);
      if(!action.member){
         action.member=[];
      }
      for(let i of action) {
        action.member.push(i.id)
      }
      if(action.member.indexOf(memberId) < 0){
        let alert = thisPage.alertCtrl.create({
          title: '踢出用户失败',
          subTitle: '用户不是小组成员',
          buttons: ['OK']
        });
        alert.present();
        return;
      }
      action.member = new Set(action.member);
      if(action.member.has(memberId)) {
        var ApplyJoin=Bmob.Object.extend('applyJoinAction');
        var query=new Bmob.Query(ApplyJoin);
        query.get(memberId, {
          success: function(object) {
            // The object was retrieved successfully.
            object.destroy({
              success: function(deleteObject) {
                console.log(deleteObject)
                let alert = thisPage.alertCtrl.create({
                  title: '踢出用户成功',
                  subTitle: '用户已不是小组成员',
                  buttons: ['OK']
                });
                alert.present();
                successCallback(actionId);
              },
              error: function(err) {
                thisPage.alertErr(err);
                errorCallback(err);
              }
            });
          },
          error: function(err) {
            thisPage.alertErr(err);
            alert("query object fail");
          }
        });
      }
      // action.attributes.member.remove(memberId);
      // action.save(null,{
      //   success:function(res){
      //     thisPage.locUserInfo.informTheUser(memberId,
      //       '活动['+action.attributes.title+']组织者已拒绝你参与，非常遗憾！',
      //       0,
      //       function(msg){
      //
      //       },function(err){
      //
      //       }
      //     );
      //     let alert = thisPage.alertCtrl.create({
      //       title: '踢出用户成功',
      //       subTitle: '用户不是小组成员',
      //       buttons: ['OK']
      //     });
      //     alert.present();
      //     successCallback(res);
      //   },
      //   error:function(obj,err){
      //     thisPage.alertErr(err);
      //     errorCallback(err);
      //   }
      // });
    },function(obj,err){
      thisPage.alertErr(err);
      errorCallback(err);
    });
  }

  //删除的applyJoin方法
  applyJoin_(actionId,successCallback,errorCallback){
    var thisPage=this;
    this.getActionObject(actionId,function(action){
      thisPage.locUserInfo.getLcoUserInfo(function(currentUser){

          console.log('当前小组',action);
          if(!action.attributes.member){
             action.attributes.member=[];
          }
          if(action.attributes.member.indexOf(currentUser.id)!==-1){
            let alert = thisPage.alertCtrl.create({
              title: '已发过申请',
              subTitle: '请等待小组Leader审批',
              buttons: ['OK']
            });
            alert.present();
            return;
          }
          action.attributes.member.push(currentUser.id);
          action.save(null,{
            success:function(res){
              let alert = thisPage.alertCtrl.create({
                title: '已发出申请',
                subTitle: '请等待活动Leader审批',
                buttons: ['OK']
              });
              alert.present();
              successCallback(res);
            },
            error:function(obj,err){
              thisPage.alertErr(err);
              errorCallback(err);
            }
          });
      },function(obj,err){
        thisPage.alertErr(err);
        errorCallback(err);
      });
    },function(obj,err){
      thisPage.alertErr(err);
      errorCallback(err);
    });

  }

  //请求失败弹窗
  alertErr(err){
    let alert = this.alertCtrl.create({
      title: '请求失败',
      subTitle: err.message,
      buttons: ['OK']
    });
    alert.present();
  }

}
