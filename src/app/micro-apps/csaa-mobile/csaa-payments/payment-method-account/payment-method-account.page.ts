import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { CallService } from '../../_core/services/call.service';
import { ActivatedRoute } from '@angular/router';
import {
  accountNumberValidator,
  nicknameValidator,
  routingNumberValidator,
} from '../../_core/shared/payment.validators';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { combineLatest, noop, Observable, of, Subject, throwError } from 'rxjs';
import { PAYMENTS_SERVICE_NUMBER } from '../../constants';
import { interactWithLoader } from '../../_core/operators/loader.operator';
import { PaymentTermsConditionsComponent } from '../_shared/ui-kits/payment-terms-conditions/payment-terms-conditions.component';
import { withErrorReporter } from '../../_core/helpers';
import {
  IonViewWillEnter,
  UpcomingPayment,
  WalletDetails,
  PaymentAccount,
  RegisterEFTPaymentAccountPayload,
  PaymentBankAccountType,
  RegisterPaymentAccountOptions,
  EventName,
  Category,
  EventType,
} from '../../_core/interfaces';
import {
  ConfigService,
  RouterService,
  AnalyticsService,
  PaymentService,
} from '../../_core/services';
import { DeleteConfirmDirective } from '../_shared/directives/delete-confirm/delete-confirm.directive';
import { PaymentState } from '../../_core/store/states/payment.state';
import { Select, Store } from '@ngxs/store';
import { CustomerState } from '../../_core/store/states/customer.state';
import { PaymentAction } from '../../_core/store/actions';

@Component({
  selector: 'app-csaa-payment-method-account',
  templateUrl: './payment-method-account.page.html',
  styleUrls: ['./payment-method-account.page.scss'],
})
export class PaymentMethodAccountPage implements OnInit, IonViewWillEnter, OnDestroy {
  @Select(CustomerState.hasRegistrationId) hasRegId$: Observable<boolean>;
  @ViewChild(DeleteConfirmDirective) public deleteConfirmDirective: DeleteConfirmDirective;

  public currentTheme: string;
  public policyNumber: string;
  public notInitialized = true;
  accountDetailsForm: FormGroup;
  isEditing: boolean;
  isCheckingAccountType: boolean;
  editingPaymentMethod = {} as PaymentAccount;
  pageInfo = {
    checking: {
      title: 'Checking Account',
      subtitle: 'Enter your account information',
    },
    savings: {
      title: 'Savings Account',
      subtitle: 'Enter your account information',
    },
  };

  private isAutoPayFlow = false;
  private payment: UpcomingPayment;
  private payments: UpcomingPayment[];
  private wallet: WalletDetails;
  private readonly tearDown$: Subject<any> = new Subject();

  constructor(
    private configService: ConfigService,
    private routerService: RouterService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private analyticsService: AnalyticsService,
    private paymentService: PaymentService,
    private makePaymentService: MakePaymentService,
    private alertCtrl: AlertController,
    private callService: CallService,
    private route: ActivatedRoute,
    private modalctrl: ModalController,
    private store: Store
  ) {
    this.currentTheme = this.configService.getTheme();
  }

