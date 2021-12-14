import { Injectable } from '@angular/core';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import {
  AutoPayEnrollmentResponse,
  BaseRegisterPaymentAccountPayload,
  BillingSummary,
  BillState,
  InstallmentFee,
  LineItems,
  MakePaymentPayload,
  MakePaymentResponse,
  OneTimePaymentAccount,
  PaymentAccount,
  PaymentAccountType,
  PaymentHistory,
  PaymentHistoryResponse,
  PaymentSummaryResponse,
  RegisterCardPaymentAccountPayload,
  RegisterEFTPaymentAccountPayload,
  RegisterPaymentAccountOptions,
  RegisterPaymentAccountResponse,
  RetrieveWalletDetailResponse,
  RoutingNumberDetailsResponse,
  UpcomingPayment,
  UpcomingPaymentModel,
  WalletDetails,
} from '../interfaces/payment.interface';
import { Policy, PolicyType } from '../interfaces/policy.interface';
import DateHelper from '../shared/date.helper';
import { isCardExpired } from '../shared/payment.validators';
import { AuthService } from './auth/auth.service';
import { ConfigService } from './config/config.service';
import { GlobalStateService } from './global-state.service';
import { HttpService } from './http/http.service';
import { ErrorWithReporter, getErrorStatus } from '../helpers';
import { PolicyHelper } from '../shared/policy.helper';
import { AppEndpointsEnum } from '../interfaces';
import { Store } from '@ngxs/store';
import { PaymentAction } from '../store/actions';
import { endOfMonth, format, parse } from 'date-fns';
import { MetadataState } from '../store/states/metadata.state';

export const parseToCent = (n) => Number(parseFloat(n).toFixed(2).replace(/\./, ''));

enum ERROR_CODES {
  ACCOUNT_RESTRICTED = '4-210',
}

@Injectable({
  providedIn: CsaaCommonModule,
})
export class PaymentService {
  static computeAmountBeingPaid(payments: UpcomingPayment | UpcomingPayment[]): number {
    if (Array.isArray(payments)) {
      const amountInCent = payments
        .filter((p) => p.amount > 0)
        .reduce((currentAmount, p) => currentAmount + parseToCent(p.amount), 0);
      return amountInCent > 0 ? amountInCent / 100 : amountInCent;
    }
    const payment: UpcomingPayment = payments;
    return payment.otherAmount || payment.amount || payment.minimumAmount;
  }

  static detailAmountBeingPaid(payments: UpcomingPayment | UpcomingPayment[]): {
    [policyNumber: string]: number;
  } {
    if (Array.isArray(payments)) {
      return payments
        .filter((p) => p.amount > 0)
        .reduce((detail, p) => ({ ...detail, [p.policyNumber]: p.amount }), {});
    }
    const payment: UpcomingPayment = payments as any;
    return {
      [payment.policyNumber]: payment.otherAmount || payment.amount || payment.minimumAmount,
    };
  }

  public static generateCorrelationId(): string {
    return Date.now().toString() + '.' + Math.random().toString().substr(-5);
  }
  private static mapUpcomingPayment(
    billingSummary: BillingSummary,
    policySummary: Policy
  ): UpcomingPayment {
    const minimumAmount = parseFloat(billingSummary.currentBalance);
    const totalDue = parseFloat(billingSummary.payOffAmount);
    return new UpcomingPaymentModel({
      dueDate: DateHelper.toDate(billingSummary.bill.dueDate),
      policyNumber: billingSummary.policyNumber,

      vehicles: policySummary.vehicles,
      subtitle: policySummary.subtitle,

      autoPay: billingSummary.autoPay === 'true',
      // TODO: how can we get these? - now it's arbitrary
      type: 'minimum',
      amount: minimumAmount,
      minimumAmount,
      remainingPremium: totalDue,
      policyType: policySummary.type,
      policyRiskState: policySummary.riskState,
      isPastDue: billingSummary.bill.isPastDue,
      isPaymentDue: billingSummary.bill.isPaymentDue,
    });
  }

  public static isAccountRestricted(err: ErrorWithReporter) {
    const originalError = err?.getOriginalError();
    return originalError?.error?.errorCode === ERROR_CODES.ACCOUNT_RESTRICTED;
  }

