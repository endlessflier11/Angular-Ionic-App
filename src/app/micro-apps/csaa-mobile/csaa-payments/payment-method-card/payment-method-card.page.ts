import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardIO, CardIOOptions, CardIOResponse } from '@ionic-native/card-io/ngx';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { combineLatest, noop, Observable, of, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { PAYMENTS_SERVICE_NUMBER } from '../../constants';
import { withErrorReporter } from '../../_core/helpers';
import {
  Category,
  EventName,
  EventType,
  NewPaymentMethodCardData,
  PaymentAccount,
  RegisterCardPaymentAccountPayload,
  RegisterPaymentAccountOptions,
  UpcomingPayment,
  WalletDetails,
} from '../../_core/interfaces';
import { interactWithLoader } from '../../_core/operators';
import {
  AnalyticsService,
  ConfigService,
  PaymentService,
  RouterService,
} from '../../_core/services';
import { CallService } from '../../_core/services/call.service';
import {
  cardNumberValidator,
  expirationValidator,
  nicknameValidator,
  zipCodeValidator,
} from '../../_core/shared/payment.validators';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { PaymentTermsConditionsComponent } from '../_shared/ui-kits/payment-terms-conditions/payment-terms-conditions.component';
import { DeleteConfirmDirective } from '../_shared/directives/delete-confirm/delete-confirm.directive';
import { PaymentState } from '../../_core/store/states/payment.state';
import { Select, Store } from '@ngxs/store';
import { CustomerState } from '../../_core/store/states/customer.state';
import { PaymentAction } from '../../_core/store/actions';
import { BrMaskModel } from 'br-mask';

@Component({
  selector: 'app-csaa-payment-method-card',
  templateUrl: './payment-method-card.page.html',
  styleUrls: ['./payment-method-card.page.scss'],
})
export class PaymentMethodCardPage implements OnInit, OnDestroy {
  @Select(CustomerState.hasRegistrationId) hasRegId$: Observable<boolean>;

  @ViewChild(DeleteConfirmDirective)
  public deleteConfirmDirective: DeleteConfirmDirective;
  private readonly tearDown$: Subject<any> = new Subject();
  public currentTheme: string;

  private isAutoPayFlow = false;
  public policyNumber: string;

  public cardDetailsForm: FormGroup;

  private payment: UpcomingPayment;
  private payments: UpcomingPayment[];
  private wallet: WalletDetails;

  public loading = false;
  public isEditing = false;
  public notInitialized = true;
  public editingPaymentMethod: PaymentAccount;

  public highlightCardExpired = false;
  public cardDetailsData = {
    cardNumber: '',
  };
  public cardDetailsMaskConfig: { [key: string]: BrMaskModel } = {
    // NOTE: userCaracters is typo in plugin
    cardNumber: { mask: '0000 0000 0000 0000 000', userCaracters: false, type: 'num', len: 23 },
    expiration: { mask: '00/00', userCaracters: false, type: 'num', len: 5 },
    zip: { mask: '00000', userCaracters: false, type: 'num', len: 5 },
  };

  get title(): string {
    return `${this.cardDetailsForm.controls.cardType.value} Card`;
  }

  get canSubmitForm() {
    return this.cardDetailsForm.valid;
  }

  get saveCard() {
    return this.cardDetailsForm.value.saveCard === true;
  }

  get showNickname() {
    return this.saveCard;
  }

  get cardType() {
    return this.cardDetailsForm.controls.cardType;
  }

  get cardHolderName() {
    return this.cardDetailsForm.controls.cardHolderName;
  }

  get cardNumber() {
    return this.cardDetailsForm.controls.cardNumber;
  }

  get expiration() {
    return this.cardDetailsForm.controls.expiration;
  }

  get zipCode() {
    return this.cardDetailsForm.controls.zipCode;
  }

  get nickname() {
    return this.cardDetailsForm.controls.nickname;
  }

  private static getExpirationDate(card: CardIOResponse) {
    const expiryMonth = card.expiryMonth < 10 ? '0' + card.expiryMonth : card.expiryMonth;
    const expiryYear = card.expiryYear.toString().substring(2);
    return `${expiryMonth}/${expiryYear}`;
  }

  constructor(
    private cardIO: CardIO,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private analyticsService: AnalyticsService,
    private paymentService: PaymentService,
    private makePaymentService: MakePaymentService,
    private alertCtrl: AlertController,
    private callService: CallService,
    private configService: ConfigService,
    private routerService: RouterService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private store: Store
  ) {
    this.currentTheme = this.configService.getTheme();

    this.cardDetailsForm = this.formBuilder.group(
      {
        cardType: [],
        cardHolderName: ['', Validators.compose([Validators.required])],
        cardNumber: ['', Validators.compose([Validators.required, cardNumberValidator])],
        expiration: ['', Validators.compose([Validators.required, expirationValidator])],
        zipCode: ['', Validators.compose([Validators.required, zipCodeValidator])],
        saveCard: [!!this.getRegId()],
        nickname: [''],
      },
      {
        validator: nicknameValidator,
      }
    );

    this.cardNumber.valueChanges.subscribe((v) => {
      // @ts-ignore
      if (!this.cardNumber.isMasked) {
        this.cardDetailsData.cardNumber = v.replace(/\D/g, '');
      }
    });
  }

  private handleNavigation(normalFlowRoute: string = null) {
    if (this.isAutoPayFlow) {
      const route = this.isEditing
        ? 'csaa.payment.autopay.method'
        : 'csaa.payment.autopay.settings';
      this.routerService.navigateBack(route, { policyNumber: this.policyNumber }).then(noop);
    } else if (!!normalFlowRoute) {
      this.routerService.navigateBack(normalFlowRoute).then(noop);
    } else {
      const { path, params } = this.makePaymentService.getReturnPathFromAmountMethodPages();
      this.routerService.navigateBack(path, params).then(noop);
    }
  }

  ngOnInit() {
    combineLatest([this.route.params, this.store.select(PaymentState.walletDetails)])
      .pipe(takeUntil(this.tearDown$))
      .subscribe(
        withErrorReporter(([params, wallets]) => {
          const account = params.account;
          this.wallet = wallets;
          this.isEditing = false;
          if (this.wallet) {
            this.editingPaymentMethod = this.wallet.paymentAccounts.find(
              (a) => a.paymentAccountToken === account
            );
            if (this.editingPaymentMethod) {
              this.isEditing = true;
              if (this.notInitialized) {
                this.initializeValuesForEditing(this.editingPaymentMethod);
                this.notInitialized = false;
              }
            }
          }
        })
      );
    this.route.queryParams
      .pipe(filter((params) => params.autopay && params.policyNumber))
      .subscribe((params) => {
        this.isAutoPayFlow = params.autopay === 'true';
        this.policyNumber = params.policyNumber;
      });
  }

  ngOnDestroy() {
    this.tearDown$.next(true);
    this.tearDown$.complete();
  }

  ionViewWillEnter(): void {
    this.store
      .select(PaymentState.upcomingPayments)
      .pipe(take(1))
      .subscribe(withErrorReporter((payments) => (this.payments = [...payments])));
    this.payment = this.makePaymentService.getActivePayment();
    if (!this.payment) {
      this.handleNavigation();
    }
  }

  setMaskCardNumber(maskCardNumber: boolean) {
    let cardNumber = this.cardDetailsData.cardNumber;
    const cardLen = cardNumber.length;
    if (maskCardNumber && cardLen > 4) {
      this.cardDetailsData.cardNumber = cardNumber;
      cardNumber = '•'.repeat(cardLen - 4) + cardNumber.substring(cardLen - 4, cardLen);
    } else {
      cardNumber = this.cardDetailsData.cardNumber;
    }
    if (!this.cardNumber.errors) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.cardNumber['isMasked'] = maskCardNumber;
      this.cardDetailsMaskConfig.cardNumber.type = maskCardNumber ? 'all' : 'num'; // Workaround since there's not custom type in plugin ATM
      this.cardNumber.setValue(cardNumber);
    }
  }

  initializeValuesForEditing(paymentMethod: PaymentAccount) {
    this.cardHolderName.setValue(paymentMethod.card.holderName);
    this.zipCode.setValue(paymentMethod.card.zipCode);
    this.nickname.setValue(paymentMethod.shortName);
    if (paymentMethod.card.expirationDate) {
      const [year, month] = paymentMethod.card.expirationDate.split('-');
      this.expiration.setValue(`${month}/${+year - 2000}`);
      this.highlightCardExpired = paymentMethod.card.expired;
    }
    this.cardNumber.setValue(paymentMethod.card.last4digits);
  }

  async done() {
    if (!this.cardDetailsForm.valid) {
      return;
    }

    const loading = await this.loadingCtrl.create();
    loading.present().then(noop);
    const lastFour = this.cardDetailsData.cardNumber.slice(-4);

    const paymentInfo: NewPaymentMethodCardData = {
      cardNumber: this.cardDetailsData.cardNumber,
      cardHolderName: this.cardDetailsForm.controls.cardHolderName.value,
      cardZip: this.cardDetailsForm.controls.zipCode.value,
      cardExpirationDate: this.cardDetailsForm.controls.expiration.value,
      last4digits: lastFour,
      shortName: `${this.cardDetailsForm.controls.nickname.value || 'Simple'} ${lastFour}`,
      isPreferred: this.cardDetailsForm.controls.saveCard.value,
      saveForFuture: this.saveCard ? 'Y' : 'N',
    };

    // v3 Todo: remove paymentInfo variable
    const payload: RegisterCardPaymentAccountPayload = {
      paymentCardNumber: paymentInfo.cardNumber,
      paymentCardHolderName: paymentInfo.cardHolderName,
      paymentCardExpirationDate: paymentInfo.cardExpirationDate,
      paymentCardZip: paymentInfo.cardZip,
    };
    const options: RegisterPaymentAccountOptions = {
      registrationId: this.getRegId(),
      shortName: paymentInfo.shortName,
      isPreferred: paymentInfo.isPreferred,
      saveForFuture: this.saveCard ? 'Y' : 'N',
    };
    const { walletId } = this.store.selectSnapshot(PaymentState.walletDetails);

    (this.isEditing
      ? this.paymentService
          // payment central has no concept of "updating" payments so we need to delete the current paymentAccountToken
          // and create a new payment method with the updated information
          .deletePaymentMethod(
            this.editingPaymentMethod.paymentAccountToken,
            this.getRegId(),
            walletId
          )
      : of(null)
    )
      .pipe(switchMap(() => this.paymentService.registerCardPaymentAccount(payload, options)))
      .subscribe(
        withErrorReporter(
          ({ token, cardType, isDebitCard }) => {
            loading.dismiss();

            // Track enrollment of new payment account
            if (this.isEditing === true) {
              this.analyticsService.trackEvent(
                EventName.PAYMENT_METHOD_UPDATED,
                Category.payments,
                {
                  event_type: EventType.USER_INFORMATION_ENTERED,
                  status: this.isEditing ? 'Edited' : 'Added',
                  payment_method: isDebitCard ? 'Debit' : 'Credit',
                  ...AnalyticsService.mapPaymentPolicy(
                    ...(this.payment.allPolicies
                      ? this.payments.filter((p) => !!p.amount)
                      : [this.payment])
                  ),
                  terms_accepted: true,
                }
              );
            } else {
              this.analyticsService.trackEvent(EventName.PAYMENT_METHOD_ADDED, Category.payments, {
                event_type: EventType.USER_INFORMATION_ENTERED,
                status: this.isEditing ? 'Edited' : 'Added',
                payment_method: isDebitCard ? 'Debit' : 'Credit',
                ...AnalyticsService.mapPaymentPolicy(
                  ...(this.payment.allPolicies
                    ? this.payments.filter((p) => !!p.amount)
                    : [this.payment])
                ),
                terms_accepted: true,
              });
            }

            const paymentAccount: PaymentAccount = {
              paymentAccountToken: token,
              shortName: paymentInfo.shortName,
              isPreferred: paymentInfo.isPreferred,
              card: {
                zipCode: paymentInfo.cardZip,
                printedName: paymentInfo.cardHolderName,
                holderName: paymentInfo.cardHolderName,
                last4digits: paymentInfo.last4digits,
                type: cardType,
                isDebitCard,
              },
            };

            this.makePaymentService.selectPaymentAccount(paymentAccount);
            this.handleNavigation();
          },
          async () => {
            loading.dismiss().then(noop);
            const alert = await this.alertCtrl.create({
              header: 'Error Adding Card',
              message: `We seem to be experiencing some problems. Please call Service at<br>${PAYMENTS_SERVICE_NUMBER}.`,
              buttons: [
                {
                  text: 'Call Service',
                  handler: () => {
                    this.analyticsService.trackEvent(
                      EventName.CALL_SERVICE_ERROR_MESSAGE,
                      Category.global,
                      {
                        event_type: EventType.MESSAGED,
                        method: 'phone',
                        message: `We seem to be experiencing some problems. Please call Service at ${PAYMENTS_SERVICE_NUMBER}.`,
                      }
                    );
                    this.cleanUpAndReturn();
                    this.callService.call(PAYMENTS_SERVICE_NUMBER);
                  },
                },
                {
                  text: 'Close',
                  handler: () => this.cleanUpAndReturn(),
                },
              ],
            });
            alert.present().then(noop);
          }
        )
      );
  }

  async scanCard() {
    const canScan = await this.cardIO.canScan();
    if (canScan) {
      const options: CardIOOptions = {
        scanExpiry: true,
        requireExpiry: true,
        requireCardholderName: true,
        requireCVV: false,
        suppressManual: true,
        hideCardIOLogo: true,
        keepApplicationTheme: true,
      };

      const card = await this.cardIO.scan(options);

      this.cardDetailsData.cardNumber = card.cardNumber;
      this.cardNumber.setValue(card.cardNumber);
      this.expiration.setValue(PaymentMethodCardPage.getExpirationDate(card));
      this.cardHolderName.setValue(card.cardholderName.toUpperCase());
      this.setMaskCardNumber(true);
    } else {
      alert('Cannot scan your card');
    }
  }

  async openPaymentTerms() {
    const modal = await this.modalCtrl.create({
      component: PaymentTermsConditionsComponent,
    });
    await modal.present();
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_CLICKED, Category.payments, {
      event_type: EventType.FILE_DOWNLOADED,
    });
  }

  onDeleteConfirmed = () => {
    this.deleteCard();
  };

  deleteCard() {
    const { walletId } = this.store.selectSnapshot(PaymentState.walletDetails);
    this.paymentService
      .deletePaymentMethod(this.editingPaymentMethod.paymentAccountToken, this.getRegId(), walletId)
      .pipe(interactWithLoader())
      .subscribe(
        withErrorReporter(
          () => {
            this.analyticsService.trackEvent(EventName.PAYMENT_METHOD_UPDATED, Category.payments, {
              event_type: EventType.USER_INFORMATION_ENTERED,
              status: 'Deleted',
            });
            this.showDeleteSuccessfulAlert();
          },
          () => DeleteConfirmDirective.showDeleteError(() => this.cleanUpAndReturn())
        )
      );
  }

  private showDeleteSuccessfulAlert(): void {
    DeleteConfirmDirective.showDeleteSuccessAlert(() => this.cleanUpAndReturn());
  }

  onClickBackBtn() {
    // this.handleNavigation('csaa.payment.method');
    const { path, params } = this.makePaymentService.getReturnPathFromAmountMethodPages();
    this.routerService.navigateBack(path, params).then(noop);
  }

  private cleanUpAndReturn() {
    this.makePaymentService.selectPaymentAccount(null);
    this.store.dispatch(new PaymentAction.ReloadWallet()).subscribe(withErrorReporter(noop));
    this.onClickBackBtn();
  }

  private getRegId() {
    return this.store.selectSnapshot(CustomerState.registrationId);
  }
}
