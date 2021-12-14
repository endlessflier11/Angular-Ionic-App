import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutopayDiscountCardComponent } from './autopay-discount-card.component';
import { CsaaStoreModule } from '../../../../_core/store/csaa-store.module';
import { PageTestingModule, StoreTestBuilder } from '@app/testing';
import { Store } from '@ngxs/store';
import { RouterTestingModule } from '@angular/router/testing';
import { CsaaCoreModule } from '../../../../csaa-core/csaa-core.module';

describe('AutopayDiscountCardComponent', () => {
  let component: AutopayDiscountCardComponent;
  let fixture: ComponentFixture<AutopayDiscountCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AutopayDiscountCardComponent],
      imports: [
        PageTestingModule.withConfig({ providesStorage: true }),
        RouterTestingModule,
        CsaaCoreModule.forRoot(),
        CsaaStoreModule,
      ],
    }).compileComponents();
    const store = TestBed.inject(Store);
    StoreTestBuilder.withInitialState().resetStateOf(store);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutopayDiscountCardComponent);
    component = fixture.componentInstance;
    component.policy = {} as any; // Todo: use actual policy and add more test cases
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
