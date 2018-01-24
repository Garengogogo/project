import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Calendar } from '@ionic-native/calendar';

declare var Bmob;

@Injectable()
export class CalendarService {

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private calendar:Calendar
  ) {

  }
  
  requestPermission(callback){
    let thisPage=this;
    this.calendar.hasReadWritePermission().then((val)=>{
      if(val){
        console.log('具有日程读写权限');
        callback();
      }else{
        thisPage.calendar.requestReadWritePermission().then((res)=>{
          console.log('请求日程读写权限：',res);
          callback();
        });
      }
    });
  }

  createLocEvent(action){
    let startDate=new Date(action.attributes.beginDateTime);
    let endDate=new Date(action.attributes.beginDateTime);
    console.log('startDate',startDate);
    this.calendar.createEvent(action.attributes.title,action.attributes.addr,action.attributes.content,startDate,endDate).then(
      (msg) =>{
        console.log('createEvent:',msg);
      },
      (err) => {
        console.log('createEvent Err',err);
      }
    );
  }
  findEvent(action,successCallback,errorCallback){
    let startDate=new Date(action.attributes.beginDateTime);
    let endDate=new Date(action.attributes.beginDateTime);
    this.calendar.findEvent(action.attributes.title,action.attributes.addr,action.attributes.content,startDate,endDate).then(
      (msg) =>{
        console.log('findEvent:',msg);
        successCallback(msg);
      },
      (err) => {
        console.log(err);
        errorCallback(err);
      }
    );
  }
  deleteEvent(action,successCallback,errorCallback){
    let startDate=new Date(action.attributes.beginDateTime);
    let endDate=new Date(action.attributes.beginDateTime);
    this.calendar.deleteEvent(action.attributes.title,action.attributes.addr,action.attributes.content,startDate,endDate).then(
      (msg) =>{
        console.log('deletedEvent:',msg);
        successCallback(msg);
      },
      (err) => {
        console.log(err);
        errorCallback(err);
      }
    );
  }

  getAllLocEvent(successCallback){
    this.calendar.listCalendars().then(
      (msg) =>{
        console.log(msg);
        successCallback(msg);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  openCalendar(date){
    this.calendar.openCalendar(date);
  }


  
}
