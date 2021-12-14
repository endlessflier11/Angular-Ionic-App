import { Component, EventEmitter, Input, Output } from '@angular/core';
import { add, isBefore, parseISO } from 'date-fns';
import { AutoPayEnrollmentResponse, Bill, PolicyType } from '../../../../_core/interfaces';
import { PolicyDocument } from '../../../../_core/interfaces/document.interface';

enum DocumentName {
  INSTALLMENT_BILL = 'Installment Bill',
  AUTOPAY_SCHEDULE = 'Auto Pay Schedule',
}

@Component({
  selector: 'csaa-csaa-bills-card',
  templateUrl: './csaa-bills-card.component.html',
  styleUrls: ['./csaa-bills-card.component.scss'],
})
export class CsaaBillsCardComponent {
  @Input() bills: Bill[] = [];
  @Input() autoPayEnrollmentStatusMap: {
    [policyNumber: string]: AutoPayEnrollmentResponse | null;
  } = {};
  @Input() isPaidInFullStatusMap: { [policyNumber: string]: boolean } = {};
  @Input() availableDocumentsMap: { [policyNumber: string]: PolicyDocument[] } = {};
  @Input() loading = false;
  @Input() timezone: string = undefined;
  @Output() billClick = new EventEmitter<Bill>();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;

  public get relevantBills(): Bill[] {
    // return an array of bills whose process dates are within one calender month
    // and remaining balance is zero
    return this.bills.filter((b) => {
      if (this.hasAutopayEnrolled(b)) {
        return this.hasAutoPayScheduleDocument(b);
      }

      // Wait! Document shown when display condition passes exists?
      // MM-3081: criteria 2 - Installment Bill document exists
      // and (sort by processDate src/app/micro-apps/csaa-mobile/_core/services/policy.service.ts:335)
      const doc = this.getInstallmentBillDocument(b);
      if (
        !doc ||
        // eslint-disable-next-line max-len
        !CsaaBillsCardComponent.isBeforeOneCalendarMonth(parseISO(doc.processDate)) // MM-3081: criteria 3 - safeguard against displaying an outdated bill.
      ) {
        return false;
      }

      return (
        !this.isPaidInFull(b) ||
        CsaaBillsCardComponent.isBeforeOneCalendarMonth(parseISO(b.dueDate)) // MM-3081: criteria 1 - dueDate is withing one calendar month
      );
    });
  }

  private static isBeforeOneCalendarMonth(txnDate: Date): boolean {
    const nextMonth = add(txnDate, { months: 1 });
    return isBefore(new Date(), nextMonth);
  }

  handlePolicyClick(bill: Bill) {
    // TODO: Segment event TBD
    this.billClick.emit(bill);
  }

  public getDocumentProcessDate(bill: Bill): string {
    return this.availableDocumentsMap[bill.policyNumber].find(
      (n) => n.docName === 'Auto Pay Schedule'
    ).processDate;
  }

  private isPaidInFull(bill: Bill): boolean {
    return Boolean(this.isPaidInFullStatusMap[bill.policyNumber]);
  }

  private hasAutopayEnrolled(bill: Bill): boolean {
    return Boolean(this.autoPayEnrollmentStatusMap[bill.policyNumber]?.autoPay);
  }

  private hasAutoPayScheduleDocument(bill: Bill): boolean {
    return this.availableDocumentsMap[bill.policyNumber]?.some(
      (d) => d.docName === DocumentName.AUTOPAY_SCHEDULE
    );
  }

  private getInstallmentBillDocument(bill: Bill): PolicyDocument | null {
    return this.availableDocumentsMap[bill.policyNumber]?.find(
      (d) => d.docName === DocumentName.INSTALLMENT_BILL
    );
  }
}
