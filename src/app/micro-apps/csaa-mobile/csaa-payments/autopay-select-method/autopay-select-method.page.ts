import { Component, OnDestroy, OnInit } from '@angular/core';
import { noop, Subject } from 'rxjs';
import { WalletDetails, PaymentAccount, UpcomingPayment, Policy } from '../../_core/interfaces';
import { ConfigService, RouterService } from '../../_core/services';
import { MakePaymentService } from '../_shared/services/make-payment.service';
import { PaymentHelper } from '../../_core/shared/payment.helper';
import { ActivatedRoute } from '@angular/router';
import { PaymentState } from '../../_core/store/states/payment.state';
import { Store } from '@ngxs/store';
import { PolicyState } from '../../_core/store/states/policy.state';

const newPaymentAccountMenu: { route: string; title: string }[] = [
  { route: 'csaa.payment.method.card', title: 'Credit or Debit Card' },
  { route: 'csaa.payment.method.checking-account', title: 'Checking Account' },
  { route: 'csaa.payment.method.savings-account', title: 'Savings Account' },
];

@Component({
  selector: 'app-csaa-payment-select-method',
  templateUrl: './autopay-select-method.page.html',
  styleUrls: ['./autopay-select-method.page.scss'],
})
export class AutopaySelectMethodPage implements OnInit, OnDestroy {
  private readonly tearDown$: Subject<any> = new Subject();
  public readonly autopayLabel = PaymentHelper.getAutopayEnrollmentLabel;
  public readonly newPaymentAccountMenu = newPaymentAccountMenu;
  public currentTheme: string;
  public policyNumber: string;
  public policy: Policy;
  public wallet: WalletDetails;
  private upcomingPayments: UpcomingPayment[];

  public get autopayEnrolledPayments(): UpcomingPayment[] {
    return this.upcomingPayments ? this.upcomingPayments.filter((p) => p.autopayEnrollment) : [];
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly routerService: RouterService,
    private readonly makePaymentService: MakePaymentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store
  ) {
    this.currentTheme = this.configService.getTheme();
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.policyNumber = paramMap.get('policyNumber');
      this.policy = this.store.selectSnapshot(PolicyState.policyData(this.policyNumber));
      this.wallet = this.store.selectSnapshot(PaymentState.walletDetails);
      this.upcomingPayments = this.store.selectSnapshot(PaymentState.upcomingPayments);
    });
  }

  ngOnDestroy() {
    this.tearDown$.next(true);
    this.tearDown$.complete();
  }

  route(path: string) {
    return this.routerService.fullPath(path);
  }

  onClickBackBtn() {
    this.navigateBack();
  }

  navigateBack(): void {
    this.routerService
      .navigateBack('csaa.payment.autopay.settings', { policyNumber: this.policyNumber })
      .then(noop);
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
    this.navigateBack();
  }

  onClickEditPaymentAccount(account: PaymentAccount): void {
    const normalizeBankType = (a: PaymentAccount): string =>
      a.account.bankAccountType.toLocaleLowerCase() === 'savings' ? 'savings' : 'checking';
    const suffix = account.card ? 'card' : normalizeBankType(account) + '-account';
    this.routerService
      .navigateForward(
        `csaa.payment.method.${suffix}.edit`,
        {
          account: account.paymentAccountToken,
        },
        { queryParams: { autopay: 'true', policyNumber: this.policyNumber } }
      )
      .then(noop);
  }
}
