import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

declare var Bmob;
declare var AMap;
@Injectable()
export class UserGeoLocation {
  //todo:凡是获取到新的位置，向后端保存位置。

  constructor(
    public alertCtrl: AlertController,
    private geolocation: Geolocation,
    private storage: Storage
  ) {

  }
  getUserLocation_cordova(callback,errCallback){
    var thisPage=this;
    console.log('get geoLocation...');
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      this.storage.set('lastLocPosition',{
        lat:resp.coords.latitude,
        lon:resp.coords.longitude
      });
      console.log('通过geolocation获取到位置',resp);
      callback(resp.coords.latitude,resp.coords.longitude);
    }).catch((error) => {
      let alert = thisPage.alertCtrl.create({
        title: '位置获取失败',
        subTitle: '请检查是否开启定位功能，并允许Maker使用位置信息！',
        buttons: ['OK']
      });
      alert.present();
      console.log('Error getting location', error);
      if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
          console.log('通过H5方式获取到位置',position);
          this.storage.set('lastLocPosition',{
            lat:position.coords.latitude,
            lon:position.coords.longitude
          });
          callback(position.coords.latitude,position.coords.longitude);
        },function(err){
          errCallback(err);
        });
      }else{
        let alert = thisPage.alertCtrl.create({
          title: '通过H5方式获取位置失败',
          subTitle: '请检查是否开启定位功能，并允许Maker使用位置信息！',
          buttons: ['OK']
        });
        alert.present();
      }
    });
  }

  getUserLocation(callback,errCallback){
    var thisPage=this;
    console.log('正在通过H5方式获取位置...');
    navigator.geolocation.getCurrentPosition(function(position){
      console.log('通过H5方式获取到位置',position);
      thisPage.storage.set('lastLocPosition',{
        lat:position.coords.latitude,
        lon:position.coords.longitude
      });
      callback(position.coords.latitude,position.coords.longitude);
    },function(err){
      thisPage.getUserLocationFromStorage(function(val){
        console.log('通过H5方式获取位置失败，使用上次的定位',val);
        callback(val.lat,val.lon);
      },function(){
        errCallback(err);
      });

    });
  }

  //

  getUserLocationFromStorage(callback,errCallback){
    this.storage.get('lastLocPosition').then((val)=>{
      if(val){
        callback(val);
      }else{
        errCallback();
      }

    });
  }

   Rad(d){
      return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
   }
  getDistance(lng1,lat1,lng2,lat2){
    var thisPage=this;
    // 计算两个坐标之间的距离
    // var a = (lat1 - lat2);
    // var b = (lng1 - lng2);
    // var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(b / 2), 2)));
    // s = s * 6378.137;
    // // EARTH_RADIUS;
    // s = Math.round(s * 10000) / 10000;
    // return s;

    var radLat1 = thisPage.Rad(lat1);
    var radLat2 = thisPage.Rad(lat2);
    var a = radLat1 - radLat2;
    var  b = thisPage.Rad(lng1) - thisPage.Rad(lng2);
    var s:any = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
        Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    s = s.toFixed(4);
    return s;




  }

  update(){
    var thisPage=this;
    this.storage.get('userInfo').then((val) => {
       if(!val.id){
         return ;
       }
       console.log('storageData',val);
       console.log('get geoLocation...');
        this.geolocation.getCurrentPosition().then((resp) => {
          // resp.coords.latitude
          // resp.coords.longitude

         this.storage.set('lastLocPosition',{
            lat:resp.coords.latitude,
            lon:resp.coords.longitude
         });
         var userGeoLocation = Bmob.Object.extend("userGeoLocation");
         var myGeoLocation=new userGeoLocation();
         myGeoLocation.save({
          lat: resp.coords.latitude,
          lon: resp.coords.longitude,
          userid:val.id,
          uname:val.attributes.username
        }, {
          success: function(resp) {
            // 添加成功
           /* let alert = thisPage.alertCtrl.create({
              title: '位置记录成功',
              subTitle: '位置记录成功！',
              buttons: ['OK']
            });
            alert.present();*/
            console.log('位置记录成功',resp);
          },
          error: function(reps, error) {
            // 添加失败
            console.log('位置记录失败',error);
            let alert = thisPage.alertCtrl.create({
              title: '位置记录失败',
              subTitle: '位置记录失败！',
              buttons: ['OK']
            });
            alert.present();
          }
        });
        }).catch((error) => {
          let alert = thisPage.alertCtrl.create({
            title: '位置获取失败',
            subTitle: '请检查是否开启定位功能，并允许Maker使用位置信息！',
            buttons: ['OK']
          });
          alert.present();
          console.log('Error getting location', error);
        });





      });
  }

  update_bak(){


  }

  getLocPosWithAmap(successCallback){
    let geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,//是否使用高精度定位，默认:true
        timeout: 10000,          //超过10秒后停止定位，默认：无穷大
        maximumAge: 0,           //定位结果缓存0毫秒，默认：0
        convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: true,        //显示定位按钮，默认：true
        buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
        showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false

    });
    geolocation.getCurrentPosition();
    AMap.event.addListener(geolocation, 'complete', successCallback);//返回定位信息
    AMap.event.addListener(geolocation, 'error', function(err){
      console.log('高德定位失败...');
    });
  }

  getLonLatAddr(lon,lat,successCallback){
    AMap.service('AMap.Geocoder',function(){//回调函数
        //实例化Geocoder
        var geocoder = new AMap.Geocoder();
        //TODO: 使用geocoder 对象完成相关功能
        var lnglatXY=[lon,lat];//地图上所标点的坐标
        geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
               //获得了有效的地址信息:
               //即，result.regeocode.formattedAddress
               console.log('address:',result);
               successCallback(result);
            }else{
               //获取地址失败
            }
        });
      });
  }

  getLocAddr(successCallback){
    var thisPage=this;
    this.getUserLocation(function(lat,lon){
      thisPage.getLonLatAddr(lon,lat,function(result){
        successCallback(result);
      });
    },function(err){

    });

    /*thisPage.getLocPosWithAmap(function(pos){
      console.log('高德定位...',pos);
    });*/


  }



}

