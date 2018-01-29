import { NgModule, ErrorHandler, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { HttpModule} from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { Calendar } from '@ionic-native/calendar';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MyApp } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionsPage } from '../pages/actions/actions';
import { ActionPublishPage } from '../pages/action_publish/action_publish';
import { ActionDetailPage } from '../pages/action_detail/action_detail';
import { TeamsPage } from '../pages/teams/teams';
import { TeamPublishPage } from '../pages/teams_publish/team_publish';
import { TeamDetailPage } from '../pages/team_detail/team_detail';
import { BoardPage } from '../pages/board/board';
import { BoardPublishPage } from '../pages/board_publish/board_publish';
import { BoardCommentPage } from '../pages/board_comment/board_comment';
import { TabsPage } from '../pages/tabs/tabs';
// import { CalendarPage } from '../pages/CalendarPage/calendar';

import { LoginPage } from '../pages/login/login';
import { RegistPage } from '../pages/regist/regist';
import { AMapPage } from '../pages/amap/amap';
import { MessagesPage } from '../pages/messages/messages';

import{ UserDetailPage} from '../pages/user_detail/user_detail';
import{ UserDetailEditPage} from '../pages/user_detail_edit/user_detail_edit';
//import { MessagesDetailPage } from '../pages/messages-detail/messages-detail';
import { MessagesDetailPage } from '../pages/message_detail/messages_detail';
import { HttpClientModule } from "@angular/common/http";
import { UserGeoLocation } from '../service/userGeoLocation';
import { LocUserInfo } from '../service/locUser';
import { BoardService } from '../service/boardService';
import { TeamService } from '../service/teamService';
import { ActionService } from '../service/actionService';
import { CalendarService } from '../service/calendarService';
// import { NgCalendarModule  } from 'ionic2-calendar';
import { CalendarDetailPage } from '../pages/calendar-detail/calendar-detail';
import { ProfilesPage } from '../pages/profiles/profiles';
import { ToastService } from '../providers/util/toast.service';
// import { ChatService, ChatMessage, UserInfo } from "../providers/chat-service";
import {ChatService} from "../providers/chat-service";
import { IonicPageModule } from 'ionic-angular';
import {RelativeTime} from "../pipes/relative-time";
import {EmojiPickerComponentModule} from "../components/emoji-picker/emoji-picker.module";
import {EmojiProvider} from "../providers/emoji";
import { MyPage } from '../pages/my/my';
@NgModule({
  declarations: [
    MyApp,
    ActionsPage,
    ActionPublishPage,
    ActionDetailPage,
    TeamsPage,
    BoardPage,
    BoardPublishPage,
    BoardCommentPage,
    // CalendarPage,
    TabsPage,
    LoginPage,
    AMapPage,
    RegistPage,
    MessagesPage,
    TeamPublishPage,
    TeamDetailPage,
    UserDetailPage,
    UserDetailEditPage,
    MessagesDetailPage,
    CalendarDetailPage,
    ProfilesPage,
    RelativeTime,
    MyPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    // NgCalendarModule,
    ReactiveFormsModule,
    HttpClientModule,
    EmojiPickerComponentModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ActionsPage,
    ActionPublishPage,
    ActionDetailPage,
    TeamsPage,
    BoardPage,
    BoardPublishPage,
    BoardCommentPage,
    // CalendarPage,
    TabsPage,
    LoginPage,
    AMapPage,
    RegistPage,
    MessagesPage,
    TeamPublishPage,
    TeamDetailPage,
    UserDetailPage,
    UserDetailEditPage,
    MessagesDetailPage,
    CalendarDetailPage,
    ProfilesPage,
    MyPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LocUserInfo,
    HTTP,
    Geolocation,
    UserGeoLocation,
    BoardService,
    Camera,
    Calendar,
    TeamService,
    ActionService,
    CalendarService,
    ToastService,
    ChatService,
    EmojiProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    { provide: LOCALE_ID, useValue: 'zh-CN'}
  ]
})
export class AppModule {}
