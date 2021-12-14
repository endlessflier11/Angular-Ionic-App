import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import {
  ErrorWithReporter,
  noop,
  unsubscribeIfPresent,
  withErrorReporter,
} from '../../_core/helpers';
import {
  AutoPayEnrollmentResponse,
  CanComponentDeactivate,
  Category,
  EventName,
  EventType,
  IonViewWillEnter,
  PaymentAccount,
  PaymentAccountLabel,
  PaymentAccountType,
  Policy,
  UpcomingPayment,
  WalletDetails,
} from '../../_core/interfaces';
import {
  AnalyticsService,
  ConfigService,
  PaymentService,
  PolicyService,
  RouterService,
} from '../../_core/services';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { PaymentHelper } from '../../_core/shared/payment.helper';
import { interactWithLoader } from '../../_core/operators';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { AutopayTermsConditionsComponent } from '../_shared/ui-kits/autopay-terms-conditions/autopay-terms-conditions.component';
import { Store } from '@ngxs/store';
import { PaymentState } from '../../_core/store/states/payment.state';
import { PolicyState } from '../../_core/store/states/policy.state';

enum ERROR_MESSAGES {
  ENROLLMENT = 'We are unable to complete your AutoPay enrollment at this time. Please try again later.',
  UNENROLLMENT = 'We are unable to complete your AutoPay unenrollment at this time. Please try again later.',
  ACCOUNT_RESTRICTED = 'This account cannot be used for AutoPay. Please select a different payment method.',
}

