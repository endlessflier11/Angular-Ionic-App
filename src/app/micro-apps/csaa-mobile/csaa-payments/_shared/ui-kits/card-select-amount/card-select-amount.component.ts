import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentType, UpcomingPayment } from '../../../../_core/interfaces';
import { PlatformService } from '../../../../_core/services/platform.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubSink } from '../../../../_core/shared/subscription.helper';

@Component({
  selector: 'csaa-card-select-amount',
  templateUrl: './card-select-amount.component.html',
  styleUrls: ['./card-select-amount.component.scss'],
})
export class CardSelectAmountComponent implements OnInit, OnDestroy {
  @Input() payment: UpcomingPayment;
  @Input() allowOtherAmount = true;

  @Input() amountSelected: PaymentType;
  @Output() amountSelectedChange = new EventEmitter<PaymentType>();

  @Output() selectionChange = new EventEmitter<{ selection: PaymentType; value: number }>();
  isIos: boolean;
  amountForm: FormGroup;
  subsink = new SubSink();

  public get otherAmountMaskConfig() {
    return {
      money: true,
      numberAndTousand: true,
      thousand: ',',
      decimal: 2,
      decimalCaracter: '.',
    };
  }

  constructor(
    private readonly platformService: PlatformService,
    private readonly formBuilder: FormBuilder
  ) {
    this.isIos = this.platformService.isIos();
    this.amountForm = this.formBuilder.group({
      otherAmount: [''],
    });
  }

  ngOnInit(): void {
    this.subsink.add(
      this.amountForm.valueChanges.subscribe((v) => {
        console.log('value changes', { v });
        this.selectionChange.emit({
          selection: this.amountSelected,
          value: this.getValue(this.amountSelected),
        });
      })
    );
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

  onAmountChange(event) {
    this.amountSelected = event?.detail?.value;
    this.amountSelectedChange.emit(this.amountSelected);
    this.selectionChange.emit({
      selection: this.amountSelected,
      value: this.getValue(this.amountSelected),
    });
  }

  private getValue(amountSelected: PaymentType) {
    switch (amountSelected) {
      case PaymentType.minimum:
        return this.payment.minimumAmount;
      case PaymentType.remaining:
        return this.payment.remainingPremium;
      case PaymentType.other:
        return this.otherAmount;
      default:
        return 0;
    }
  }

  get otherAmount() {
    const { otherAmount } = this.amountForm.controls;
    return parseFloat(otherAmount && otherAmount.value ? otherAmount.value.replace(/,/, '') : 0);
  }
}
