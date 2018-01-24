import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { BoardService } from '../../service/boardService';



@Component({
  selector: 'page-board_comment',
  templateUrl: 'board_comment.html'
})
export class BoardCommentPage {
	comment={
		content:'',
		boardId:''
	};
	board={
		id:''
	};
	comments=[];
  constructor(
    public navCtrl: NavController,
    private navParams:NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private boardService:BoardService
  ) {
  	
  }
  
  sendComment(){
  	var thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "正在保存，请稍候..."
    });
    loader.present();
  	this.boardService.addInfo2Data(this.comment,function(data){
  		thisPage.boardService.saveBoardComment(data,function(resp){
  			console.log('评论成功！',resp);
  			let alert = thisPage.alertCtrl.create({
           title: '评论成功！',
           subTitle: '对板子话题的评论发布成功：',
           buttons: [{
            text:'OK',
            handler:data =>{
              thisPage.getComments(resp.attributes.boardId);
            }

          }]
        });
        loader.dismiss();
        alert.present();
  			
        
  		},function(err){
			console.log('评论失败！',err);
			loader.dismiss();
  		})
  	},function(err){
  		console.log('评论失败！',err);
  		loader.dismiss();
  	})
  }
  getComments(boardId){
  	let thisPage=this;
  	let loader = this.loadingCtrl.create({
      content: "数据加载中..."
    });
    loader.present();
  	this.boardService.queryBoardComment(boardId,function(resp){
  		console.log('queryBoardComment',resp);
  		thisPage.comments=resp;
  		loader.dismiss();
  	},function(err){
		console.error('queryBoardComment[ERR]',err);
		loader.dismiss();
  	});

  }
  ngOnInit(){
  	this.board=this.navParams.get('board');
  	this.comment.boardId=this.board.id;
  	console.log(this.board);
  	this.getComments(this.board.id);
  }

}