  ngOnInit() {
    this.isCheckingAccountType = this.routerService.currentRouteContains('method/checking-account');
    this.accountDetailsForm = this.formBuilder.group(
      {
        accountType: [this.isCheckingAccountType ? 'checking' : 'savings'],
        accountHolderName: ['', Validators.compose([Validators.required])],
        accountNumber: ['', Validators.compose([Validators.required, accountNumberValidator()])],
        routingNumber: ['', Validators.compose([Validators.required, routingNumberValidator()])],
        saveAccount: [!!this.getRegId()],
        nickname: [''],
      },
      {
        validator: nicknameValidator,
      }
    );
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
                this.notInitialized = true;
              }
            }
          }
        })
      );

    this.route.queryParams
      .pipe(
        takeUntil(this.tearDown$),
        filter((params) => params.autopay && params.policyNumber)
      )
      .subscribe((params) => {
        this.isAutoPayFlow = params.autopay === 'true';
        this.policyNumber = params.policyNumber;
      });
  }

  ionViewWillEnter() {
    this.store
      .select(PaymentState.upcomingPayments)
      .pipe(take(1))
      .subscribe(withErrorReporter((payments) => (this.payments = [...payments])));
    this.payment = this.makePaymentService.getActivePayment();
    if (!this.payment) {
      this.handleNavigation();
    }
  }

  get title(): string {
    return this.pageInfo[this.accountDetailsForm.controls.accountType.value.toLowerCase()].title;
  }

  get subtitle(): string {
    return this.pageInfo[this.accountDetailsForm.controls.accountType.value.toLowerCase()].subtitle;
  }

  get canSubmitForm() {
    return this.accountDetailsForm.valid;
  }

  get saveAccount() {
    return this.accountDetailsForm.value.saveAccount === true;
  }

  get showNickname() {
    return this.saveAccount;
  }

  get accountHolderName() {
    return this.accountDetailsForm.controls.accountHolderName;
  }

  get accountNumber() {
    return this.accountDetailsForm.controls.accountNumber;
  }

  get routingNumber() {
    return this.accountDetailsForm.controls.routingNumber;
  }

  get nickname() {
    return this.accountDetailsForm.controls.nickname;
  }

  async done() {
    if (!this.accountDetailsForm.valid) {
      return;
    }

    const loading = await this.loadingCtrl.create();
    loading.present();

    const bankAccountType = this.isCheckingAccountType ? 'CHKG' : 'SAVG';

    const paymentInfo = {
      accountNumber: this.accountNumber.value,
      accountHolderName: this.accountHolderName.value,
      routingNumber: this.routingNumber.value,
      shortName: this.nickname.value,
      bankAccountType,
      saveForFuture: this.saveAccount ? 'Y' : 'N',
      isPreferred: this.saveAccount,
    };

    const payload: RegisterEFTPaymentAccountPayload = {
      pmtSourcePhoneNumber: '9253268081', // v3 Todo: get authenticated user's phone number
      paymentBankAccountNumber: paymentInfo.accountNumber,
      paymentBankAccountHolderName: paymentInfo.accountHolderName,
      paymentBankAccountType: this.isCheckingAccountType
        ? PaymentBankAccountType.CHECKING
        : PaymentBankAccountType.SAVINGS,
      fiRoutingNumber: paymentInfo.routingNumber,
    };

    const options: RegisterPaymentAccountOptions = {
      registrationId: this.getRegId(),
      shortName: paymentInfo.shortName,
      isPreferred: paymentInfo.isPreferred,
      saveForFuture: this.saveAccount ? 'Y' : 'N',
    };

    const { walletId } = this.store.selectSnapshot(PaymentState.walletDetails);

    this.paymentService
      .validateRoutingNumber(paymentInfo.routingNumber)
      .pipe(
        switchMap((valid) => {
          if (!valid) {
            return throwError('Invalid routing number');
          }
          return this.isEditing
            ? this.paymentService.deletePaymentMethod(
                this.editingPaymentMethod.paymentAccountToken,
                this.getRegId(),
                walletId
              )
            : of(valid);
        }),
        switchMap(() => this.paymentService.registerEFTPaymentAccount(payload, options))
      )
      .subscribe(
        withErrorReporter(
          ({ token }) => {
            loading.dismiss();
            if (this.isEditing === true) {
              this.analyticsService.trackEvent(
                EventName.PAYMENT_METHOD_UPDATED,
                Category.payments,
                {
                  event_type: EventType.USER_INFORMATION_ENTERED,
                  status: this.isEditing ? 'Edited' : 'Added',
                  method: this.isCheckingAccountType ? 'Checking' : 'Saving',
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
                method: this.isCheckingAccountType ? 'Checking' : 'Saving',
                ...AnalyticsService.mapPaymentPolicy(
                  ...(this.payment.allPolicies
                    ? this.payments.filter((p) => !!p.amount)
                    : [this.payment])
                ),
                terms_accepted: true,
              });
            }

            const last4OfAccountNumber = paymentInfo.accountNumber.slice(-4);
            const shortName = paymentInfo.shortName
              ? `${paymentInfo.shortName} ${last4OfAccountNumber}`
              : `${last4OfAccountNumber}`;

            const paymentAccount: PaymentAccount = {
              paymentAccountToken: token,
              shortName,
              isPreferred: this.saveAccount,
              account: {
                institution: {
                  routingNumber: paymentInfo.routingNumber,
                },
                accountNumber: paymentInfo.accountNumber,
                holderName: paymentInfo.accountHolderName,
                type: this.isCheckingAccountType ? 'checking' : 'savings',
              },
            };
            this.makePaymentService.selectPaymentAccount(paymentAccount);
            this.handleNavigation();
          },
          async (err) => {
            loading.dismiss();
            let errorMessage = `We seem to be experiencing some problems. Please call Service at<br>${PAYMENTS_SERVICE_NUMBER}.`;
            if (err.toString() === 'Invalid routing number') {
              errorMessage = `The routing number is invalid.`;
            }

            const alert = await this.alertCtrl.create({
              header: 'Error Adding Account',
              message: errorMessage,
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
            alert.present();
          }
        )
      );
  }

  ngOnDestroy(): void {
    this.tearDown$.next(true);
    this.tearDown$.complete();
  }

  initializeValuesForEditing(paymentMethod: PaymentAccount) {
    this.accountHolderName.setValue(paymentMethod.account.holderName);
    this.nickname.setValue(paymentMethod.shortName);
  }

  async openPaymentTerms() {
    const modal = await this.modalctrl.create({
      component: PaymentTermsConditionsComponent,
    });
    await modal.present();
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_CLICKED, Category.payments, {
      event_type: EventType.FILE_DOWNLOADED,
    });
  }

  onDeleteConfirmed = () => {
    this.deleteAccount();
  };

  deleteAccount() {
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

  onClickBackBtn() {
    this.handleNavigation('csaa.payment.method');
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

  private showDeleteSuccessfulAlert(): void {
    DeleteConfirmDirective.showDeleteSuccessAlert(() => this.cleanUpAndReturn());
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
