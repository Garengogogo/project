import { Component,ViewChild } from '@angular/core';
import { Platform,Nav,IonicApp,ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { MessagesDetailProvider } from '../providers/messages-detail/messages-detail';

@Component({
  templateUrl: 'app.html',
  providers : [MessagesDetailProvider]
})

export class MyApp {
  rootPage:any = TabsPage;
  backButtonPressed: boolean = false;  //用于判断返回键是否触发
   @ViewChild('myNav') nav: Nav;
  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public toastCtrl: ToastController,
    public ionicApp: IonicApp
    ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.registerBackButtonAction();//注册返回按键事件
    });
  }

  registerBackButtonAction() {
     this.platform.registerBackButtonAction(() => {
       //如果想点击返回按钮隐藏toast或loading或Overlay就把下面加上
       console.log('点击返回按钮啦~~~',this.backButtonPressed);
       this.ionicApp._toastPortal.getActive() || this.ionicApp._loadingPortal.getActive() || this.ionicApp._overlayPortal.getActive()
       let activePortal = this.ionicApp._modalPortal.getActive();
       if (activePortal) {
         activePortal.dismiss().catch(() => {});
         activePortal.onDidDismiss(() => {});
         return;
       }
       //let activeVC = this.nav.getActive();
       //let tabs = activeVC.instance.tabs;
       //let activeNav = tabs.getSelected();
       //return activeNav.canGoBack() ? activeNav.pop() : this.showExit()
       this.showExit();
     }, 1);
   }

   //双击退出提示框
   showExit() {

     if (this.backButtonPressed) { //当触发标志为true时，即2秒内双击返回按键则退出APP
       this.platform.exitApp();
     } else {
       this.toastCtrl.create({
         message: '再按一次退出应用',
         duration: 2000,
         position: 'top'
       }).present();
       this.backButtonPressed = true;
       setTimeout(() => this.backButtonPressed = false, 2000);//2秒内没有再次点击返回则将触发标志标记为false
     }
   }
}
