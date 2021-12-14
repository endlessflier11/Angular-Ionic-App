import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WhatToDoCardComponent } from './what-to-do-card.component';

describe('WhatToDoCardComponent', () => {
  let component: WhatToDoCardComponent;
  let fixture: ComponentFixture<WhatToDoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WhatToDoCardComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatToDoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