  constructor(
    private store: Store,
    private httpService: HttpService,
    private auth: AuthService,
    private sharedService: GlobalStateService,
    private csaaConfigService: ConfigService
  ) {}
  /**
   * Fetch Billing Summary
   */
  fetchBillingSummary(policies: Policy[]): Observable<UpcomingPayment[]> {
    if (policies.length === 0) {
      return of([]);
    }
    const policyNumbers = policies.map((policy) => policy.number);

    return this.httpService
      .postNamedResource<PaymentSummaryResponse>(AppEndpointsEnum.billingSummary, {
        policyNumbers,
      })
      .pipe(
        map((res) => res.body),
        catchError((error) => {
          if (error.status === 404) {
            return of<PaymentSummaryResponse>({ billingSummaries: [] });
          } else {
            return throwError(error);
          }
        }),
        mergeMap<PaymentSummaryResponse, Observable<UpcomingPayment[]>>((payments) => {
          if (!payments || !payments.billingSummaries || payments.billingSummaries.length === 0) {
            return of([]);
          }
          const mappedPayments: UpcomingPayment[] = payments.billingSummaries.map((payment, idx) =>
            PaymentService.mapUpcomingPayment(payment, policies[idx])
          );
          const sortedPayments = mappedPayments.sort((a, b) => {
            if (a.isPastDue && !b.isPastDue) {
              return -1;
            } else if (!a.isPastDue && b.isPastDue) {
              return 1;
            }

            if (a.dueDate > b.dueDate) {
              return 1;
            } else if (a.dueDate < b.dueDate) {
              return -1;
            }
            return 0;
          });

          const enrollmentSubs = [];
          sortedPayments.forEach((payment: UpcomingPayment) => {
            if (payment.autoPay) {
              enrollmentSubs.push(
                this.getAutopayEnrollmentData(payment.policyNumber, payment.policyType).pipe(
                  tap((data) => (payment.autopayEnrollment = data))
                )
              );
            } else {
              payment.autopayEnrollment = null;
            }

            const policy = policies.find((p) => p.number === payment.policyNumber);
            if (!!policy) {
              const { policyPrefix, productCode, riskState, termEffectiveDate } = policy;
              enrollmentSubs.push(
                this.getAutopayInstallmentFeeSavings(
                  policyPrefix,
                  productCode,
                  riskState,
                  termEffectiveDate
                ).pipe(tap((data) => (payment.autopayInstallmentFee = data)))
              );
            }
          });

          return enrollmentSubs.length > 0
            ? zip(...enrollmentSubs).pipe(map(() => sortedPayments))
            : of(sortedPayments);
        })
      );
  }

  private getAutopayEnrollmentData(
    policyNumber: string,
    policyType: PolicyType
  ): Observable<AutoPayEnrollmentResponse> {
    return this.httpService
      .getNamedResource<AutoPayEnrollmentResponse>(AppEndpointsEnum.billingAutopay, {
        params: {
          policyNumber,
          typeCd: PolicyHelper.typeCodeFromEnum(policyType, true),
          sourceSystem: 'PAS',
        },
      })
      .pipe(
        map((res) => res.body || null),
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      );
  }

  private getAutopayInstallmentFeeSavings(
    policyPrefix: string,
    productCode: string,
    riskState: string,
    effectiveDate: string
  ): Observable<InstallmentFee> {
    return this.httpService
      .getNamedResource<InstallmentFee>(AppEndpointsEnum.billingInstallmentFees, {
        params: {
          policyPrefix,
          productCode,
          riskState,
          effectiveDate,
        },
      })
      .pipe(
        map((res) => res.body || null),
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      );
  }

  private addPaymentMethodToWallet(
    token,
    registrationId,
    shortName: string,
    isPreferred: boolean
  ): Observable<any> {
    return this.httpService
      .postNamedResource(AppEndpointsEnum.billingWallet, {
        ownerId: registrationId,
        paymentAccounts: [
          {
            paymentAccountToken: token,
            shortName,
            isPreferred,
          },
        ],
      })
      .pipe(
        map((wallet) => {
          this.store.dispatch(new PaymentAction.ReloadWallet());
          return wallet;
        }),
        catchError((err) => {
          console.error('Error adding new payment account to wallet: ', err);
          return of(token);
        })
      );
  }

