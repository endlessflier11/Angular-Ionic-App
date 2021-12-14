import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CLAIMS_NUMBER } from '../../constants';
import { unsubscribeIfPresent } from '../../_core/helpers/async.helper';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { ConfigService } from '../../_core/services/config/config.service';
import { RouterService } from '../../_core/services/router/router.service';

@Component({
  selector: 'csaa-claims-pre-loss',
  templateUrl: './claims-pre-loss.page.html',
  styleUrls: ['./claims-pre-loss.page.scss'],
})
export class ClaimsPreLossPage implements OnInit {
  currentTheme: string;
  backButtonSubscription: Subscription;

  constructor(
    private readonly callService: CallService,
    private readonly configService: ConfigService,
    private readonly routerService: RouterService,
    private readonly analyticsService: AnalyticsService,
    private readonly platform: Platform
  ) {}

  ngOnInit() {
    this.currentTheme = this.configService.getTheme();
  }

  backButtonClick() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.back();
  }

  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.backButtonClick()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  callClaims() {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Contact Claims',
      method: 'phone',
    });
    this.callService.call(CLAIMS_NUMBER);
  }

  routeToAuto() {
    this.routerService.navigateForward('csaa.claims.what-do-do', {
      policyType: PolicyType.Auto.toString(),
    });
  }
  routeToHome() {
    this.routerService.navigateForward('csaa.claims.what-do-do', {
      policyType: PolicyType.Home.toString(),
    });
  }
}
