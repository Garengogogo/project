import { Component,NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl,AbstractControl} from '@angular/forms';
import { LocUserInfo } from '../../service/locUser';
import { ActionService } from '../../service/actionService';

declare var AMapUI;
declare var AMap;
@Component({
  selector: 'page-action_publish',
  templateUrl: 'action_publish.html'
})
export class ActionPublishPage {
  actionForm: FormGroup;
  content: any;
  title: any;
  datetime: any;
  addr: any;
  action={
    title:'',
    content:'',
    image:'assets/images/addImage.png',
    anonymity:false,
    location:{},
    commentsCount:0,
    actionStatus : 1,
    memberCount:0,
    addr:'',
    pos:{
      lng:'104',
      lat:'30'
    },
    userType:0

  };
  userInfoJS={};
  userInfoPlus={
    attributes:{
      userType:0
    }
  };
  datePickerConfig={
    max:'2017-10-17',
    min:'2017-08-17'
  }

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private camera: Camera,
    private actionService:ActionService,
    private formBuilder: FormBuilder,
    private locUserInfo:LocUserInfo,
    private ngZone:NgZone
  ) {
    this.actionForm = formBuilder.group({
      content: ['', Validators.compose([Validators.maxLength(120), Validators.required])],
      title: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
      datetime: ['', Validators.compose([Validators.required])],
    });
    this.content = this.actionForm.controls['content'];
    this.title = this.actionForm.controls['title'];
    this.datetime = this.actionForm.controls['datetime'];
  }

  num2Str2(n){
    if(n<10){
      return '0'+n;
    }else{
      return n;
    }
  }
  setDatePicker(){
    let now=new Date();
    let minY=now.getFullYear();
    let minM=now.getUTCMonth()+1;
    let minD=now.getUTCDate();
    let maxY=minY;
    let maxM=minM+2;
    let maxD=minD;
    if(maxM>12){
      maxY=maxY+1;
      maxM=maxM-12;
    }
    minM=this.num2Str2(minM);
    minD=this.num2Str2(minD);
    maxM=this.num2Str2(maxM);
    maxD=this.num2Str2(maxD);
    this.datePickerConfig.max=maxY+'-'+maxM+'-'+maxD;
    this.datePickerConfig.min=minY+'-'+minM+'-'+minD;
    console.log('this.datePickerConfig',this.datePickerConfig);
  }

  ngOnInit(){
    let thisPage=this;
    /*this.locUserInfo.getLocAddr(function(addr){
      thisPage.action.addr=addr.regeocode.formattedAddress;
      console.log('thisPage.action',thisPage.action);
    });*/
    this.mapInit();
    this.setDatePicker();
    this.locUserInfo.getUserDetailPlusFromLoc(function(val){
      thisPage.userInfoPlus=val;
      console.log('当前用户',thisPage.userInfoPlus);
    });
  }

  mapInit(){
    var thisPage=this;
    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
      var map = new AMap.Map('mapPosPicker',{
          zoom:12
      });

      map.plugin('AMap.Geolocation', function () {
          let geolocation = new AMap.Geolocation({
              enableHighAccuracy: true,//是否使用高精度定位，默认:true
              timeout: 10000,          //超过10秒后停止定位，默认：无穷大
              maximumAge: 0,           //定位结果缓存0毫秒，默认：0
              convert: false,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
              showButton: true,        //显示定位按钮，默认：true
              buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
              buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
              showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
              showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
              panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
              zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          });
          map.addControl(geolocation);
          geolocation.getCurrentPosition();
          AMap.event.addListener(geolocation, 'complete', function(geolocationResult){
            console.log('AMap----geolocationResult',geolocationResult);

          });//返回定位信息
          AMap.event.addListener(geolocation, 'error', function(err){
            console.log('AMap----geolocationResult--err',err);
          });      //返回定位出错信息
      });

      var positionPicker = new PositionPicker({
          mode:'dragMap',//设定为拖拽地图模式，可选'dragMap'、'dragMarker'，默认为'dragMap'
          map:map,//依赖地图对象
          iconStyle:{//自定义外观
             url:'assets/icon/mark_bs.png',//图片地址
             size:[19,31],  //要显示的点大小，将缩放图片
             ancher:[24,40],//锚点的位置，即被size缩放之后，图片的什么位置作为选中的位置
          }
      });
      //TODO:事件绑定、结果处理等
      positionPicker.on('success', function(positionResult) {
        console.log('posPicker:',positionResult);
        thisPage.ngZone.run(() => {
          thisPage.action.pos = positionResult.position;
          thisPage.action.addr = positionResult.address;
        });

          //thisPage.action.pos.nearestJunction = positionResult.nearestJunction;
          /*document.getElementById('nearestRoad').innerHTML = positionResult.nearestRoad;
          document.getElementById('nearestPOI').innerHTML = positionResult.nearestPOI;*/
      });
      positionPicker.on('fail', function(positionResult) {
          // 海上或海外无法获得地址信息
          console.log('无法获得地址信息',positionResult);
      });
      positionPicker.start();
    });
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
      targetWidth:1080,
      targetHeight:1080,
      sourceType:0  //1:CAMERA,0:PHOTOLIBRARY,2:SAVEDPHPTOALBUM,

    })
    .then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64:
     let base64Image = 'data:image/jpeg;base64,' + imageData;
     thisPage.action.image=base64Image;
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


  publishAction(){
    let thisPage=this;

    this.actionForm.value


    let loader = this.loadingCtrl.create({
      content: "正在发布活动，请稍候..."
    });
    loader.present();
    //if(this.board.image!='assets/images/addImage.png'){
      this.action.userType=this.userInfoPlus.attributes.userType;
      this.actionService.publishAction(this.action,function(resp){
        loader.dismiss();
        thisPage.navCtrl.pop();
      },function(err){
        loader.dismiss();
      });


   // }else{


   // }

  }
}
