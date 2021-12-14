import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppleWalletButtonComponent } from './apple-wallet-button.component';
import { PlatformService } from '../../services/platform.service';
import { PlatformMockService } from '@app/testing';

describe('AppleWalletButtonComponent', () => {
  let component: AppleWalletButtonComponent;
  let fixture: ComponentFixture<AppleWalletButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppleWalletButtonComponent],
      providers: [{ provide: PlatformService, useClass: PlatformMockService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppleWalletButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
