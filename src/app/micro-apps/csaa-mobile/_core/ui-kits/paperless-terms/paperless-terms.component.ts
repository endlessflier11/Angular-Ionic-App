import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Select } from '@ngxs/store';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { AnalyticsService } from '../../../_core/services';
import { Category, EventName, EventType, Policy } from '../../../_core/interfaces';
import { CustomerState } from '../../../_core/store/states/customer.state';
import { SubSink } from '../../../_core/shared/subscription.helper';
import { PaperlessTermsModalComponent } from '../paperless-terms-modal/paperless-terms-modal.component';

@Component({
  selector: 'csaa-paperless-terms',
  templateUrl: './paperless-terms.component.html',
  styleUrls: ['./paperless-terms.component.scss'],
})
export class PaperlessTermsComponent implements OnInit, OnDestroy {
  @Select(CustomerState.hasPendingEnrollment) hasPendingEnrollment$: Observable<boolean>;
  @Input() buttonOnly = false;
  @Input() policy: Policy;
  @Output() webviewDismissed = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<boolean>();
  public enrollmentRequestSuccessful: boolean;

  private subSink = new SubSink();

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.subSink.add(
      this.hasPendingEnrollment$.pipe(distinctUntilChanged()).subscribe((isPending) => {
        if (isPending) {
          this.enrollmentRequestSuccessful = undefined;
          if (!this.buttonOnly) {
            this.analyticsService.trackEvent(EventName.WARNING_DISPLAYED, Category.documents, {
              event_type: EventType.MESSAGED,
              message:
                'To complete your enrollment in paperless, please review and accept the terms and conditions.',
            });
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  async reviewTerms() {
    const policyData = !!this.policy ? AnalyticsService.mapPolicy(this.policy) : {};
    this.analyticsService.trackEvent(
      EventName.REVIEW_TERMS_AND_CONDITIONS_SELECTED,
      Category.global,
      {
        event_type: EventType.LINK_ACCESSED,
        link_placement: !!this.policy ? 'Paperless' : 'Home',
        ...policyData,
      }
    );

    const modal = await this.modalCtrl.create({
      component: PaperlessTermsModalComponent,
      componentProps: {
        policy: this.policy,
      },
    });
    await modal.present();
    const { data: dismissedWithSuccess } = await modal.onDidDismiss();
    this.enrollmentRequestSuccessful = dismissedWithSuccess;
    this.accepted.emit(this.enrollmentRequestSuccessful);
  }

  public dismissSuccessAlert(): void {
    this.enrollmentRequestSuccessful = undefined;
  }
}
