import { Component, OnInit } from '@angular/core';
import { noop, Observable } from 'rxjs';
import {
  IonViewWillEnter,
  WalletDetails,
  PaymentAccount,
  UpcomingPayment,
} from '../../_core/interfaces';
import { ConfigService, RouterService } from '../../_core/services';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { PaymentHelper } from '../../_core/shared/payment.helper';
import { PaymentState } from '../../_core/store/states/payment.state';
import { Select } from '@ngxs/store';
import { FetchState } from '../../_core/store/states/fetch.state';
import { PaymentAction } from '../../_core/store/actions';

const newPaymentAccountMenu: { route: string; title: string }[] = [
  { route: 'csaa.payment.method.card', title: 'Credit or Debit Card' },
  { route: 'csaa.payment.method.checking-account', title: 'Checking Account' },
  { route: 'csaa.payment.method.savings-account', title: 'Savings Account' },
];

@Component({
  selector: 'app-csaa-payment-select-method',
  templateUrl: './payment-select-method.page.html',
  styleUrls: ['./payment-select-method.page.scss'],
})
export class PaymentSelectMethodPage implements OnInit, IonViewWillEnter {
  public readonly autopayLabel = PaymentHelper.getAutopayEnrollmentLabel;
  public readonly newPaymentAccountMenu = newPaymentAccountMenu;
  public readonly currentTheme: string;
  @Select(PaymentState.walletDetails) wallet$: Observable<WalletDetails>;
  @Select(FetchState.isLoading(PaymentAction.LoadWallet)) isLoading$: Observable<boolean>;
  private upcomingPayments: UpcomingPayment[];

  public get autopayEnrolledPayments(): UpcomingPayment[] {
    return this.upcomingPayments ? this.upcomingPayments.filter((p) => p.autopayEnrollment) : [];
  }

  constructor(
    private configService: ConfigService,
    private routerService: RouterService,
    private makePaymentService: MakePaymentService
  ) {
    this.currentTheme = this.configService.getTheme();
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.upcomingPayments = this.makePaymentService.getUpcomingPayments();
    if (!this.upcomingPayments) {
      this.onClickBackBtn();
      return;
    }

    if (this.upcomingPayments.some((p) => p.autoPay && !p.autopayEnrollment)) {
      // Autopay enrollment data hasn't been fetched correctly, we should do another fetch here
    }
  }

  route(path: string) {
    return this.routerService.fullPath(path);
  }

  onClickBackBtn() {
    const { path, params } = this.makePaymentService.getReturnPathFromAmountMethodPages();
    this.routerService.navigateBack(path, params).then(noop);
  }

  goToAutopay($event, payment: UpcomingPayment) {
    $event.stopPropagation();
    $event.preventDefault();
    this.routerService
      .navigateBack('csaa.payment.autopay.settings', { policyNumber: payment.policyNumber })
      .then(noop);
  }

  generateIconSrc(account: PaymentAccount): string {
    const iconName: string = !account.card ? 'bank' : account.card.type;
    return `/assets/csaa-mobile/vectors/${iconName}.svg`;
  }

  selectPaymentAccount(account: PaymentAccount): void {
    this.makePaymentService.selectPaymentAccount(account);
    this.onClickBackBtn();
  }

  onClickEditPaymentAccount(account: PaymentAccount): void {
    const normalizeBankType = (a: PaymentAccount): string =>
      a.account.bankAccountType.toLocaleLowerCase() === 'savings' ? 'savings' : 'checking';
    const suffix = account.card ? 'card' : normalizeBankType(account) + '-account';
    this.routerService
      .navigateForward(`csaa.payment.method.${suffix}.edit`, {
        account: account.paymentAccountToken,
      })
      .then(noop);
  }
}
