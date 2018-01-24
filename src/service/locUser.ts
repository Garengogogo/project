import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { UserGeoLocation } from './userGeoLocation';

declare var Bmob;

@Injectable()
export class LocUserInfo {

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    private uGeoLocation:UserGeoLocation
  ) {

  }
  isLoggedIn(trueCallback,falseCallback){
    this.storage.get('userInfo').then((val) => {
      if(val.id){
        console.log('用户已认证并登录');
        trueCallback(val);
      }else{
        console.log('用户未登录或未被认证');
        falseCallback(val);
      }
    });
  }
  isValidated(trueCallback,falseCallback){
    this.storage.get('userInfo').then((val) => {
      if(val.attributes.emailVerified){
        console.log('用户已认证');
        trueCallback(val);
      }else{
        console.log('用户未认证');
        falseCallback(val);
      }
    });
  }
  autoLogin(successCallback,errorCallback){
    var thisPage=this;
    console.log('自动登录...');
    this.storage.get('loginInfo').then((val) => {
        console.log('loginInfo', val);
        if(val){
          if(val.username){
            if(val.password){
              thisPage.login(val.username,val.password,function(user){
                successCallback(user);
              },function(user,error){
                thisPage.clearLocUser(function(val){
                  errorCallback(user,error);
                });
               
              });
            }else{
              errorCallback(val,'noPsword');
            }
          }else{
            errorCallback(val,'noUsername');
          }
        }else{
          errorCallback(val,'noLoginInfo');
        }
        
      });
  }
  clearLocUser(successCallback){
    var thisPage=this;
    thisPage.storage.remove('userInfo').then(()=>{
      thisPage.storage.remove('loginInfo').then((val) => {
        thisPage.storage.remove('loginInfo');
        console.log('login page...');
        //this.navCtrl.push(LoginPage);
        successCallback();
      });
    });
    
  }

  login(username,password,successCallback,errorCallback){
    var thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在登录，请稍候..."
    });
    loader.present();
    Bmob.User.logIn(username, password, {
      success: function(user) {
        // Do stuff after successful login.
        console.log('登录成功',thisPage);
        thisPage.storage.set('userInfo',user);
        thisPage.storage.set('loginInfo',{
          username:username,
          password:password
        });

        thisPage.storage.get('userInfo').then((val) => {
          console.log('userInfo', val);
          thisPage.uGeoLocation.update();
        });
        loader.dismiss();
        //thisPage.navCtrl.pop();
        successCallback(user);
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        console.log('登录失败');
        let alert = thisPage.alertCtrl.create({
          title: '登录失败',
          subTitle: '用户名或密码错误，请重新输入！',
          buttons: ['OK']
        });
        loader.dismiss();
        alert.present();
        thisPage.clearLocUser(function(){
           //清除用户信息
        });
        errorCallback(user,error);
      }
    });
  }
  signUp(userRegData,successCallback,errorCallback){
    var thisPage=this;
    var user=new Bmob.User();
    user.set('username',userRegData.username);
    user.set('password',userRegData.password);
    user.set('email',userRegData.email);
    //otherInfo
    user.set('nickname',userRegData.nickname);
    user.set('realname',userRegData.realname);
    user.set('gender',userRegData.gender);

    let loader = this.loadingCtrl.create({
      content: "正在注册，请稍候..."
    });
    loader.present();
    this.clearLocUser(function(){
      user.signUp(null,{
       success:function(user){
          console.log('注册成功',user);
          let alert = thisPage.alertCtrl.create({
            title: '注册成功',
            subTitle: '请登录到邮箱进行邮箱验证',
            buttons: [{
              text:'OK',
              handler:data =>{
                thisPage.storage.set('loginInfo',{
                  username:userRegData.username,
                  password:userRegData.password
                }).then(()=>{
                  console.log('loginInfo saved to storage');
                  thisPage.saveNewUserDetailPlus(userRegData,function(resp){
                    //创建用户详情
                  },function(err){
                    //创建用户失败
                  })
                  successCallback(user);
                  /*thisPage.storage.set('userInfo',user).then(()=>{
                    console.log('userInfo saved to storage');
                    //thisPage.uGeoLocation.update();
                    
                  });*/
                });
                
                
              }
            }]
          });
          loader.dismiss();
          alert.present();
          
       },
       error:function(user,error){
          console.log('注册失败',error);
          let alert = thisPage.alertCtrl.create({
            title: '注册失败',
            subTitle: error.message,
            buttons: ['OK']
          });
          loader.dismiss();
          alert.present();
          errorCallback(user,error);
       }
    });
    });
    
  }

  getUserInfo(userName,successCallback,errorCallback){
    var thisPage=this;
    var query=new Bmob.Query(Bmob.User);
    console.log('get user userName:',userName);
    query.equalTo('username',userName);
    query.find({
      success:successCallback,
      error:errorCallback
    });
  }
  getLcoUserInfo(successCallback,errorCallback){
    this.storage.get('userInfo').then((val) => {
        console.log('userInfo', val);

        if(val){
          if(!val.attributes){
            val.attributes=val;
          }
          successCallback(val);
        }else{
          errorCallback(val);
        }
    });
  }

  saveNewUserDetailPlus(data,successCallback,errorCallback){
    var userDetailPlusClass = Bmob.Object.extend("UserDetailPlus");
    var userDetailPlus=new userDetailPlusClass();
    var thisPage=this;
    userDetailPlus.set('username',data.username);
    userDetailPlus.set('tel','');
    userDetailPlus.set('birthday','');
    userDetailPlus.set('resume','');
    userDetailPlus.set('headimg','');
    userDetailPlus.save(data, {
      success: function(resp) {
        console.log('用户信息保存成功',resp);
        successCallback(resp);
        
      },
      error: function(resp, error) {
        // 添加失败
        console.log('用户信息保存失败',resp);
        errorCallback(resp, error);
      }
    });
  }
  getUserDetailPlus(username,successCallback,errorCallback){
    var userDetailPlusClass = Bmob.Object.extend("UserDetailPlus");
    var userDetailPlusQuery=new Bmob.Query(userDetailPlusClass);
    var thisPage=this;
    userDetailPlusQuery.equalTo("username", username);
    userDetailPlusQuery.find({
      success: function(resp) {
        console.log('用户信息获取成功',resp);
        if(resp.length==0){
          thisPage.saveNewUserDetailPlus({
            username:username
          },function(resp){
            //console.log('创建新用户信息');
            //successCallback(resp[0]);
            thisPage.getUserDetailPlus(username,successCallback,errorCallback);
          },function(err){
            console.log('创建新用户信息失败',err);
          });
        }else{
          thisPage.storage.set('myself_plus',resp[0]).then(function(newVal){
            console.log('已存储用户详情到本地',newVal);
            successCallback(newVal);
          });
          //successCallback(resp[0]);
        }
        
        
      },
      error: function(resp, error) {
        // 添加失败
        console.log('用户信息获取失败',resp);
        errorCallback(resp, error);
      }
    });
  }
  getUserDetailPlusFromLoc(successCallback){
    this.storage.get('myself_plus').then(function(newVal){
      successCallback(newVal);
    });
  }
  saveUserDetailPlus(data,successCallback,errorCallback){
    var userDetailPlusClass = Bmob.Object.extend("UserDetailPlus");
    var userDetailPlusQuery=new Bmob.Query(userDetailPlusClass);
    var thisPage=this;
    userDetailPlusQuery.get(data.id, {
      success: function(resp) {
        console.log('保存前获取到用户信息',resp);
        console.log('要保存的信息',data);
        resp.set('tel',data.attributes.tel);
        resp.set('birthday',data.attributes.birthday);
        resp.set('major',data.attributes.major);
        resp.set('resume',data.attributes.resume);
        resp.set('headimg',data.attributes.headimg);
        resp.save(null,{success:function(res_save){
          console.log('保存用户信息成功',res_save);
          successCallback(res_save);
        }});

        
      },
      error: function(resp, error) {
        // 添加失败
        console.log('用户信息保存成功',resp);
        errorCallback(resp, error);
      }
    });
  }

  saveImgFile(filename,base64,successCallback,errorCallback){
    console.log('保存文件',filename,base64);
    if(!base64){
      return;
    }
    if(base64.length<100){
      return;
    }
    var file = new Bmob.File(filename, base64);
    file.save().then(function(obj) {
      //alert(obj.url());
      console.log('文件保存成功',obj);
      successCallback(obj);
    }, function(error) {
      // the save failed.
      errorCallback(error);
    });
  }

  updateLocData(storageName,arr,thenCallback){
    var thisPage=this;
    var newArr=arr;
    this.getLocData(storageName,function(val){
      newArr.push(val);
      console.log('newArr',newArr);
      thisPage.storage.set(storageName,newArr).then(function(newVal){
        thenCallback(newVal);
      });
    });
    
  }
  setLocData(storageName,newArr,thenCallback){
      this.storage.set(storageName,newArr).then(function(newVal){
        thenCallback(newVal);
      });
  }
  getLocData(storageName,thenCallback){
    this.storage.get(storageName).then((val) => {
      console.log(storageName, val);
      thenCallback(val);
    });
  }
  getLocAddr(successCallback){
    this.uGeoLocation.getLocAddr(function(rs){
      successCallback(rs);
    });
  }
  saveDataToTable(data,table,successCallback,errorCallback){
    var tableClass = Bmob.Object.extend(table);
    var table=new tableClass();
    var thisPage=this;
    table.save(data,{
      success:function(msg){
        console.log('存储数据到表成功',data,table,msg);
        successCallback(msg);
      },
      error:function(err){
        console.log('存储数据到表失败',data,table,err);
        errorCallback(err);
      }
    });
  }
  informTheUser(to,message,type,successCallback,errorCallback){
    /*
      type的约定:
        0:系统通知（申请、审批等通知也属于系统通知）；
        1：用户消息（由用户发起的文本消息）
    */
    let thisPage=this;
    var now=new Date();
    let data={
      to:to,
      from:'system',
      message:message,
      type:type,
      timestamp:Date.parse(now.toString()),//时间戳，用于查询该时间后的新消息
      status:0 //0：未读；1：已读
    }
    this.getLcoUserInfo(function(locUser){
      data.from=locUser.attributes.username;
      thisPage.saveDataToTable(data,'informTheUser',function(msg){

        console.log('发送消息成功',msg);
        successCallback(msg);
      },function(err){
        console.log('发送消息失败');
        errorCallback(err)
      });

    },function(){
      console.log('未登录用户，无权限！！！');
    });
  }
  setMsgReaded(objectId){
    var tableClass = Bmob.Object.extend('informTheUser');
    var query = new Bmob.Query(tableClass);
    query.get(objectId, {
        success: function(msg) {
          // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
          msg.set('status', 1);
          msg.save();

          // The object was retrieved successfully.
        },
        error: function(object, error) {

        }
    });
  }

  countNewMessages(from,successCallback,errorCallback){
    /*
      from的约定：
        all:所有类型的消息
        system:所有系统消息
        [username]:来自该用户的所有消息
    */
    this.getLcoUserInfo(function(locUser){
      if(!locUser.attributes){
        locUser.attributes=locUser;
      }
      let tableClass = Bmob.Object.extend("informTheUser");
      let query=new Bmob.Query(tableClass);
      query.descending("createdAt");
      query.equalTo("to", locUser.attributes.username);
      query.equalTo("status", 0);
      if(from=='all'){

      }else if(from=='system'){
        query.equalTo("type", 0);
      }else{
        query.equalTo("user", from);
        query.equalTo("type", 1);
      }
      query.count({
        success:function(count){
          successCallback(count);
        },
        error:function(error){
          errorCallback(error);
        }
      });
  
    },function(){
      console.log('未登录用户，无权限！！！');
    });
  }

  getNewSysMessages(from,successCallback,errorCallback){
    /*
      from的约定：
        all:所有类型的消息
        system:所有系统消息
        allUsers:所有来自其他用户的消息
        [username]:来自该用户的所有消息
    */
    this.getLcoUserInfo(function(locUser){
      if(!locUser.attributes){
        locUser.attributes=locUser;
      }
      let tableClass = Bmob.Object.extend("informTheUser");
      let query=new Bmob.Query(tableClass);
      query.descending("createdAt");
      query.equalTo("to", locUser.attributes.username);
      query.equalTo("status", 0);
      if(from=='all'){

      }else if(from=='system'){
        query.equalTo("type", 0);
      }else if(from=="allUsers"){
        query.equalTo("type", 1);
      }else{
        query.equalTo("user", from);
        query.equalTo("type", 1);
      }
      query.find({
        success:function(res){
          console.log('获取新消息',res);
          successCallback(res);
        },
        error:function(error){
          console.log('获取新消息失败',error);
          errorCallback(error);
        }
      });
  
    },function(){
      console.log('未登录用户，无权限！！！');
    });
  }
  getUserdialogue(from,successCallback,errorCallback){
    //升级到：getUserdialogueNew
    let thisPage=this;
    this.getLcoUserInfo(function(locUser){
      let tableClass = Bmob.Object.extend("informTheUser");
      let query1=new Bmob.Query(tableClass);
      query1.equalTo("to", locUser.attributes.username);
      query1.equalTo("from", from);
      let query2=new Bmob.Query(tableClass);
      query2.equalTo("from", locUser.attributes.username);
      query2.equalTo("to", from);
      let query=new Bmob.Query.or(query1,query2);
      query.descending("createdAt");
      query.equalTo("type", 1);
      query.limit(10);
      query.find({
        success:function(res){
          console.log('获取消息',res);
          
          successCallback(thisPage.descendingArr(res));
        },
        error:function(error){
          console.log('获取消息失败',error);
          errorCallback(error);
        }
      });

    },function(){
      console.log('未登录用户，无权限！！！');
    });
  }
  getUserdialogueNew(timestamp,from,successCallback,errorCallback){
    this.getLcoUserInfo(function(locUser){
      let tableClass = Bmob.Object.extend("informTheUser");
      let query1=new Bmob.Query(tableClass);
      query1.equalTo("to", locUser.attributes.username);
      query1.equalTo("from", from);
      let query2=new Bmob.Query(tableClass);
      query2.equalTo("from", locUser.attributes.username);
      query2.equalTo("to", from);
      let query=new Bmob.Query.or(query1,query2);
      query.ascending("createdAt");
      query.equalTo("type", 1);
      query.greaterThan('timestamp',timestamp);
      query.limit(10);
      query.find({
        success:function(res){
          console.log('获取消息',res);
          successCallback(res);
        },
        error:function(error){
          console.log('获取消息失败',error);
          errorCallback(error);
        }
      });

    },function(){
      console.log('未登录用户，无权限！！！');
    });
  }
  saveMsg2Loc(from,to,data,successCallback,errorCallback){

  }

  addFriend(from,to,successCallback,errorCallback){
    let thisPage=this;
    this.isFriends(from,to,function(res){
      if(res.length==0){
        thisPage.saveDataToTable({
          from:from,
          to:to,
          status:0
        },'Friends',function(res){
          console.log('保存好友关系成功',res);
          successCallback(res);
        },function(err){
          console.log('保存好友关系失败',err);
        });
      }
    },function(err){
      if(err.code==101){
        thisPage.saveDataToTable({
          from:from,
          to:to,
          status:0
        },'Friends',function(res){
          console.log('保存好友关系成功',res);
          successCallback(res);
        },function(err){
          console.log('保存好友关系失败',err);
        });
      }
    });
    
  }
  isFriends(from,to,successCallback,errorCallback){
    let tableClass = Bmob.Object.extend("Friends");
    let query1=new Bmob.Query(tableClass);
    query1.equalTo("to", to);
    query1.equalTo("from", from);
    let query2=new Bmob.Query(tableClass);
    query2.equalTo("from", to);
    query2.equalTo("to", from);
    let query=new Bmob.Query.or(query1,query2);
    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取好友关系',res);
        successCallback(res);
      },
      error:function(error){
        console.log('获取好友关系失败',error);
        errorCallback(error);
      }
    });
  }
  getFriendList1(myusername,successCallback,errorCallback){
    //我关注的好友
    let thisPage=this;
    let tableClass = Bmob.Object.extend("Friends");
    let query=new Bmob.Query(tableClass);
    query.equalTo("from", myusername);
    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取我关注的好友',res);
        let usernameArr=[];
        for(let i=0;i<res.length;i++){
          usernameArr.push(res[i].attributes.to);
        }
        thisPage.getFriendDetailList(usernameArr,function(userList){
          successCallback(userList);
        },function(err){
          errorCallback(err);
        });
        
      },
      error:function(error){
        console.log('我关注的好友失败',error);
        errorCallback(error);
      }
    });
  }
  getFriendList2(myusername,successCallback,errorCallback){
    //关注我的好友
    let thisPage=this;
    let tableClass = Bmob.Object.extend("Friends");
    let query=new Bmob.Query(tableClass);
    query.equalTo("to", myusername);
    query.descending("createdAt");
    query.find({
      success:function(res){
        console.log('获取关注我的好友',res);
        let usernameArr=[];
        for(let i=0;i<res.length;i++){
          usernameArr.push(res[i].attributes.from);
        }
        thisPage.getFriendDetailList(usernameArr,function(userList){
          successCallback(userList);
        },function(err){
          errorCallback(err);
        });
      },
      error:function(error){
        console.log('获取关注我的好友失败',error);
        errorCallback(error);
      }
    });
  }
  getFriendDetailList(usernameArr,successCallback,errorCallback){
    var userDetailPlusClass = Bmob.Object.extend("UserDetailPlus");
    var userDetailPlusQuery=new Bmob.Query(userDetailPlusClass);
    var thisPage=this;
    userDetailPlusQuery.containedIn("username", usernameArr);
    userDetailPlusQuery.find({
      success: function(resp) {
        console.log('用户信息获取成功',resp);
        if(resp.length==0){
          
        }else{
          successCallback(resp);
        }
        
        
      },
      error: function(resp, error) {
        console.log('用户信息获取失败',resp);
        errorCallback(resp, error);
      }
    });
  }

  descendingArr(arr){
    let newArr=[];
    for(let i=0;i<arr.length;i++){
      newArr.push(arr[arr.length-1-i]);
    }
    return newArr;
  }
  formatDateString(dateString){
    return dateString.replace(/\-/g, "/"); 

  }
}