  public registerCardPaymentAccount(
    payload: RegisterCardPaymentAccountPayload,
    options: RegisterPaymentAccountOptions
  ): Observable<OneTimePaymentAccount> {
    if (payload.paymentCardExpirationDate) {
      // convert '12/20' to '12-2020'
      const cardExpirationDate = payload.paymentCardExpirationDate
        .split('/')
        .map((v, i) => (i === 1 ? +v + 2000 : v))
        .join('-');
      payload.paymentCardExpirationDate = format(
        endOfMonth(parse(cardExpirationDate, 'MM-yyyy', new Date())),
        'yyyy-MM-dd'
      );
    }
    return this.registerPaymentAccount(payload, options, PaymentAccountType.CARD).pipe(
      map((data) => ({
        token: data.paymentAccountToken,
        cardType: this.cleanType(data.paymentCardType),
        isDebitCard: data.paymentCardSubType === 'Debit',
      }))
    );
  }

  public registerEFTPaymentAccount(
    payload: RegisterEFTPaymentAccountPayload,
    options: RegisterPaymentAccountOptions
  ): Observable<OneTimePaymentAccount> {
    return this.registerPaymentAccount(payload, options, PaymentAccountType.EFT).pipe(
      map((data) => ({
        token: data.paymentAccountToken,
      }))
    );
  }

  private registerPaymentAccount(
    payload: BaseRegisterPaymentAccountPayload,
    options: RegisterPaymentAccountOptions,
    paymentAccountType: PaymentAccountType
  ): Observable<RegisterPaymentAccountResponse> {
    const extraData: BaseRegisterPaymentAccountPayload = {
      corellationId: PaymentService.generateCorrelationId(),
      userId: 'mobile_app_user',
      paymentSourceSystem: 'MOBIAPP',
      paymentAcctFopType: paymentAccountType,
    };

    return this.csaaConfigService.ready().pipe(
      switchMap(() =>
        this.httpService
          .postNamedResource(AppEndpointsEnum.getPaymentAccountToken, {
            ...extraData,
            ...payload,
          })
          .pipe(
            map((res) => res.body),
            switchMap(
              (
                response: RegisterPaymentAccountResponse
              ): Observable<RegisterPaymentAccountResponse> => {
                if (options.registrationId && options.saveForFuture === 'Y') {
                  return this.addPaymentMethodToWallet(
                    response.paymentAccountToken,
                    options.registrationId,
                    options.shortName,
                    options.isPreferred
                  ).pipe(
                    map<RegisterPaymentAccountResponse, RegisterPaymentAccountResponse>(
                      () => response
                    )
                  );
                }
                return of<RegisterPaymentAccountResponse>(response);
              }
            )
          )
      )
    );
  }

  enrollPolicyForAutopay(policy: Policy, paymentAccount: PaymentAccount): Observable<boolean> {
    return this.csaaConfigService.ready().pipe(
      switchMap(() => {
        const { deviceUuid: uuid } = this.store.selectSnapshot(MetadataState);

        const payload = {
          transactionType: 'ENROLL',
          enrollmentEffectiveDate: new Date(Date.now()).toISOString().slice(0, 10),
          policyInfo: {
            policyNumber: policy.number,
            dataSource: 'PAS',
            type: PolicyHelper.typeCodeFromEnum(policy.type, true),
            userId: 'mobile_app_user',
            authenticationChannel: 'ONL',
          },
          paymentItem: {
            paymentMethod: !!paymentAccount.card ? PaymentAccountType.CARD : PaymentAccountType.EFT,
            paymentAccountToken: paymentAccount.paymentAccountToken,
          },
          userDeviceMetadata: { uuid },
        };

        return this.httpService.postNamedResource(AppEndpointsEnum.billingAutopay, payload).pipe(
          map((res) => res.body),
          map(({ status }) => status === 'SUCCESS'),
          switchMap((completed) => {
            if (!completed) {
              return of(false);
            }
            this.store.dispatch(new PaymentAction.UpdateAutoPay(policy.number, true));
            return of(true);
          }),
          tap(() => {
            this.store.dispatch(new PaymentAction.ReloadPayments());
          })
        );
      })
    );
  }

  unEnrollPolicyForAutopay(policy: Policy): Observable<boolean> {
    return this.csaaConfigService.ready().pipe(
      switchMap(() => {
        const { deviceUuid: uuid } = this.store.selectSnapshot(MetadataState);

        const payload = {
          transactionType: 'UNENROLL',
          policyInfo: {
            policyNumber: policy.number,
            dataSource: 'PAS',
            type: PolicyHelper.typeCodeFromEnum(policy.type, true),
            userId: 'mobile_app_user',
            authenticationChannel: 'ONL',
          },
          userDeviceMetadata: { uuid },
        };

        return this.httpService.postNamedResource(AppEndpointsEnum.billingAutopay, payload).pipe(
          map((res) => res.body),
          map(({ status }) => status === 'SUCCESS'),
          switchMap((completed) => {
            if (!completed) {
              return of(false);
            }
            this.store.dispatch(new PaymentAction.UpdateAutoPay(policy.number, false));
            return of(true);
          }),
          tap(() => this.store.dispatch(PaymentAction.ReloadPayments))
        );
      })
    );
  }

