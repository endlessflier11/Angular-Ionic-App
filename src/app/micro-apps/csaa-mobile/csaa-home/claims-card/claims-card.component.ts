import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CLAIMS_NUMBER } from '../../constants';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { Claim } from '../../_core/interfaces/claim.interface';
import { Policy, PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { RouterService } from '../../_core/services/router/router.service';

@Component({
  selector: 'csaa-claims-card',
  templateUrl: './claims-card.component.html',
  styleUrls: ['./claims-card.component.scss'],
})
export class ClaimsCardComponent implements OnChanges {
  @Input() claims: Claim[] = [];
  @Input() policies: Policy[] = [];
  @Input() loading = false;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;
  sortedClaims: Claim[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private alertCtrl: AlertController,
    private callService: CallService,
    private routerService: RouterService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.claims && changes.claims.currentValue && changes.claims.currentValue.length) {
      this.sortedClaims = this.sortClaimsByOpenedDate(this.claims.slice());
    }
  }

  private sortClaimsByOpenedDate(claims: Claim[]) {
    const getOpenedDateFromWorkflow = (claim) => {
      if (!claim?.workflow) {
        return 0;
      }
      const openedClaim = claim?.workflow?.find((event) => event.eventType === 'Opened');
      return openedClaim?.date ? new Date(openedClaim?.date) : 0;
    };

    return claims?.slice().sort((first, second) => {
      const firstOpenedDate: any = getOpenedDateFromWorkflow(first);
      const secondOpenedDate: any = getOpenedDateFromWorkflow(second);
      return secondOpenedDate - firstOpenedDate;
    });
  }

  trackAgentContact(selection: 'Contact Claims') {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      method: 'phone',
      selection,
    });
  }

  async openDetails(claim) {
    if (claim.type === PolicyType.PUP) {
      const alert = await this.alertCtrl.create({
        header: 'Call Claims Representative',
        message: claim.adjuster.phone,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              alert.dismiss(false);
              return false;
            },
          },
          {
            text: 'Call',
            handler: () => {
              this.trackAgentContact('Contact Claims');
              alert.dismiss(true);
              return false;
            },
          },
        ],
      });
      await alert.present();
      alert.onDidDismiss().then(({ role }) => {
        if (role === 'cancel') {
          return;
        }
        this.callService.call(claim.adjuster.phone || CLAIMS_NUMBER);
      });
    } else {
      const policies = this.policies.filter((p) => p.number === claim.policyNumber);
      this.analyticsService.trackEvent(EventName.CLAIM_SELECTED, Category.claims, {
        claim_number: claim.number,
        ...AnalyticsService.mapPolicy(...policies),
        event_type: EventType.OPTION_SELECTED,
        selection: 'Claims',
      });
      this.analyticsService.trackEvent(EventName.OPEN_CLAIMS_VIEWED, Category.claims, {
        claim_number: claim.number,
        ...AnalyticsService.mapPolicy(...policies),
        event_type: EventType.LINK_ACCESSED,
        link: 'Claims',
      });
      await this.routerService.navigateForward('csaa.claims.detail', {
        claimNumber: claim.number,
      });
    }
  }

  openWhatDoIDo() {
    this.analyticsService.trackEvent(EventName.WHAT_DO_I_DO_SELECTED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'What To Do',
    });
    this.whatDoIDo();
  }

  openIHadAnAccident() {
    this.analyticsService.trackEvent(EventName.I_HAD_AN_ACCIDENT_SELECTED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'I Had An Accident',
    });
    const hasAutoPolicies = !!this.policies.filter((p) => p.type === PolicyType.Auto).length;
    if (hasAutoPolicies) {
      this.routerService.navigateForward('csaa.claims.what-do-do', {
        policyType: PolicyType.Auto.toString(),
      });
    } else {
      this.whatDoIDo();
    }
  }

  private whatDoIDo() {
    const hasAutoPolicies = !!this.policies.filter((p) => p.type === PolicyType.Auto).length;
    const hasHomePolicies = !!this.policies.filter((p) => p.type === PolicyType.Home).length;
    if (hasAutoPolicies && !hasHomePolicies) {
      this.routerService.navigateForward('csaa.claims.what-do-do', {
        policyType: PolicyType.Auto.toString(),
      });
    } else if (hasHomePolicies && !hasAutoPolicies) {
      this.routerService.navigateForward('csaa.claims.what-do-do', {
        policyType: PolicyType.Home.toString(),
      });
    } else {
      this.routerService.navigateForward('csaa.claims.pre-loss');
    }
  }
}
