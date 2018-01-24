This is a starter template for [Ionic](http://ionicframework.com/docs/) projects.

## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myTabs tabs
```

Then, to run it, cd into `myTabs` and run:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.


todo:
开始页面（或广告）
板子列表，修改【用户】和【评论】按钮样式，改为链接，点击标题和图片进入板子详情；点击用户名查看用户详情；--OK
板子列表、详情中，根据创建时间显示3天倒计时，列表中不显示3天前的板子；--OK
板子列表、行动列表、小组列表，上拉加载下一页；（下拉刷新已实现）；--OK
日程列表，上拉加载下一页，下拉刷新；
板子详情，将评论功能固定到底部栏，参考【活动】详情中的发言；--评论需要放到footer中，固定在底部
板子详情，评论列表中去掉用户头像；
启动APP时，获取用户位置存储于本地storage，定时30s获取1次用户位置；
涉及到上传地理位置的功能，先取本地storage中存储的位置信息；--OK
底部中间的【发布】按钮，展开后点击任意功能需要收起；
小组列表中去掉标题部分的文字；
小组列表，增加Tab页，【我的小组】、【加入的小组】、【所有小组】；
行动列表，增加Tab页，【所有活动】、【加入的活动】、【我的活动】；
用户详情中，显示用户创建和加入的小组数量、参加的活动数量；
日程，根据是否开启提醒显示不同的图标；

活动详情、小组详情中，点击发布用户查看用户信息，并可关注和发私信

板子、行列列表中，显示距离；（service/userGeoLocation.ts 中定义了方法getDistance，可用于计算两个坐标之间的距离，暂未验证和应用）

板子和行动中，列表无内容时，显示提示文字。


关闭活动 ：在活动详情中增加“取消活动”按钮，取消活动时更新活动并向参与用户发送消息提醒；
解散小组：同上
用户成就系统

消息:
	消息总数显示 OK
	系统消息 50% (消息列表中需要增加将消息标注为以读功能,并增加查看历史消息功能,界面外观参考微信聊天界面)
	用户消息 
		用户详情中增加私信功能；
	好友消息


样式相关：

	详情页面不要card外框效果
	活动、板子卡片裁剪图片



-------2017-10-29------------

new Date方法在IOS中转换日期格式时有问题，解决办法使用自定义的方法格式化日期字符串：thisPage.locUserInfo.formatDateString();


Bug:修改个人信息后，本地存储和头像未即时更新



