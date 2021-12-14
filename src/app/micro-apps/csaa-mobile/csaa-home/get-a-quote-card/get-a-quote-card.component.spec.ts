import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { GET_A_BUNDLE_QUOTE_URL, GET_A_QUOTE_URL } from '../../constants';
import { Category, CsaaTheme, EventName, Policy, PolicyType } from '../../_core/interfaces';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';

import { GetAQuoteCardComponent } from './get-a-quote-card.component';
import {
  By,
  CONFIG_STATE_FIXTURE_MOCK,
  CUSTOMER_STATE_FIXTURE_MOCK,
  deepCopy,
  PageTestingModule,
  StoreTestBuilder,
} from '@app/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CsaaCoreModule } from '../../csaa-core/csaa-core.module';
import { Store } from '@ngxs/store';
import _ from 'lodash';

describe('GetAQuoteCardComponent', () => {
  let component: GetAQuoteCardComponent;
  let fixture: ComponentFixture<GetAQuoteCardComponent>;
  let analyticService: AnalyticsService;
  let store: Store;

  const setupComponent = async (beforeCreate: (data: { store: Store }) => void) => {
    await TestBed.configureTestingModule({
      declarations: [GetAQuoteCardComponent],
      imports: [
        PageTestingModule.withConfig({ providesStorage: true, providesAnalytics: true }),
        IonicModule.forRoot(),
        UiKitsModule,
        CsaaCoreModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    analyticService = TestBed.inject(AnalyticsService);

    beforeCreate.call(beforeCreate, { store });

    fixture = TestBed.createComponent(GetAQuoteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', async () => {
    await setupComponent(() => {
      StoreTestBuilder.withDefaultMocks().resetStateOf(store);
    });

    expect(component).toBeTruthy();
  });

  describe('when discount is not available', () => {
    beforeEach(async () => {
      await setupComponent(() => {
        const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
        Array.from(storeCustomerState.csaa_policies.policies || []).forEach((_p, idx) => {
          _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'MT');
        });
        StoreTestBuilder.withDefaultMocks()
          .withCustomerState(storeCustomerState)
          .resetStateOf(store);
      });
    });

    it('should track the get a quote page', () => {
      component.openUrl = jest.fn().mockReturnValue(new Promise(() => {}));
      component.openQuoterInBrowser();

      expect(component.openUrl).toHaveBeenCalledWith(GET_A_QUOTE_URL);
      expect(analyticService.trackEvent).toHaveBeenCalledWith(
        EventName.GET_A_QUOTE_SELECTED,
        Category.global,
        {
          event_type: 'Link Accessed',
        }
      );
    });
  });

  describe.skip('when discount is available', () => {
    beforeEach(async () => {
      await setupComponent(() => {
        const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
        const monolineAutoPolicies = Array.from<Policy>(
          storeCustomerState.csaa_policies.policies || []
        ).filter((p) => p.type === PolicyType.Auto);
        _.set(storeCustomerState, `csaa_policies.policies`, monolineAutoPolicies);
        monolineAutoPolicies.forEach((_p, idx) => {
          _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'CA');
        });
        StoreTestBuilder.withDefaultMocks()
          .withCustomerState(storeCustomerState)
          .resetStateOf(store);
      });
    });

    it('should track the get a quote page correctly for non-mwg users with monoline auto policies', () => {
      const customerAddressState = 'NV';
      const storeConfigState = deepCopy(CONFIG_STATE_FIXTURE_MOCK);
      _.set(storeConfigState, `activeConfigData.theme`, CsaaTheme.ACA);
      _.set(storeConfigState, `preferredTheme`, CsaaTheme.ACA);

      const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
      _.set(storeCustomerState, `data.customerAddress.state`, customerAddressState);
      const monolineAutoPolicies = Array.from<Policy>(
        storeCustomerState.csaa_policies.policies || []
      ).filter((p) => p.type === PolicyType.Auto);
      _.set(storeCustomerState, `csaa_policies.policies`, monolineAutoPolicies);
      monolineAutoPolicies.forEach((_p, idx) => {
        _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'AZ');
      });

      StoreTestBuilder.withDefaultMocks()
        .withConfigState(storeConfigState)
        .withCustomerState(storeCustomerState)
        .resetStateOf(store);

      component.openUrl = jest.fn().mockReturnValue(new Promise(() => {}));
      component.openQuoterInBrowser();

      expect(component.openUrl).toHaveBeenCalledWith(
        GET_A_BUNDLE_QUOTE_URL.replace('{state}', customerAddressState)
      );
      expect(analyticService.trackEvent).toHaveBeenCalledWith(
        EventName.GET_A_QUOTE_SELECTED,
        Category.global,
        {
          event_type: 'Link Accessed',
        }
      );
    });

    it('should track the get a quote page correctly for mwg users with monoline auto policies', () => {
      const customerAddressState = 'NV';
      const mwgOverrideCustomerAddressState = 'CA';
      const storeConfigState = deepCopy(CONFIG_STATE_FIXTURE_MOCK);
      _.set(storeConfigState, `activeConfigData.theme`, CsaaTheme.MWG);
      _.set(storeConfigState, `preferredTheme`, CsaaTheme.MWG);

      const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
      _.set(storeCustomerState, `data.customerAddress.state`, customerAddressState);

      const monolineAutoPolicies = Array.from<Policy>(
        storeCustomerState.csaa_policies.policies || []
      ).filter((p) => p.type === PolicyType.Auto);
      _.set(storeCustomerState, `csaa_policies.policies`, monolineAutoPolicies);
      monolineAutoPolicies.forEach((_p, idx) => {
        _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'AZ');
      });

      StoreTestBuilder.withDefaultMocks()
        .withConfigState(storeConfigState)
        .withCustomerState(storeCustomerState)
        .resetStateOf(store);

      component.openUrl = jest.fn().mockReturnValue(new Promise(() => {}));
      component.openQuoterInBrowser();

      expect(component.openUrl).toHaveBeenCalledWith(
        GET_A_BUNDLE_QUOTE_URL.replace('{state}', mwgOverrideCustomerAddressState)
      );
      expect(analyticService.trackEvent).toHaveBeenCalledWith(
        EventName.GET_A_QUOTE_SELECTED,
        Category.global,
        {
          event_type: 'Link Accessed',
        }
      );
    });
  });

  it.skip('should show discount CTA for 1 auto and 1 pup policy combination', async () => {
    await setupComponent(() => {
      const storeConfigState = deepCopy(CONFIG_STATE_FIXTURE_MOCK);
      _.set(storeConfigState, `activeConfigData.theme`, CsaaTheme.MWG);
      _.set(storeConfigState, `preferredTheme`, CsaaTheme.MWG);

      const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
      const testPolicies = [
        Array.from<Policy>(storeCustomerState.csaa_policies.policies || []).find(
          (p) => p.type === PolicyType.Auto
        ),
        Array.from<Policy>(storeCustomerState.csaa_policies.policies || []).find(
          (p) => p.type === PolicyType.PUP
        ),
      ];

      expect(testPolicies.length).toEqual(2);

      _.set(storeCustomerState, `csaa_policies.policies`, testPolicies);
      testPolicies.forEach((_p, idx) => {
        _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'CA');
      });

      StoreTestBuilder.withDefaultMocks()
        .withConfigState(storeConfigState)
        .withCustomerState(storeCustomerState)
        .resetStateOf(store);
    });

    component.openUrl = jest.fn().mockReturnValue(new Promise(() => {}));
    component.openQuoterInBrowser();

    expect(
      fixture.debugElement.query(
        By.cssAndText('ion-card', 'Save Big at AAA When You Bundle Home & Auto')
      )
    ).toBeTruthy();
    expect(component.openUrl).toHaveBeenCalledWith(GET_A_BUNDLE_QUOTE_URL.replace('{state}', 'CA'));
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.GET_A_QUOTE_SELECTED,
      Category.global,
      {
        event_type: 'Link Accessed',
      }
    );
  });

  it.skip('should show discount CTA for 1 property and 1 pup policy combination', async () => {
    await setupComponent(() => {
      const storeConfigState = deepCopy(CONFIG_STATE_FIXTURE_MOCK);
      _.set(storeConfigState, `activeConfigData.theme`, CsaaTheme.MWG);
      _.set(storeConfigState, `preferredTheme`, CsaaTheme.MWG);

      const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
      const testPolicies = [
        Array.from<Policy>(storeCustomerState.csaa_policies.policies || []).find(
          (p) => p.type === PolicyType.Home
        ),
        Array.from<Policy>(storeCustomerState.csaa_policies.policies || []).find(
          (p) => p.type === PolicyType.PUP
        ),
      ];

      expect(testPolicies.length).toEqual(2);

      _.set(storeCustomerState, `csaa_policies.policies`, testPolicies);
      testPolicies.forEach((_p, idx) => {
        _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'CA');
      });

      StoreTestBuilder.withDefaultMocks()
        .withConfigState(storeConfigState)
        .withCustomerState(storeCustomerState)
        .resetStateOf(store);
    });

    component.openUrl = jest.fn().mockReturnValue(new Promise(() => {}));
    component.openQuoterInBrowser();

    expect(
      fixture.debugElement.query(
        By.cssAndText('ion-card', 'Save Big at AAA When You Bundle Home & Auto')
      )
    ).toBeTruthy();
    expect(component.openUrl).toHaveBeenCalledWith(GET_A_BUNDLE_QUOTE_URL.replace('{state}', 'CA'));
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.GET_A_QUOTE_SELECTED,
      Category.global,
      {
        event_type: 'Link Accessed',
      }
    );
  });

  it.skip('should no show discount CTA for 1 property and 1 auto policy combination', async () => {
    await setupComponent(() => {
      const storeConfigState = deepCopy(CONFIG_STATE_FIXTURE_MOCK);
      _.set(storeConfigState, `activeConfigData.theme`, CsaaTheme.MWG);
      _.set(storeConfigState, `preferredTheme`, CsaaTheme.MWG);

      const storeCustomerState = deepCopy(CUSTOMER_STATE_FIXTURE_MOCK);
      const testPolicies = [
        Array.from<Policy>(storeCustomerState.csaa_policies.policies || []).find(
          (p) => p.type === PolicyType.Home
        ),
        Array.from<Policy>(storeCustomerState.csaa_policies.policies || []).find(
          (p) => p.type === PolicyType.Auto
        ),
      ];

      expect(testPolicies.length).toEqual(2);

      _.set(storeCustomerState, `csaa_policies.policies`, testPolicies);
      testPolicies.forEach((_p, idx) => {
        _.set(storeCustomerState, `csaa_policies.policies.${idx}.riskState`, 'CA');
      });

      StoreTestBuilder.withDefaultMocks()
        .withConfigState(storeConfigState)
        .withCustomerState(storeCustomerState)
        .resetStateOf(store);
    });

    component.openUrl = jest.fn().mockReturnValue(new Promise(() => {}));
    component.openQuoterInBrowser();

    expect(
      fixture.debugElement.query(
        By.cssAndText('ion-card', 'Save Big at AAA When You Bundle Home & Auto')
      )
    ).toBeFalsy();
    expect(component.openUrl).toHaveBeenCalledWith(GET_A_QUOTE_URL);
    expect(analyticService.trackEvent).toHaveBeenCalledWith(
      EventName.GET_A_QUOTE_SELECTED,
      Category.global,
      {
        event_type: 'Link Accessed',
      }
    );
  });
});