  private buildLineItems(payments: UpcomingPayment[]): LineItems[] {
    return payments
      .filter((payment) => payment.amount > 0)
      .map((payment) => ({
        amount: payment.amount.toString(),
        policyInfo: {
          policyNumber: payment.policyNumber,
          prodTypeCode: this.getPolicyTypeString(payment.policyType),
          policyPrefix: payment.policyNumber.slice(0, 2),
        },
      }));
  }

  payAllPolicies(paymentMethod: PaymentAccount, payments: UpcomingPayment[]): Observable<any> {
    const amountBeingPaid = PaymentService.computeAmountBeingPaid(payments).toString();
    const lineItems = this.buildLineItems(payments);
    const { deviceUuid: uuid, clubCode } = this.store.selectSnapshot(MetadataState);
    return this.auth.getUser().pipe(
      take(1),
      switchMap((user) =>
        this.httpService
          .postNamedResource(AppEndpointsEnum.billingPayment, {
            totalAmount: amountBeingPaid,
            hash: (user && user.hash) || '',
            testing: this.sharedService.getPaymentsTesting(), // DONT LEAVE THIS TRUE
            lineItems,
            paymentItem: {
              paymentAccountToken: paymentMethod.paymentAccountToken,
              paymentMethod: paymentMethod.card ? PaymentAccountType.CARD : PaymentAccountType.EFT,
              ...(paymentMethod.card && {
                card: {
                  zipCode: paymentMethod.card.zipCode,
                },
              }),
            },
            userDeviceMetadata: {
              uuid,
            },
            club: clubCode,
          })
          .pipe(map((res) => res.body))
      )
    );
  }

  makePayment(
    paymentMethod: PaymentAccount,
    payment: UpcomingPayment
  ): Observable<MakePaymentResponse> {
    const amountBeingPaid = payment.otherAmount || payment.amount;
    const { deviceUuid: uuid, clubCode } = this.store.selectSnapshot(MetadataState);
    return this.auth.getUser().pipe(
      take(1),
      switchMap((user) => {
        const payload: MakePaymentPayload = {
          totalAmount: amountBeingPaid.toString(),
          hash: (user && user.hash) || '',
          testing: this.sharedService.getPaymentsTesting(), // DONT LEAVE THIS TRUE
          lineItems: [
            {
              amount: amountBeingPaid.toString(),
              policyInfo: {
                policyNumber: payment.policyNumber,
                prodTypeCode: this.getPolicyTypeString(payment.policyType),
                policyPrefix: payment.policyNumber.slice(0, 2),
              },
            },
          ],
          paymentItem: {
            paymentAccountToken: paymentMethod.paymentAccountToken,
            paymentMethod: paymentMethod.card ? PaymentAccountType.CARD : PaymentAccountType.EFT,
            ...(paymentMethod.card && {
              card: {
                zipCode: paymentMethod.card.zipCode,
              },
            }),
          },
          userDeviceMetadata: {
            uuid,
          },
          club: clubCode,
        };
        return this.httpService
          .postNamedResource<MakePaymentResponse>(AppEndpointsEnum.billingPayment, payload)
          .pipe(map(({ body }) => body));
      })
    );
  }

  deletePaymentMethod(
    paymentAccountToken: string,
    ownerId: string,
    walletId: string
  ): Observable<any> {
    const options = {
      ownerId,
      walletId,
      paymentAccounts: [
        {
          paymentAccountToken,
        },
      ],
    };
    return this.httpService.postNamedResource(AppEndpointsEnum.billingWalletDelete, options).pipe(
      map((res) => {
        this.store.dispatch(PaymentAction.ReloadWallet);
        return res.body;
      }),
      catchError((err) => {
        console.error('Error deleting paymentAccount from wallet: ', err);
        return throwError(err);
      })
    );
  }

