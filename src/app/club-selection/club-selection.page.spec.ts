import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { ConfigMockService } from '../../testing';
import { ConfigService } from '../micro-apps/csaa-mobile';

import { ClubSelectionPage } from './club-selection.page';

describe('ClubSelectionPage', () => {
  let component: ClubSelectionPage;
  let fixture: ComponentFixture<ClubSelectionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClubSelectionPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ConfigService, useClass: ConfigMockService },
        {
          provide: NavController,
          useValue: {
            navigateForward: jest.fn().mockReturnValue(Promise.resolve(null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
