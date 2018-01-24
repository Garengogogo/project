import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl,AbstractControl} from '@angular/forms';

import { BoardService } from '../../service/boardService';
import { ActionSheetController } from 'ionic-angular';

@Component({
  selector: 'page-board_publish',
  templateUrl: 'board_publish.html'
})
export class BoardPublishPage {
  boardForm: FormGroup;
  content: any;
  // image1: any;
  board={
    title:'',
    content:'',
    image:'assets/images/addImage.png',
    anonymity:false,
    location:{},
    commentsCount:0,
    filter:'none'
  };
  userInfoJS={};
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private boardService:BoardService,
    private actionSheetCtrl:ActionSheetController
  ) {
    this.boardForm = formBuilder.group({
      content: ['', Validators.compose([Validators.maxLength(120), Validators.required])],
    });
    this.content = this.boardForm.controls['content'];
  }
  ngOnInit(){

  }
  pickImg(){
    console.log('pick img ......');
    let actionSheet = this.actionSheetCtrl.create({
      title: '选择照片',
      buttons: [
        {
          text: '拍照',
          role: 'camera',
          handler: () => {
            console.log('选择拍照');
            this.pickImg_old(1);


          }
        },{
          text: '图库',
          role: 'photolib',
          handler: () => {
            console.log('从图库选择');
            this.pickImg_old(0);
          }
        },{
          text: '取消',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
  pickImg_old(sourceType){
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
      targetWidth:1080,
      targetHeight:1080,
      sourceType:sourceType  //1:CAMERA,0:PHOTOLIBRARY,2:SAVEDPHPTOALBUM,
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

  publishBoard(){
    let thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在发布板子，请稍候..."
    });
    loader.present();
    //if(this.board.image!='assets/images/addImage.png'){
    // this.board.content;
      this.boardService.publishBoard(this.board,function(resp){
        loader.dismiss();
        thisPage.navCtrl.pop();
      },function(err){
        loader.dismiss();
      });
   // }else{


   // }

  }
}
