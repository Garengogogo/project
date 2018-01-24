import { Component } from '@angular/core';
import { NavController,App,ViewController } from 'ionic-angular';
import { UserGeoLocation } from '../../service/userGeoLocation';
import { ActionService } from '../../service/actionService';
import { BoardService } from '../../service/boardService';
import { LocUserInfo } from '../../service/locUser';

import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { ActionDetailPage } from '../action_detail/action_detail';
import { BoardCommentPage } from '../board_comment/board_comment';
declare var AMap;


@Component({
  selector: 'page-amap',
  templateUrl: 'amap.html'
})
export class AMapPage {
	public map: any;
  public myMarker:any;

  constructor(
    private uGeoLocation:UserGeoLocation,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public navCtrl: NavController,
    private actionService:ActionService,
    public appCtrl:App,
    private boardService:BoardService,
    private locUserInfo:LocUserInfo
  ) {
  	
  }
  rootNav=this.appCtrl.getRootNav();
  actMassLayer;
  boardsMassLayer;
  ngOnInit(){
    
    //loadMap
    console.log('loadMap...');
    var thisPage=this;
    let loader = this.loadingCtrl.create({
      content: "正在获取您现在的位置，请稍候..."
    });
    
    this.storage.get('lastLocPosition').then((val) => {
      console.log('lastLocPosition', val);
      if(val){
        /*thisPage.map = new AMap.Map('AMapMain',{
          view: new AMap.View2D({
            center:new AMap.LngLat(val.lon,val.lat),
            zoom:13,
            mapStyle: 'amap://styles/mymapstyle1'
          })
        });*/

        thisPage.map = new AMap.Map('AMapMain',{
           pitch:75,
            //viewMode:'3D',
            zoom: 17,
            expandZoomRange:true,
            zooms:[3,20],
            mapStyle: 'amap://styles/light',//样式URL
            center:new AMap.LngLat(val.lon,val.lat)
        });

        thisPage.getActionNearby(val.lat,val.lon);
        thisPage.mapInit();
        //loader.present();
        thisPage.uGeoLocation.getUserLocation(function(lat,lon){
          var lnglat= AMap.LngLat(lon,lat);
          thisPage.map.panTo(lnglat);
          //thisPage.markMe(lnglat,thisPage.map);
          //loader.dismiss();
          thisPage.getActionNearby(val.lat,val.lon);
        },function(err){
          //loader.dismiss();
        });
      }else{
        thisPage.uGeoLocation.getUserLocation(function(lat,lon){
          /*thisPage.map = new AMap.Map('AMapMain',{
            resizeEnable: true,
            zoom: 12,
            center: [lon,lat],
            mapStyle: 'amap://styles/mymapstyle1'
          });*/
          thisPage.map = new AMap.Map('AMapMain',{
             pitch:75,
              //viewMode:'3D',
              zoom: 17,
              expandZoomRange:true,
              zooms:[3,20],
              mapStyle: 'amap://styles/light',//样式URL
              center:new AMap.LngLat(val.lon,val.lat)
          });
          var lnglat= AMap.LngLat(lon,lat);
          //thisPage.markMe(lnglat,thisPage.map);
          //loader.dismiss();
          thisPage.mapInit();
        },function(err){
          //loader.dismiss();
          console.log('h5的定位功能也不可用');
        });
      }

      thisPage.map.on('moveend', function(moveedObj){
        let lnglat=thisPage.map.getCenter();
        console.log('地图平移',moveedObj,lnglat);
        thisPage.getActionNearby(lnglat.lat,lnglat.lng);
        thisPage.getBoardsNearby(lnglat.lat,lnglat.lng);
      });

    });  

  }
  
  mapInit(){
    var thisPage=this;
    AMap.plugin(['AMap.ToolBar','AMap.Scale','AMap.Geolocation'],
      function(){
        thisPage.map.addControl(new AMap.ToolBar());
        thisPage.map.addControl(new AMap.Scale());
        thisPage.map.addControl(new AMap.Geolocation());
    });
  }
  markMe(lnglat,map){
    this.myMarker = new AMap.Marker({
      position: lnglat,
      title: '我的位置',
      map: map
    });
  }
  addActionLayers(acts){
    let massObj=[];
    let thisPage=this;
    if(this.actMassLayer){
      this.map.remove([this.actMassLayer]);
      console.log('删除活动图层');
    }
    for(let i=0;i<acts.length;i++){
      massObj.push({
        lnglat:[acts[i].attributes.location.longitude,acts[i].attributes.location.latitude],
        act:acts[i]
      });
    }
    console.log('MassMarks',massObj);
    this.actMassLayer=new AMap.MassMarks(massObj,{
      zIndex:100,
      style:{
        anchor:new AMap.Pixel(16,52),
        url:'assets/icon/action.png',
        size:new AMap.Size(32,50)
      }
    });
    this.map.add([this.actMassLayer]);
    AMap.event.addListener(this.actMassLayer, 'click', function(clickObj){
      console.log('单击massMark',clickObj);
      thisPage.rootNav.push(ActionDetailPage,{
        action:clickObj.data.act
      });
    });
  }
  addBoardsLayers(boards){
    let massObj=[];
    let thisPage=this;
    if(this.boardsMassLayer){
      this.map.remove([this.boardsMassLayer]);
      console.log('删除板子图层');
    }
    for(let i=0;i<boards.length;i++){
      //todo:加判断，只显示三天内的板子
      massObj.push({
        lnglat:[boards[i].attributes.location.longitude,boards[i].attributes.location.latitude],
        board:boards[i]
      });
    }
    console.log('MassMarks-boards',massObj);
    this.boardsMassLayer=new AMap.MassMarks(massObj,{
      zIndex:101,
      style:{
        anchor:new AMap.Pixel(16,52),
        url:'assets/icon/board.png',
        size:new AMap.Size(32,50)
      }
    });
    this.map.add([this.boardsMassLayer]);
    AMap.event.addListener(this.boardsMassLayer, 'click', function(clickObj){
      console.log('单击boards-massMark',clickObj);
      thisPage.rootNav.push(BoardCommentPage,{
        board:clickObj.data.board
      });
    });
  }
  getActionNearby(lat,lng){
    let thisPage=this;
    this.actionService.getActionNearby(lat,lng,function(acts){
      //console.log('附近的活动',acts);
      thisPage.addActionLayers(acts);
    },function(err){

    });
  }
  getBoardsNearby(lat,lng){
    let thisPage=this;
    this.locUserInfo.getLocData('boards',function(locBoards){
      thisPage.addBoardsLayers(locBoards);
    });
    /*this.boardService.getBoardsNearby(lat,lng,function(boards){
      //console.log('附近的活动',acts);
      thisPage.addBoardsLayers(boards);
    },function(err){

    });*/
  }
}
