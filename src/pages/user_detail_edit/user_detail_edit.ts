import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { TeamService } from '../../service/teamService';
import { LocUserInfo } from '../../service/locUser';



@Component({
  selector: 'page-user_detail_edit',
  templateUrl: 'user_detail_edit.html'
})
export class UserDetailEditPage {
  
	userDetail={
    attributes:{

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

  constructor(
    public navCtrl: NavController,
    private navParams:NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private teamService:TeamService,
    private camera: Camera,
    private locUserInfo:LocUserInfo
  ) {
  	
  }
  
  pickImg(){
    var thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "加载本机图片"
    });
    loader.present();
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth:120,
      targetHeight:120,
      sourceType:0  //1:CAMERA,0:PHOTOLIBRARY,2:SAVEDPHPTOALBUM,
      
    })
    .then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64:
     let base64Image = 'data:image/jpeg;base64,' + imageData;
     thisPage.userDetailPlus.attributes.headimg=base64Image;
     loader.dismiss();
    }, (err) => {
     // Handle error
     let alert = thisPage.alertCtrl.create({
          title: '获取图片失败',
          subTitle: '请允许应用访问相机和相册',
          buttons: ['OK']
        });
      alert.present();
      loader.dismiss();
    });

  }

  save(){
    var thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在保存..."
    });
    loader.present();
    this.locUserInfo.saveUserDetailPlus(this.userDetailPlus,function(resp){
      let alert = thisPage.alertCtrl.create({
          title: '保存成功',
          subTitle: '用户信息保存成功',
          buttons: ['OK']
        });
       loader.dismiss();
      alert.present();
     
    },function(err){
      let alert = thisPage.alertCtrl.create({
          title: '保存失败',
          subTitle: '用户信息保存失败',
          buttons: ['OK']
        });
      loader.dismiss();
      alert.present();
      
    });
  }
  cancel(){
    this.navCtrl.pop();
  }

  getUserInfo(){
    let thisPage=this;
    this.locUserInfo.autoLogin(function(user){
      thisPage.userDetail=user;
      thisPage.locUserInfo.getUserDetailPlus(user.attributes.username,function(userDetailPlus){
         thisPage.userDetailPlus=userDetailPlus;
      },function(error){
         console.log('用户详情数据获取失败');
      });

    },function(){

    })
  }

  

  ngOnInit(){
   this.getUserInfo();
  }

}
