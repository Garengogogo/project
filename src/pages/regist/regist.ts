import {Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl,AbstractControl} from '@angular/forms';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LocUserInfo } from '../../service/locUser';
import { UserGeoLocation } from '../../service/userGeoLocation';

declare var Bmob;
@Component({
  selector: 'page-regist',
  templateUrl: 'regist.html'
})

export class RegistPage {
  loginForm: FormGroup;
  username: any;
  password: any;
  password2: any;
  email: any;
  nickname: any;
  sex: any;
  user_input = {
    username:'',
    password:'',
    password2:'',
    email:'',
    nickname:'',
    sex:''
  };

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    private formBuilder: FormBuilder,
    private uGeoLocation:UserGeoLocation,
    private locUserInfo:LocUserInfo
  ) {
    var thisPage=this;
    this.loginForm = formBuilder.group({
      username: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(20), Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      password2: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      email: ['', Validators.compose([Validators.required, Validators.pattern("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$")])],
      nickname: ['', Validators.compose([Validators.minLength(1), Validators.maxLength(20), Validators.required])],
      sex: ['',Validators.compose([Validators.required])]
    })
    this.username = this.loginForm.controls['username'];
    this.password = this.loginForm.controls['password'];
    this.password2 = this.loginForm.controls['password2'];
    this.email = this.loginForm.controls['email'];
    this.nickname = this.loginForm.controls['nickname'];
    this.sex = this.loginForm.controls['sex'];
  }
  ngOnInit(){

  }
  regist(){
    var thisPage=this;
    this.loginForm.value;
    // if(this.user_input.password!==this.user_input.password2){
    //   let alert = thisPage.alertCtrl.create({
    //     title: '提示',
    //     subTitle: '两次输入的密码不一致，请重新输入',
    //     buttons: [{
    //       text:'OK',
    //       handler:data =>{
    //         thisPage.user_input.password='';
    //         thisPage.user_input.password2='';
    //       }
    //     }]
    //    });
    //   alert.present();
    //   return;
    // }
    thisPage.user_input = {
      username:this.loginForm.value.username,
      password:this.loginForm.value.password,
      password2:this.loginForm.value.password2,
      email:this.loginForm.value.email,
      nickname: this.loginForm.value.nickname,
      sex: this.loginForm.value.sex
    };
    this.locUserInfo.signUp(this.user_input,function(user){
       thisPage.navCtrl.pop();
    },function(user,error){

    });
  }

}
