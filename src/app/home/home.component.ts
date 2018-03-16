import { Component, OnInit } from '@angular/core';
import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [

    trigger('goals',[
      transition('* => *', [
        query(':enter', style({opacity:0}), {optional: true}),

        query(':enter', stagger('300ms', [
          animate('.6s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(35px)', offset: .3}),
            style({opacity: 1, transform: 'translateY(0)', offset: 1}),
          ]))]), {optional: true})
      ])
    ])
  ]
  
})

export class HomeComponent implements OnInit {

	itemCount: number;
	btnText: string = 'Add an item';
  goalText: string = 'My First life Goal';  
  goals = ['Stagger','Multi','KeyFrames'];

  constructor() { }

  ngOnInit() {
    this.itemCount = this.goals.length;
  }

  addItem() {
    this.goals.push(this.goalText);
    this.goalText = 'New Goal?';
    this.itemCount = this.goals.length;
  }

  removeItem(i) {
    this.goals.splice(i,1);
    this.itemCount = this.goals.length; 
  }

}
