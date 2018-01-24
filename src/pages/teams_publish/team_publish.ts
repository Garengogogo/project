import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl,AbstractControl} from '@angular/forms';

import { TeamService } from '../../service/teamService';

@Component({
  selector: 'page-team_publish',
  templateUrl: 'team_publish.html'
})
export class TeamPublishPage {
  teamForm: FormGroup;
  content: any;
  title: any;
  board={
    title:'',
    content:'',
    teamStatus : 1,
    image:'assets/images/addImage.png',
    anonymity:false,
    location:{},
    commentsCount:0,
    memberCount:0


  };
  userInfoJS={};
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private camera: Camera,
    private teamService:TeamService
  ) {
    this.teamForm = formBuilder.group({
      content: ['', Validators.compose([Validators.maxLength(120), Validators.required])],
      title: ['', Validators.compose([Validators.maxLength(50), Validators.required])]
    });
    this.content = this.teamForm.controls['content'];
    this.title = this.teamForm.controls['title'];
  }
  ngOnInit(){

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
     thisPage.board.image=base64Image;
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


  publishTeam(){
    let thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在发布板子，请稍候..."
    });
    loader.present();
    //if(this.board.image!='assets/images/addImage.png'){
      this.teamService.publishTeam(this.board,function(resp){
        loader.dismiss();
        thisPage.navCtrl.pop();
      },function(err){
        loader.dismiss();
      });
   // }else{


   // }

  }
}
