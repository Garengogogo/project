import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagesDetailPage } from './messages-detail';

@NgModule({
  declarations: [
    MessagesDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(MessagesDetailPage),
  ],
})
export class MessagesDetailPageModule {}
