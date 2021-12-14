import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import {
  PaymentAccount,
  PaymentResult,
  UpcomingPayment,
  UpcomingPaymentModel,
} from '../../../_core/interfaces';
import { RouterService } from '../../../_core/services';
import { withErrorReporter } from '../../../_core/helpers';
import { CsaaCommonModule } from '../../../csaa-core/csaa-common.module';
import { format } from 'date-fns';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class MakePaymentService {
  private resetListenerSub: Subscription;
  private upcomingPayments: UpcomingPayment[];
  private activePayment: UpcomingPayment;
  private activePaymentAccount: PaymentAccount;
  private paymentResults: PaymentResult = {};

  private returnPathFromAmountMethodPages: { path: string; params?: any };

  public get hasPayment(): boolean {
    return !!this.activePayment;
  }

  constructor(private readonly router: Router, private routerService: RouterService) {}

  startResetListener(): void {
    if (this.resetListenerSub) {return;}
    this.resetListenerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(
        withErrorReporter((e: NavigationEnd) => {
          if (!e.url.startsWith(this.routerService.fullPath('csaa.payment.index'))) {
            this.reset();
            this.stopResetListener();
          }
        })
      );
  }

  stopResetListener(): void {
    if (!this.resetListenerSub) {return;}
    this.resetListenerSub.unsubscribe();
    this.resetListenerSub = undefined;
  }

  public reset(): void {
    this.setActivePayment(null);
    this.selectPaymentAccount(null);
    this.setReturnPathFromAmountMethodPages(null);
    this.setPaymentResult({});
  }

  public setActivePayment(payment: UpcomingPayment): void {
    this.activePayment = null;
    if (!!payment) {
      this.activePayment = new UpcomingPaymentModel({ ...payment });
    }
    this.startResetListener();
  }

  public getActivePayment() {
    return !!this.activePayment ? new UpcomingPaymentModel({ ...this.activePayment }) : null;
  }

  public updatePaymentAmount(value: number) {
    this.activePayment.otherAmount = value;
  }

  public getPaymentAmount(): number {
    const { amount, otherAmount } = this.activePayment;
    return otherAmount || amount;
  }

  public setUpcomingPayments(payments: UpcomingPayment[]): void {
    this.upcomingPayments = payments;
    this.startResetListener();
  }

  public getUpcomingPayments(): UpcomingPayment[] {
    return this.upcomingPayments;
  }

  public selectPaymentAccount(account: PaymentAccount) {
    this.activePaymentAccount = account;
  }

  public pullSelectedPaymentAccount(): PaymentAccount {
    const activePaymentAccount = this.activePaymentAccount;
    this.activePaymentAccount = null;
    return activePaymentAccount;
  }

  public setReturnPathFromAmountMethodPages(path: string, params = null) {
    this.returnPathFromAmountMethodPages = { path, params };
  }

  public getReturnPathFromAmountMethodPages() {
    return this.returnPathFromAmountMethodPages || { path: 'csaa.payment.index' };
  }

  public setPaymentResult(results: PaymentResult) {
    this.paymentResults = { ...results };
  }

  public pullPaymentResults() {
    const results = this.paymentResults;
    this.paymentResults = null;
    return { ...results };
  }

  public updatePaymentResult(
    policyNumber: string,
    status: string,
    receiptNumber: string,
    paymentAccount: PaymentAccount,
    amount: number
  ) {
    this.paymentResults[policyNumber] = {
      result: status === 'SUCC',
      receiptNumber,
      paymentAccount,
      amount,
      date: format(new Date(Date.now()), 'yyyy-MM-dd'),
    };
  }

  public getPaymentResult(policyNumber: string): boolean {
    return !!this.paymentResults[policyNumber];
  }
}
