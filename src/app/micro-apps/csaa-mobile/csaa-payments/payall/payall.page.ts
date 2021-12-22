import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import {
  Category,
  EventName,
  EventType,
  PaymentAccount,
  PaymentType,
  UpcomingPayment,
  UpcomingPaymentModel,
  WalletDetails,
} from '../../_core/interfaces';
import { noop, Observable } from 'rxjs';
import { AnalyticsService, parseToCent, RouterService } from '../../_core/services';
import { PaymentState } from '../../_core/store/states/payment.state';
import { SubSink } from '../../_core/shared/subscription.helper';
import { CustomerAction, PaymentAction, PolicyAction } from '../../_core/store/actions';
import { finalize, switchMap } from 'rxjs/operators';
import { withErrorReporter } from '../../_core/helpers';
import { IonRefresher, ModalController } from '@ionic/angular';
import { PaymentTermsConditionsComponent } from '../_shared/ui-kits/payment-terms-conditions/payment-terms-conditions.component';
import { MakePaymentService } from '../_shared/services/make-payment.service';

@Component({
  selector: 'csaa-payall',
  templateUrl: './payall.page.html',
  styleUrls: ['./payall.page.scss'],
})
export class PayallPage implements OnDestroy, OnInit {
  @Select(PaymentState.upcomingPayments) payments$: Observable<UpcomingPayment[]>;
  @Select(PaymentState.walletDetails) wallet$: Observable<WalletDetails>;

  combinedPayment: UpcomingPayment;
  subsink = new SubSink();
  currentTheme: string;
  loading = true;
  amountSelected: PaymentType;
  methodSelected;
  private refresher: IonRefresher;

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly analyticsService: AnalyticsService,
    private readonly modalCtrl: ModalController,
    private readonly makePaymentService: MakePaymentService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  ngOnInit() {
    this.subsink.add(
      this.payments$.subscribe((payments) => {
        this.combinedPayment = this.createPayment(payments);
      })
    );
    this.subsink.add(
      this.wallet$.subscribe((wallet) => {
        if (!this.methodSelected) {
          this.methodSelected = wallet.paymentAccounts.find(
            (p) => p.isPreferred
          )?.paymentAccountToken;
        }
      })
    );
    this.dispatchLoadActions();
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  onClickBackBtn() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.routerService.navigateBack('csaa.home').then(noop);
  }

  onPayClicked() {}

  createPayment(payments) {
    const combinedPayment = Object.assign({}, payments[0]);
    combinedPayment.allPolicies = true;
    combinedPayment.policyNumber = 'ALL';
    combinedPayment.minimumAmount = 0;
    combinedPayment.remainingPremium = 0;

    payments.forEach((currentPayment) => {
      if (currentPayment.remainingPremium > 0) {
        combinedPayment.remainingPremium += parseToCent(currentPayment.remainingPremium);
      }

      if (currentPayment.minimumAmount > 0) {
        combinedPayment.minimumAmount += parseToCent(currentPayment.minimumAmount);
      }
    });

    // Revert from cent since we completed calculation
    combinedPayment.minimumAmount = combinedPayment.minimumAmount / 100;
    combinedPayment.remainingPremium = combinedPayment.remainingPremium / 100;

    if (!this.amountSelected) {
      if (combinedPayment.minimumAmount > 0) {
        this.amountSelected = PaymentType.minimum;
      } else if (combinedPayment.remainingPremium > 0) {
        this.amountSelected = PaymentType.remaining;
      }
    }

    return new UpcomingPaymentModel(combinedPayment);
  }

  onAmountSelectionChange(event) {
    this.amountSelected = event?.selection;
    if (this.amountSelected === PaymentType.other) {
      this.combinedPayment.otherAmount = event.value;
    }
  }

  onMethodChange(event) {
    this.methodSelected = event?.detail?.value;
    console.log('Method Change', { value: this.methodSelected });
  }

  doRefresh(refresher) {
    this.loading = true;
    this.refresher = refresher;
    this.dispatchLoadActions();
  }

  private dispatchLoadActions() {
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() => this.store.dispatch(new PaymentAction.LoadPayments())),
        switchMap(() =>
          this.store.dispatch([new PaymentAction.LoadHistory(), new PaymentAction.LoadWallet()])
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter(noop));
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
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

  onClickEditPaymentAccount(account: PaymentAccount): void {
    const normalizeBankType = (a: PaymentAccount): string =>
      a.account.bankAccountType.toLocaleLowerCase() === 'savings' ? 'savings' : 'checking';
    const suffix = account.card ? 'card' : normalizeBankType(account) + '-account';
    this.methodSelected = account?.paymentAccountToken;
    this.makePaymentService.selectPaymentAccount(account);
    this.makePaymentService.setActivePayment(this.combinedPayment);
    this.makePaymentService.setReturnPathFromAmountMethodPages('csaa.payment.payall');
    this.routerService
      .navigateForward(`csaa.payment.method.${suffix}.edit`, {
        account: account.paymentAccountToken,
      })
      .then(noop);
  }

  onAddNewPaymentMethod() {
    this.makePaymentService.setReturnPathFromAmountMethodPages('csaa.payment.payall');
    this.routerService.navigateForward(`csaa.payment.add-payment-method`).then(noop);
  }
}
