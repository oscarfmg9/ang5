import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import * as firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable';
import { equal } from 'assert';
@Component({
  selector: 'app-landing-chat',
  templateUrl: './landing-chat.component.html',
  styleUrls: ['./landing-chat.component.scss']
})

export class LandingChatComponent implements OnInit {
  
  viwersObservable: Observable<any[]>;
  chatMessagesObservable: Observable<any[]>;
  messages: Observable<any[]>;
  viewers: Observable<any[]>;
  userRef: Observable<any[]>;

  constructor(private db: AngularFireDatabase) { }

  ngOnInit() {
    var entryId: string = '-L2XJLF_z2Tb737tSrVw';
    var pathToMessages: string = 'room-messages/'+entryId;
    var pathToUsers: string = 'users/'+entryId;
    this.chatMessagesObservable = this.getMessages(pathToMessages);
    this.viwersObservable = this.getViewers(pathToUsers);
  }

  sendStatus(event) {
    var target = event.target || event.srcElement || event.currentTarget;
    var idAtt = target.attributes.id;
    var useId = idAtt.nodeValue;//question Id
    var stVal = target.attributes.value;
    var stats = stVal.nodeValue;//question Status
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw';//Get Event ID
    var pathToUsers: string = 'users/'+chatRoom;
    switch (stats) {
      case 'ban':
        this.db.list(pathToUsers).update(useId,{status:'Banned'});
      break;
      case 'uba':
        this.db.list(pathToUsers).update(useId,{status:'Default'});
      break;
      default:
        break;
    }
  }

  getViewers(path): Observable<any[]>{
    this.viewers = this.db.list(path, ref => ref.orderByKey()).valueChanges();
    return this.viewers;
  }

  getMessages(path): Observable<any[]>{
    this.messages = this.db.list(path, ref => ref.orderByKey().limitToLast(10)).valueChanges();
    return this.messages;
  }

  createUser(): string{ //creates a new user returns UserId (Public Chat)
    //Def param
    var userEmail: string = (<HTMLInputElement>document.getElementById("user-email")).value;
    var userName: string = (<HTMLInputElement>document.getElementById("user-name")).innerHTML;
    //Get Event ID
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw'; //entry Id 
    //define Path
    var pathUser: string = 'users/'+chatRoom; 
    const userReference = this.db.list(pathUser);  
    const idUserRef = userReference.push('');
    var newUserId = idUserRef.key;
    // var easyId = registerEasy(userEmail,userName,pas);
    var newUserData  = {
          easyId:     'easyId',//id Easycast
          userId:     newUserId,
          name:       userName,
          email:      userEmail,
        };
    const newUserReference = this.db.list(pathUser);          
    newUserReference.update(newUserId,newUserData);
    
    return newUserId;
  }


  deleteRoom(entryId): string{
    var pathRoomMetadata: string = 'room-metadata/'+entryId;  
    const newUserReference = this.db.list(pathRoomMetadata).remove();
    return 'Successful';
  }

  createRoom(): string{
    //define Path
    var name: string = (<HTMLInputElement>document.getElementById("landingChatRoom-input-room-name")).value;
    var pathRoomMetadata: string = 'room-metadata'; 
    const userReference = this.db.list(pathRoomMetadata);  
    const idUserRef = userReference.push('');
    var newRoomId = idUserRef.key;
    var newRoomData  = {
          createdAt:  firebase.database.ServerValue.TIMESTAMP,
          entryId:    'entryId',
          name:       name,
          status:     'status', //private or public
          type:       'type',   //chat or QA
        };
    const newUserReference = this.db.list(pathRoomMetadata);          
    newUserReference.update(newRoomId,newRoomData);
    return 'Successful';
  }

  createNewChatRoom(entryId,name,type,status): string{
    //define Path
    var pathRoomMetadata: string = 'room-metadata'; 
    const userReference = this.db.list(pathRoomMetadata);  
    const idUserRef = userReference.push(entryId);
    var newRoomId = idUserRef.key;
    var newRoomData  = {
          createdAt:  firebase.database.ServerValue.TIMESTAMP,
          entryId:    entryId,
          name:       name,
          status:     status, //private or public
          type:       type,   //chat or QA
        };
    const newUserReference = this.db.list(pathRoomMetadata);          
    newUserReference.update(newRoomId,newRoomData);
    return 'Successful';
  }

  registerNewUser(user,id,email): string{
    //Get Event ID
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw';
    //define Path
    var pathUser: string = 'users/'+chatRoom; 
    const userReference = this.db.list(pathUser);  
    const idUserRef = userReference.push('');
    var newUserId = idUserRef.key;
    var newUserData  = {
          easyId:     id,
          userId:     newUserId,
          name:       user,
          email:      email,
        };
    const newUserReference = this.db.list(pathUser);          
    newUserReference.update(newUserId,newUserData);
    return 'Successful';
  }

  validateMessage(){
    //Def param
    var userEmail: string = (<HTMLInputElement>document.getElementById("user-email")).value;
    var userMessage: string = (<HTMLInputElement>document.getElementById("message-content")).value;
    //Message only 140 char
    var userMessage = this.truncateMessage(userMessage,140,'...');
    //Get Event ID
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw';
    //define Path
    var pathUser: string = '/users/'+chatRoom; 
    this.userRef = this.db.list(pathUser, ref => ref.orderByChild('email').equalTo(userEmail)).valueChanges().take(1);
    this.userRef.forEach(userInfo => {
      if(userInfo[0]['status']=='Banned'){
        (<HTMLInputElement>document.getElementById("message-content")).value = 'User Banned, Contact the Admin';
      }else{
        if (userInfo[0]) {
          var uId = userInfo[0]['userId'];
          this.sendMessage(uId);
        }else{
          var userId = this.createUser();
          this.sendMessage(userId);
        }
      }
    });
  }

  truncateMessage(value: string,numberCharacters: number, trail: String): string {
    let result = value || '';
    if (value) {
      // const words = value.split(/\s+/); Use to limitate to word instead of characters
      if (result.length > Math.abs(numberCharacters)) {
        if (numberCharacters < 0) {
          numberCharacters *= -1;
          result = trail + result.slice(result.length - numberCharacters, result.length);
        } else {
          result = result.slice(0, numberCharacters) + trail;
        }
      }
    }
    return result;
  }

  sendMessage(newUserId): string{
    //Def param
    var userMessage: string = (<HTMLInputElement>document.getElementById("message-content")).value;
    var userName: string = (<HTMLInputElement>document.getElementById("user-name")).textContent; 
    // console.log(userName)
    var userEmail: string = (<HTMLInputElement>document.getElementById("user-email")).value;
    //Get Event ID
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw';
    //define Path
    var pathUser: string = 'users/'+chatRoom; 
    //Define path
    var pathMess: string = 'room-messages/'+chatRoom;
    //Create Ref
    const chatReference = this.db.list(pathMess); 
    var newMessage  = {
          name:       userName,
          type:       'default',
          userID:     newUserId,
          message:    userMessage,
          timestamp:  firebase.database.ServerValue.TIMESTAMP,
        };
    chatReference.push(newMessage).setWithPriority(newMessage, 'timestamp');
    (<HTMLInputElement>document.getElementById("message-content")).value = '';
    return 'Mensaje enviado Correctamente'; 
    }

}
