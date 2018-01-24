import {Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl,AbstractControl} from '@angular/forms';
import { NavController,Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { LocUserInfo } from '../../service/locUser';
import { RegistPage } from '../regist/regist';

declare var Bmob;
@Component({
 selector: 'page-login',
 templateUrl: 'login.html'
})

export class LoginPage {
  loginForm: FormGroup;
  username: any;
  password: any;
  user_input = {
    username:'',
    password:''
  };

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private locUserInfo:LocUserInfo,
    private formBuilder: FormBuilder,


    public events:Events
  ) {
    var thisPage=this;
    this.loginForm = formBuilder.group({
      username: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(20), Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    })
    this.username = this.loginForm.controls['username'];
    this.password = this.loginForm.controls['password'];

  }
  ngOnInit(){

  }

  login(){
    var thisPage=this;
    thisPage.user_input = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };
    this.locUserInfo.login(this.loginForm.value.username, this.loginForm.value.password,function(user){
       thisPage.navCtrl.pop();
       thisPage.events.publish('user:login', user, Date.now());
       console.log('触发用户登录事件');
    },function(user,error){

    });
  }


  openRegistPage(){
      //this.navCtrl.pop();
      this.navCtrl.push(RegistPage);
  }

}
