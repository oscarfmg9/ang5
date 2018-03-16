import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operator/switchMap';
import { promise } from 'selenium-webdriver';

@Component({
  selector: 'app-landing-quiz',
  templateUrl: './landing-quiz.component.html',
  styleUrls: ['./landing-quiz.component.scss']
})
export class LandingQuizComponent implements OnInit {

  constructor(private db: AngularFireDatabase) { }

  userQuestionObeservable: Observable<any[]>;
  streamerQuestionObeservable: Observable<any[]>;
  questions: Observable<any[]>;
  userRef: Observable<any[]>;
  questionRef: Observable<any[]>;


  ngOnInit() {
    var userEmail: string = (<HTMLInputElement>document.getElementById('user-email')).value;//user Email
    this.userQuestionObeservable = this.getQViewer(userEmail);//Observable for the viewer
    this.streamerQuestionObeservable = this.getQStreamer();//Observable for the streamer
  }

  getQViewer(userEmail): Observable<any[]>{
    var chatRoom = '-L2XJLF_z2Tb737tSrVw'; //Entry Id
    var pathToQuestions = '/room-questions/'+chatRoom;
    return this.getUserId(userEmail).switchMap((userId) => this.db.list(pathToQuestions, ref => ref.orderByChild('userID').equalTo(userId[0]['userId'])).valueChanges());
  } 

  getQStreamer(): Observable<any[]>{
    var chatRoom = '-L2XJLF_z2Tb737tSrVw';
    var pathToQuestions = '/room-questions/'+chatRoom;
    return this.db.list(pathToQuestions, ref => ref.orderByChild('timestamp')).valueChanges(); 
  } 

  getUserId(userEmail) {
    var chatRoom = '-L2XJLF_z2Tb737tSrVw'; //Entry Id
    var pathToUsers = '/users/'+chatRoom;
      return this.db.list(pathToUsers, ref => ref.orderByChild('email').equalTo(userEmail)).valueChanges().take(1);
  }

  sendQuestion(){
    //Def param
    var userText: string = (<HTMLInputElement>document.getElementById("text-content-question")).value;
    var userName: string = (<HTMLInputElement>document.getElementById("user-name")).textContent; 
    var userEmail: string = (<HTMLInputElement>document.getElementById("user-email")).value;
    //Message only 140 char
    var userText = this.truncateString(userText,140,'...');
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw'; //Get Entry Id
    var pathToUsers: string = 'users/'+chatRoom; //define Path
    var pathToQuestions: string = 'room-questions/'+chatRoom; //define Path
    this.userRef = this.db.list(pathToUsers, ref => ref.orderByChild('email').equalTo(userEmail)).valueChanges().take(1);
    this.userRef.forEach(userInfo => {
        if(userInfo[0]['status']=='Banned'){
          (<HTMLInputElement>document.getElementById("text-content-question")).value = 'User Banned, Contact the Admin';
        }else{
          const idQuestion = this.db.list(pathToQuestions).push({timestamp:firebase.database.ServerValue.TIMESTAMP});
          var newQuestionId = idQuestion.key;
          var newQuestion = {
            name:userName,
            question:userText,
            status:'Seen',
            userID:userInfo[0]['userId'],
            questionId: newQuestionId
          };
          this.db.list(pathToUsers).update(idQuestion,newQuestion);
          (<HTMLInputElement>document.getElementById("text-content-question")).value = '';
        }
      });
  }

  sendStatus(event){
    //Def param
    var target = event.target || event.srcElement || event.currentTarget;
    var idAtt = target.attributes.id;
    var queId = idAtt.nodeValue;//question Id
    var stVal = target.attributes.value;
    var stats = stVal.nodeValue;//question Status
    var chatRoom: string = '-L2XJLF_z2Tb737tSrVw';//Get Event ID
    var pathToQuestions: string = 'room-questions/'+chatRoom;
    var pathToUsers: string = 'users/'+chatRoom;
    this.questionRef = this.db.list(pathToQuestions, ref => ref.orderByChild('questionId').equalTo(queId)).valueChanges().take(1);
    this.questionRef.forEach(questionInfo => {
      var qId = questionInfo[0]['questionId'];
      var uId = questionInfo[0]['userID'];
      switch (stats) {
        case 'ans':
          this.db.list(pathToQuestions).update(qId,{status:'Answered'});
          break;
        case 'del':
          this.db.list(pathToQuestions).remove(qId);
          break;
        case 'ban':
          this.db.list(pathToQuestions).update(qId,{status:'Banned'});
          this.db.list(pathToUsers).update(uId,{status:'Banned'});
        break;
        case 'uba':
          this.db.list(pathToQuestions).update(qId,{status:'Seen'});
          this.db.list(pathToUsers).update(uId,{status:'Default'});
        break;
        default:
          break;
      }
    });
  }

  truncateString(value: string,numberCharacters: number, trail: String): string {
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

}
   
