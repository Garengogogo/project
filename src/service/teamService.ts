import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LocUserInfo } from './locUser';
import { UserGeoLocation } from './userGeoLocation';

declare var Bmob;
@Injectable()
export class TeamService {
  constructor(
    public alertCtrl: AlertController,
    private locUserInfo:LocUserInfo,
    private userGeoLocation:UserGeoLocation
  ) {

  }
  dataArr:any =[];
  dataArrCreate:any =[];
  dataArrJoin:any =[];
  //total: number =0;
  flag : boolean = false;
  skipValueCreate=0;
  skipValue=0;
  skipValueJoin=0;
  //保存小组数据到服务器
  saveTeamData(data,successCallback,errorCallback){
    var teamClass = Bmob.Object.extend("Teams");
    var team=new teamClass();
    var thisPage=this;
    team.save(data, {
      success: function(resp) {
        console.log('小组创建成功',resp);
        successCallback(resp);

      },
      error: function(resp, error) {
        // 添加失败
        console.log('小组创建失败',resp);
        errorCallback(resp, error);
      }
    });
  }
  //解散小组
  deleteTeam(teamId,successCallback, errorCallback) {
    var teamClass = Bmob.Object.extend("Teams");
    var thisPage=this;
    var query=new Bmob.Query(teamClass);
    query.get(teamId, {
      success: function(gameScore) {
        // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
        gameScore.set('teamStatus', 0);
        gameScore.save();
        successCallback(gameScore);
        // The object was retrieved successfully.
      },
      error: function(object, error) {

      }
    });



  }
  //发布小组（添加用户及地理位置信息）
  publishTeam(data,successCallback,errorCallback){
    var thisPage=this;
    this.addInfo2Data(data,function(formatData){
      thisPage.saveTeamData(formatData,function(resp){
          // 添加成功
           let alert = thisPage.alertCtrl.create({
           title: '小组创建成功',
           subTitle: '成功创建小组：'+resp.attributes.title,
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

  //获取小组列表
  getTeams(successCallback,errorCallback){
    var thisPage=this;
    var teamClass = Bmob.Object.extend("Teams");
    var query=new Bmob.Query(teamClass);
    query.descending("createdAt");
    query.skip(thisPage.skipValue);
    query.equalTo("teamStatus", 1);
    query.limit(5);
    query.find({
      success:function(res){
        console.log('获取小组列表成功',res);
        if(res.length == 0) {
          thisPage.flag = true;
        }
        if(thisPage.skipValue == 0) {
          thisPage.dataArr = res;
        }else {
          thisPage.dataArr = [...thisPage.dataArr, ...res];
        }
        successCallback(thisPage.dataArr,thisPage.flag);
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
//下来重新获取
  getTeamsRefresh(successCallback,errorCallback){
    var thisPage=this;
    var teamClass = Bmob.Object.extend("Teams");
    var query=new Bmob.Query(teamClass);
    query.descending("createdAt");
    query.equalTo("teamStatus", 1);
    query.limit(5);
    query.find({
      success:function(res){
        console.log('获取小组列表成功',res);
        if(res.length == 0) {
          thisPage.flag = true;
        }
        successCallback(res,thisPage.flag);
      },
      error:function(err){
        errorCallback(err);
      }
    });
  }

  //获取用户创建的小组
  getUserMakedActions(username,successCallback,errorCallback){
    var thisPage=this;
    var ActionClass = Bmob.Object.extend("Teams");
    var query=new Bmob.Query(ActionClass);
    query.skip(this.skipValueCreate);
    query.descending("createdAt");
    query.equalTo("userName", username);
    query.equalTo("teamStatus", 1);
    query.limit(5);
    query.find({
      success:function(res){
        console.log('获取我的小组列表成功',res);
        if(thisPage.skipValueCreate == 0) {
          thisPage.dataArrCreate = res;
        } else {
          thisPage.dataArrCreate = [...thisPage.dataArrCreate, ...res];
        }
        successCallback(thisPage.dataArrCreate);
      },
      error:function(err){

        errorCallback(err);
      }
    });

  }

  //获取用户已加入的小组
  getUserJoinedTeams(username,successCallback,errorCallback){
    let thisPage=this;
    let ApplyJoin=Bmob.Object.extend('applyJoin');
    let query=new Bmob.Query(ApplyJoin);
    query.equalTo('applyUser',username);
    query.equalTo('status',2);
    // query.equalTo("teamStatus", 1);
    //query.equalTo('status',status);
    query.skip(this.skipValueJoin);
    query.limit(5);
    query.find({
      success:function(res){
        console.log('申请人列表',res);
        let teamsIds=[];
        for(let i=0;i<res.length;i++){
          teamsIds.push(res[i].attributes.teamId);
        }
        let Teams=Bmob.Object.extend('Teams');
        let TeamsQuery=new Bmob.Query(Teams);
        TeamsQuery.containedIn("objectId", teamsIds);
        //TeamsQuery.select("title","content","addr","pos");
        TeamsQuery.find({
          success:function(teams){
            console.log(username,'加入的团队',teams);
            if(thisPage.skipValueJoin == 0) {
              thisPage.dataArrJoin = teams;
            } else {
              thisPage.dataArrJoin = [...thisPage.dataArrJoin, ...teams];
            }
            successCallback(thisPage.dataArrJoin)
          },
          error:function(err){
            console.log('获取加入的团队列表失败',err);
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

  //保存小组评论
  saveTeamComment(data,successCallback,errorCallback){
    var teamComment = Bmob.Object.extend("TeamComment");
    var comment=new teamComment();
    //var linkTeam = Bmob.Object.createWithoutData("Teams", data.teamId);
    //comment.set('parent',linkTeam);
    //var relation=teamComment.relation("team");
    //relation.add(linkTeam);
    var thisPage=this;
    comment.save(data, {
      success: function(resp) {
        console.log('评论成功',resp);
        thisPage.incrementTeamComment(data.teamId);
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
  incrementTeamComment(teamId){
    var thisPage=this;
    var Teams = Bmob.Object.extend("Teams");
    var query=new Bmob.Query(Teams);
    //query.equalTo('objectId',teamId);
    query.get(teamId,{
      success:function(team){
        console.log('获取小组记录成功',team);
        team.increment('commentsCount');
        team.save();
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

  //查询小组评论
  queryTeamComment(teamId,successCallback,errorCallback){
    var thisPage=this;
    var TeamComment = Bmob.Object.extend("TeamComment");
    var query=new Bmob.Query(TeamComment);
    query.equalTo('teamId',teamId);
    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取小组评论成功',res);
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
  //获取小组Bmob对象
  getTeamObject(teamId,successCallback,errorCallback){
    var thisPage=this;
    var Teams = Bmob.Object.extend("Teams");
    var query=new Bmob.Query(Teams);
    query.get(teamId,{
      success:function(team){
        //thisPage.currentTeam=team;
        successCallback(team);
      },
      error:function(obj,error){
        let alert = thisPage.alertCtrl.create({
          title: '小组信息获取失败',
          subTitle: '该功能只对认证用户开放',
          buttons: ['OK']
        });
        alert.present();
        errorCallback(error);
      }
    })
  }


  //申请加入小组
  //Todo:更改申请方式。点击申请后即一条记录保存于applyJoin表中（保存：申请者、小组、创建者、处理状态），在组建者的通知列表中显示；组建者审批后，将用户Id加入team的Members数据
  applyJoin(teamId,successCallback,errorCallback){
    var thisPage=this;

    this.getTeamObject(teamId,function(team){
      thisPage.locUserInfo.getLcoUserInfo(function(currentUser){

        thisPage.checkApplied(currentUser.attributes.username,team.id,function(res){
          console.log('已申请过，不可重复申请',res);
          let alert = thisPage.alertCtrl.create({
            title: '已发出申请',
            subTitle: '请等待小组Leader审批',
            buttons: ['OK']
          });
          alert.present();
        },function(err){
          console.log('没有申请过，添加申请',err);
          var ApplyJoin=Bmob.Object.extend('applyJoin');
          var applyJoin=new ApplyJoin;
          applyJoin.save({
            teamId:team.id,
            applyUser:currentUser.attributes.username,
            teamOwner:team.attributes.userId,
            status:0
          }, {
            success: function(resp) {
              console.log('申请已发出',resp);
              let alert = thisPage.alertCtrl.create({
                title: '已发出申请',
                subTitle: '请等待小组Leader审批',
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
  getApplyList(teamId,successCallback,errorCallback){
    var thisPage=this;
    var ApplyJoin=Bmob.Object.extend('applyJoin');
    var query=new Bmob.Query(ApplyJoin);
    query.equalTo('teamId',teamId);
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
  changeApplyStatus(userName,teamId,status,successCallbakc,errorCallback){
    //status:0未处理，1拒绝，2允许，4踢出
    this.checkApplied(userName,teamId,function(res){
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

    /*var ApplyJoin=Bmob.Object.extend('applyJoin');
    var query=new Bmob.Query(ApplyJoin);
    query.equalTo('teamId',teamId);
    query.equalTo('applyUser',userId);
    query.first({
      success:function(res){
        console.log('要修改状态的申请人列表获取成功',res);
        res.set('status',status);
        res.save();
      },
      error:function(err){
        console.log('要修改状态的申请人列表获取失败',err);

      }

    });*/
  }
  //检查是否已有加入小组的记录
  checkApplied(userName,teamId,successCallback,errorCallback){
    var ApplyJoin=Bmob.Object.extend('applyJoin');
    var query=new Bmob.Query(ApplyJoin);
    query.equalTo('teamId',teamId);
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
  addMember(userId,teamId,successCallback,errorCallback){
    var thisPage=this;
    thisPage.changeApplyStatus(userId,teamId,2,function(res){

    },function(err){

    });

    this.getTeamObject(teamId,function(team){
      console.log('当前小组',team);
      if(!team.attributes.member){
         team.attributes.member=[];
      }
      if(team.attributes.member.indexOf(userId)!==-1){
        let alert = thisPage.alertCtrl.create({
          title: '该用户已是小组成员',
          subTitle: '请勿重复添加',
          buttons: ['OK']
        });
        alert.present();
        return;
      }
      team.attributes.member.push(userId);
      team.save(null,{
        success:function(res){
         // thisPage.changeApplyStatus(userId,teamId,2);
          let alert = thisPage.alertCtrl.create({
            title: '成功添加成员',
            subTitle: '已将用户添加到小组'+team.attributes.title,
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

  deleteMember(teamId,memberId,successCallback,errorCallback){
     var thisPage=this;
    //this.getTeamObject(teamId,function(team){
    this.getApplyList(teamId,function(team){
      console.log('当前小组',team);
      if(!team.member){
         team.member=[];
      }
      for(let i of team) {
        team.member.push(i.id)
      }
      if(team.member.indexOf(memberId) < 0){
        let alert = thisPage.alertCtrl.create({
          title: '踢出用户失败',
          subTitle: '用户不是小组成员',
          buttons: ['OK']
        });
        alert.present();
        return;
      }
      team.member = new Set(team.member);
      if(team.member.has(memberId)) {
        var ApplyJoin=Bmob.Object.extend('applyJoin');
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
                successCallback(teamId);
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
      // team.member.delete(memberId);

      //team.member.remove(memberId);//未验证
      // team.save(null,{
      //   success:function(res){
      //     //thisPage.changeApplyStatus(memberId,teamId,4);
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
  applyJoin_(teamId,successCallback,errorCallback){
    var thisPage=this;
    this.getTeamObject(teamId,function(team){
      thisPage.locUserInfo.getLcoUserInfo(function(currentUser){
         //var currentUser=Bmob.User.current();
         // var relation=team.relation('applyJoin');//创建关联字段
         // relation.add(currentUser);//添加关联用户
          //team.set('applyJoin',relation);
          //team.save();
          console.log('当前小组',team);
          if(!team.attributes.member){
             team.attributes.member=[];
          }
          if(team.attributes.member.indexOf(currentUser.id)!==-1){
            let alert = thisPage.alertCtrl.create({
              title: '已发过申请',
              subTitle: '请等待小组Leader审批',
              buttons: ['OK']
            });
            alert.present();
            return;
          }
          team.attributes.member.push(currentUser.id);
          team.save(null,{
            success:function(res){
              let alert = thisPage.alertCtrl.create({
                title: '已发出申请',
                subTitle: '请等待小组Leader审批',
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