@Component({
  selector: 'app-csaa-autopay-settings',
  templateUrl: './autopay-settings.page.html',
  styleUrls: ['./autopay-settings.page.scss'],
})
export class AutopaySettingsPage
  implements OnInit, OnDestroy, IonViewWillEnter, CanComponentDeactivate
{
  private readonly tearDown$: Subject<any> = new Subject();
  public readonly currentTheme: string;
  private policyNumber: string;
  public policySubtitlesExpanded = false;
  public policy: Policy;
  public autoPayData: AutoPayEnrollmentResponse;
  public walletData: WalletDetails;
  public upcomingPayment: UpcomingPayment;
  public selectedPaymentAccount: PaymentAccount;
  public initialToggleValue = false;
  public toggleControlValue = false;
  private canceling = false;
  private backButtonSubscription: Subscription;

  public get isCaPolicy(): boolean {
    if (!this.policy) {
      return undefined;
    }
    return this.policy.riskState === 'CA';
  }

  public get enrollmentRecord() {
    if (!this.autoPayData) {
      return;
    }
    return this.autoPayData.enrollmentRecord;
  }

  public get autopayPaymentLabel(): PaymentAccountLabel {
    if (this.selectedPaymentAccount) {
      return PaymentHelper.getPaymentAccountLabel(this.selectedPaymentAccount);
    }

    if (this.enrollmentRecord) {
      return this.enrolledPaymentAccountLabel;
    }
  }

  public get autopayPaymentLabelText(): string {
    const { autopayPaymentLabel } = this;
    return autopayPaymentLabel
      ? [autopayPaymentLabel.secondaryText, autopayPaymentLabel.primaryText]
          .map((i) => i || '')
          .join('  ****')
      : 'Select Account';
  }

  public get enrolledPaymentAccountLabel(): PaymentAccountLabel {
    if (!this.enrollmentRecord) {
      return undefined;
    }
    const { paymentMethod, card, account } = this.enrollmentRecord.paymentItem;
    let label: PaymentAccountLabel = {} as PaymentAccountLabel;

    if (paymentMethod === PaymentAccountType.CARD) {
      label = { ...label, secondaryText: 'Card', primaryText: (card.number || '').substr(-4) };
    }

    if (paymentMethod === PaymentAccountType.EFT) {
      label = {
        ...label,
        secondaryText: 'Account',
        primaryText: (account.accountNumber || '').substr(-4),
      };
    }

    label.text = [label.primaryText, label.secondaryText].join(' ');
    return label;
  }

  public get saveBtnDisabled(): boolean {
    // When switch is turned off but user was previously enrolled
    if (!this.toggleControlValue && !!this.enrollmentRecord) {
      return false;
    }

    // When switch is turned on but
    // - the user hasn't saved their enrollment
    // - (OR) the previously enrolled account differs from newly selected one
    if (
      this.toggleControlValue &&
      this.selectedPaymentAccount &&
      this.selectedPaymentAccount.paymentAccountToken !==
        this.enrollmentRecord?.paymentItem?.paymentAccountToken
    ) {
      // Having established from above that the selected account doesn't match enrollment record (it's unsaved),
      // we need to also check if this account is card type and ensure it's not expired before
      // stating that the save button is not disabled
      if (!this.selectedPaymentAccount.card || !this.selectedPaymentAccount.card.expired) {
        return false;
      }
    }

    // None of the conditions above passed if we got here, so we'll disable the save btn
    return true;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly routerService: RouterService,
    private readonly paymentService: PaymentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertController: AlertController,
    private readonly makePaymentService: MakePaymentService,
    private readonly analyticsService: AnalyticsService,
    private readonly modalCtrl: ModalController,
    private readonly platform: Platform,
    private readonly store: Store
  ) {
    this.currentTheme = this.configService.getTheme();
  }

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        filter((paramMap) => {
          const policyNumber = paramMap.get('policyNumber');
          // When navigating to this page while an instance exists in the router stack,
          // we'd check if we're trying to view autopay for same policy or not.
          // The result will determine if we should re-initialize the page
          if (this.policyNumber && this.policyNumber === policyNumber) {
            return false;
          }
          this.policyNumber = policyNumber;
          return true;
        }),
        takeUntil(this.tearDown$)
      )
      .subscribe(() => {
        this.initialize();
      });
  }

  ionViewWillEnter() {
    this.canceling = false;
    this.selectedPaymentAccount = this.makePaymentService.pullSelectedPaymentAccount();
    if (this.selectedPaymentAccount) {
      this.initialToggleValue = true;
      this.toggleControlValue = true;
      this.assertPaymentAccountValidity(this.selectedPaymentAccount);
    }
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.onClickBackBtn()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  ngOnDestroy() {
    this.tearDown$.next(true);
    this.tearDown$.complete();
  }

  private initialize(): void {
    combineLatest([
      this.store.select(PolicyState.policyData(this.policyNumber)),
      this.store.select(PaymentState.walletDetails),
      this.store.select(PaymentState.upcomingPaymentForPolicy(this.policyNumber)),
    ])
      .pipe(
        takeUntil(this.tearDown$),
        tap(([policy, wallet, payment]) => {
          this.policy = policy;
          this.walletData = wallet;
          this.upcomingPayment = payment;
          this.autoPayData = payment?.autopayEnrollment;
          this.toggleControlValue = !!this.autoPayData;
          this.initialToggleValue = this.toggleControlValue;
          this.makePaymentService.setActivePayment(payment);
        })
      )
      .subscribe(
        withErrorReporter(([policy]) => {
          const autoPayEnabled = !!this.autoPayData;
          const autoPayEnabledProps = !autoPayEnabled
            ? {}
            : {
                method_type: PaymentHelper.getAutoPayEnrollmentPaymentMethod(this.autoPayData),
              };
          this.analyticsService.trackEvent(EventName.MANAGE_AUTOPAY_VIEWED, Category.payments, {
            event_type: EventType.OPTION_SELECTED,
            ...AnalyticsService.mapPolicy(policy),
            autopay_status: autoPayEnabled ? 'on' : 'off',
            ...autoPayEnabledProps,
          });
        })
      );
  }

  private assertPaymentAccountValidity(account: PaymentAccount): void {
    if (account?.card?.expired) {
      this.alertController
        .create({
          header: 'Card Expired',
          subHeader:
            'The payment method selected is expired and cannot be used for AutoPay enrollment. Please update the payment method.',
          buttons: ['Dismiss'],
        })
        .then((a) => a.present());
    }
  }

  onClickBackBtn() {
    this.canceling = true;
    this.routerService.navigateBack('csaa.payment.index').then(noop);
  }

  save() {
    return this.toggleControlValue ? this.activateAutoPay() : this.deactivateAutoPay();
  }

  activateAutoPay() {
    const continueWithAction = () =>
      this.paymentService
        .enrollPolicyForAutopay(this.policy, this.selectedPaymentAccount)
        .pipe(takeUntil(this.tearDown$), interactWithLoader())
        .subscribe(
          withErrorReporter(
            (completed) => {
              if (completed) {
                this.trackAutopaySetEvent(true);
                this.routerService.navigateBack('csaa.payment.index').then(noop);
              } else {
                this.notifyError(ERROR_MESSAGES.ENROLLMENT);
                throw new Error('AutoPay enrollment failed');
              }
            },
            (err: ErrorWithReporter) => {
              if (PaymentService.isAccountRestricted(err)) {
                this.notifyError(ERROR_MESSAGES.ACCOUNT_RESTRICTED);
              } else {
                this.notifyError(ERROR_MESSAGES.ENROLLMENT);
              }
              err.report();
            }
          )
        );

    // Continue if it's [not card] or it's [card and it's debit card] or [policy is not eValue Enrolled]
    if (
      !this.selectedPaymentAccount.card ||
      this.selectedPaymentAccount.card.isDebitCard ||
      !PolicyService.isEValueEnrolledForPolicy(this.policy)
    ) {
      return continueWithAction();
    }

    // When it's credit card
    this.alertController
      .create({
        header: 'eValue Discount Alert',
        subHeader:
          'You are currently receiving the eValue discount and must pay with a Checking/Savings or Debit Card account.' +
          '  If you switch to a credit card, the eValue discount will be removed.  Do you wish to proceed?',
        buttons: [
          {
            text: 'Go Back',
            role: 'cancel',
          },
          {
            text: 'Continue',
          },
        ],
      })
      .then(async (alert) => {
        await alert.present();
        this.trackWarningMessageLifecycle(`${alert.header} - ${alert.subHeader}`);

        const data = await alert.onDidDismiss();
        const proceed = data.role !== 'cancel';

        this.trackWarningMessageLifecycle(`${alert.header} - ${alert.subHeader}`, proceed);
        if (proceed) {
          return continueWithAction();
        }
        this.selectedPaymentAccount = null;
        return Promise.resolve();
      });
  }

  deactivateAutoPay() {
    const continueWithAction = () =>
      this.paymentService
        .unEnrollPolicyForAutopay(this.policy)
        .pipe(takeUntil(this.tearDown$), interactWithLoader())
        .subscribe(
          withErrorReporter(
            (completed) => {
              if (completed) {
                this.trackAutopaySetEvent(false);
                this.autoPayData = null;
                this.routerService.navigateBack('csaa.payment.index').then(noop);
              } else {
                this.notifyError(ERROR_MESSAGES.UNENROLLMENT);
                throw new Error('AutoPay dis-enrollment failed');
              }
            },
            (err) => {
              this.notifyError(ERROR_MESSAGES.UNENROLLMENT);
              err.report();
            }
          )
        );

    if (!PolicyService.isEValueEnrolledForPolicy(this.policy)) {
      return continueWithAction();
    }

    this.alertController
      .create({
        header: 'eValue Discount Alert',
        subHeader:
          'Cancellation of AutoPay withdrawals will result in the removal of your eValue discount.  Do you wish to continue?',
        buttons: [
          {
            text: 'Go Back',
            role: 'cancel',
          },
          {
            text: 'Continue',
          },
        ],
      })
      .then(async (alert) => {
        await alert.present();
        this.trackWarningMessageLifecycle(`${alert.header} - ${alert.subHeader}`);

        const data = await alert.onDidDismiss();
        const proceed = data.role !== 'cancel';

        this.trackWarningMessageLifecycle(`${alert.header} - ${alert.subHeader}`, proceed);
        if (proceed) {
          return continueWithAction();
        }
        this.toggleControlValue = true;
        return Promise.resolve();
      });
  }

  private trackAutopaySetEvent(isOn): void {
    this.analyticsService.trackEvent(EventName.AUTOPAY_SET, Category.payments, {
      event_type: EventType.OPTION_SELECTED,
      selection: isOn ? 'on' : 'off',
      ...AnalyticsService.mapPolicy(this.policy),
    });
  }

  private trackWarningMessageLifecycle(message: string, proceed?: boolean): void {
    return proceed === undefined
      ? this.analyticsService.trackEvent(EventName.WARNING_DISPLAYED, Category.payments, {
          event_type: EventType.MESSAGED,
          message,
          ...AnalyticsService.mapPolicy(this.policy),
        })
      : this.analyticsService.trackEvent(EventName.WARNING_RESPONSE_RECEIVED, Category.payments, {
          event_type: EventType.OPTION_SELECTED,
          message,
          selection: proceed ? 'Continue' : 'Go Back',
          ...AnalyticsService.mapPolicy(this.policy),
        });
  }

  selectPaymentMethod(): void {
    this.makePaymentService.selectPaymentAccount(this.selectedPaymentAccount);
    this.routerService
      .navigateForward('csaa.payment.autopay.method', { policyNumber: this.policyNumber })
      .then(noop);
  }

  async openTerms() {
    const modal = await this.modalCtrl.create({
      component: AutopayTermsConditionsComponent,
    });
    await modal.present();
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_CLICKED, Category.payments, {
      event_type: EventType.FILE_DOWNLOADED,
    });
  }

  private async notifyError(message) {
    const alert = await this.alertController.create({
      header: 'Oops! Something went wrong.',
      message,
      buttons: ['Ok'],
    });
    await alert.present();
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.canceling) {
      return true;
    }

    if (this.initialToggleValue === this.toggleControlValue && this.saveBtnDisabled) {
      return true;
    }

    const $canDeactivate = new Subject<boolean>();
    this.alertController
      .create({
        message:
          'You have unsaved changes to your AutoPay settings.  Select <strong>“Cancel”</strong> to return to the' +
          ' settings screen to Save and submit your changes or select <strong>“Ok”</strong> to exit the settings without submitting.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.canceling = false;
              $canDeactivate.next(false);
              $canDeactivate.complete();
            },
          },
          {
            text: 'Ok',
            handler: () => {
              $canDeactivate.next(true);
              $canDeactivate.complete();
            },
          },
        ],
      })
      .then((a) => a.present());

    return $canDeactivate;
  }
}
