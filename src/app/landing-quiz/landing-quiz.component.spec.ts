import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingQuizComponent } from './landing-quiz.component';

describe('LandingQuizComponent', () => {
  let component: LandingQuizComponent;
  let fixture: ComponentFixture<LandingQuizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingQuizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