  private cleanType(type) {
    switch (type) {
      case 'MASTR':
        return 'mastercard';
      case 'AMEX':
        return 'amex';
      case 'VISA':
        return 'visa';
      case 'DISC':
        return 'discover';
      default:
        return type;
    }
  }

  getSavedCards() {
    return [
      {
        number: '1234123412341234',
        expiration: '12/22',
        name: 'John Doe',
        zipCode: '12345',
        nickname: 'Card 1',
        type: 'credit',
        flag: 'mastercard',
      },
      {
        number: '5678567856785678',
        expiration: '08/20',
        name: 'Noah Wright',
        zipCode: '78956',
        nickname: 'Card 2',
        type: 'debit',
        flag: 'visa',
      },
    ];
  }

  validateRoutingNumber(routingNumber: string): Observable<any> {
    return this.httpService
      .getNamedResource<RoutingNumberDetailsResponse>(
        AppEndpointsEnum.billingFinancialInstitution,
        {
          params: {
            routingNumber,
          },
        }
      )
      .pipe(
        map(() => of(true)),
        catchError((res) => {
          if (res.status !== 404) {
            // if the status was not 404 and some other error
            // code we don't want this blocking the validation because the service could just be down
            return of(true);
          } else {
            // 404 so routing number was not found and is not valid
            return of(false);
          }
        })
      );
  }

  private getPolicyTypeString(policyType: PolicyType): string {
    return PolicyHelper.getPolicyTypeString(policyType);
  }

  fetchPaymentHistory(
    policies: Policy[]
  ): Observable<{ history: PaymentHistory; bills: BillState }> {
    const requestBody = {
      billingHistoryPoliciesRequest: policies.map((policy) => ({
        policyNumber: policy.number,
        sourceSystem: 'PAS',
        priorTermCount: 4,
        prodTypeCode: policy.productCode,
      })),
    };
    return this.httpService
      .postNamedResource<PaymentHistoryResponse>(AppEndpointsEnum.billingHistory, requestBody)
      .pipe(
        map((res) => res.body),
        map((result) => {
          const history = policies.reduce(
            (accum, policy) => ({
              ...accum,
              [policy.number]:
                result.billingHistoryPoliciesResponse.find(
                  (policyHistory) => policyHistory.policyNumber === policy.number
                ).payments || [],
            }),
            {}
          );
          const bills = policies.reduce(
            (accum, policy) => ({
              ...accum,
              [policy.number]:
                result.billingHistoryPoliciesResponse
                  .find((policyHistory) => policyHistory.policyNumber === policy.number)
                  .bills.map((b) => ({
                    ...b,
                    policyNumber: policy.number,
                    policyType: policy.type,
                    subtitle: policy.subtitle,
                  })) || [],
            }),
            {}
          );
          return { history, bills };
        }),
        catchError((err) => {
          const empty = policies.reduce(
            ({ history, bills }, policy) => ({
              history: { ...history, [policy.number]: [] },
              bills: { ...bills, [policy.number]: [] },
            }),
            { history: {}, bills: {} }
          );
          const errorWithReporter = new ErrorWithReporter(err);
          errorWithReporter.report();
          return of(empty);
        })
      );
  }

  fetchWalletDetails(ownerId: string): Observable<WalletDetails> {
    let request$: Observable<WalletDetails> = of({
      paymentAccounts: [],
    });
    if (ownerId) {
      request$ = this.httpService
        .getNamedResource<RetrieveWalletDetailResponse>(AppEndpointsEnum.billingWallet, {
          params: { ownerId },
        })
        .pipe(
          map((res) => res.body),
          // THIS IS REALLY IMPORTANT
          catchError((err) => {
            if (getErrorStatus(err) === 404) {
              return of({
                paymentAccounts: [],
              });
            }
            console.error('Error fetching wallet details: ', err);
            return throwError(err);
          })
        );
    }

    return request$.pipe(
      map((w: RetrieveWalletDetailResponse) => {
        w.paymentAccounts = w.paymentAccounts.map((account) => {
          if (account.card) {
            account.card.type = this.cleanType(account.card.type);
            if (account.card.expirationDate) {
              const [year, month] = account.card.expirationDate.split('-');
              account.card.expired = isCardExpired(+year, +month);
            }
          }
          if (account.account && !account.account.bankAccountType) {
            account.account.bankAccountType = account.account.type;
          }
          return account;
        });
        return w;
      }),
      catchError((err) => {
        console.error('Error mapping wallet details response: ', err);
        return throwError(err);
      })
    );
  }
}
