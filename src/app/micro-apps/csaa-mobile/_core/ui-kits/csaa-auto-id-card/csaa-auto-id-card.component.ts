import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CustomerSearchResponse, PolicyDriver, Vehicle } from '../../interfaces';
import { StringHelper } from '../../helpers';
import { DatePipe } from '@angular/common';
import { DriverCoverageType } from '../../interfaces/driver.interface';

/**
 * Example usage
 * <csaa-auto-id-card
 *   [policyNumber]="visiblePolicy?.number"
 *   [termEffectiveDate]="visiblePolicy?.termEffectiveDate"
 *   [termExpirationDate]="visiblePolicy?.termExpirationDate"
 *   [insureds]="visiblePolicy?.insureds"
 *   [vehicle]="visiblePolicy?.vehicles[0]"
 *   [riskState]="visiblePolicy?.riskState"
 *   [customerSearch]="customerSearch$ | async"
 *   (toggle)="onIdCardToggle($event)">
 * </csaa-auto-id-card>
 */
@Component({
  selector: 'csaa-auto-id-card',
  templateUrl: 'csaa-auto-id-card.component.html',
  styleUrls: ['csaa-auto-id-card.component.scss'],
})
export class CsaaAutoIdCardComponent implements OnChanges {
  @Input() policyNumber: string;
  @Input() termEffectiveDate: string;
  @Input() termExpirationDate: string;
  @Input() vehicle: Vehicle;
  @Input() insureds: any[];
  @Input() riskState: string;
  @Input() drivers: PolicyDriver[];
  @Input() customerSearch: CustomerSearchResponse;

  @Output() toggle = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/naming-convention

  cardContent = {
    headingLine1: '',
    headingLine2: '',
    headingLine3: '',
    title: '',
    policyNumber: '',
    namedInsureds: [],
    vehicleTitle: '',
    vehicleId: '',
    effectiveDate: '',
    expirationDate: '',
    addressForCustomer1: '',
    addressForCustomer2: '',
    addressForCustomerCity: '',
    addressForCustomerZip: '',
    showSubtitle: false,
    showCustomerAddress: false,
    compliance: '',
    showCompliance: false,
    excludedDrivers: '',
    showExcluded: false,
  };

  constructor(private readonly datePipe: DatePipe) {}

  ngOnChanges(_: SimpleChanges) {
    const insuranceAddress = this.customerSearch.policies.find(
      (p) => p.policyNumber === this.policyNumber
    ).insuranceAddress;

    const COMPANY_TITLE = insuranceAddress?.address1 || '';
    const COMPANY_PO_BOX = insuranceAddress?.address2 || '';
    const NAIC_TEXT = insuranceAddress?.additional.replace('# : ', '#');
    const ZIP_CODE = insuranceAddress?.zipCode || '';
    const STATE = insuranceAddress?.state || '';
    const CITY = insuranceAddress?.city || '';

    const customerAddress = this.customerSearch.customerAddress.address1
      .toLocaleLowerCase()
      .split(' ')
      .map((a) => a.charAt(0).toUpperCase() + a.substring(1))
      .join(' ');

    const customerAddress2 = this.customerSearch?.customerAddress?.address2
      ?.toLocaleLowerCase()
      .split(' ')
      .map((a) => a.charAt(0).toUpperCase() + a.substring(1))
      .join(' ');

    const customerCity = this.customerSearch.customerAddress.city
      .toLocaleLowerCase()
      .split(' ')
      .map((a) => a.charAt(0).toUpperCase() + a.substring(1))
      .join(' ');

    const excludedDrivers = this.drivers
      ?.filter((d) => d.coverageType === DriverCoverageType.Excluded)
      .map((d) => d.fullName)
      .join(', ');

    const show = !!excludedDrivers && this.riskState === 'OK';

    this.cardContent = {
      headingLine1: `${COMPANY_TITLE} / ${NAIC_TEXT}`, // `CSAA General Insurance Company / NAIC # 37770`,
      headingLine2: `${COMPANY_PO_BOX}, ${CITY}, ${STATE} ${ZIP_CODE}`, // PO Box 24511, Oakland, CA 94623-98,
      headingLine3: '800-207-3618',
      title: this.getTitle(), // 'CA Insurance Identification Card',
      policyNumber: this.policyNumber, // 'CAAS123456789',
      namedInsureds: this.getInsuredNames(), // ['John Smith', 'John Smith'],
      vehicleTitle: this.vehicle?.name, // '2011 Volkswagen GTI',
      vehicleId: this.vehicle?.vin, // 'WvWHV71K97W230708',
      effectiveDate: this.datePipe.transform(this.termEffectiveDate, 'MMM dd, yyyy'), // 'Jan 01, 2021',
      expirationDate: this.datePipe.transform(this.termExpirationDate, 'MMM dd, yyyy'), // 'Jan 01, 2022',
      addressForCustomer1: customerAddress,
      addressForCustomer2: customerAddress2,
      addressForCustomerCity: customerCity,
      addressForCustomerZip: this.getZipCode(),
      showSubtitle: this.getShowSubtitle(),
      showCustomerAddress: this.getShowCustomerAddress(),
      compliance: 'This insurance complies with CVC §16056 or §16500.5',
      showCompliance: this.getCaliforniaCompliance(),
      excludedDrivers,
      showExcluded: show,
    };
  }

  private getInsuredNames(): string[] {
    const uc = StringHelper.ucFirst;
    return this.insureds ? this.insureds.map((v) => `${uc(v.firstName)} ${uc(v.lastName)}`) : [];
  }

  private getTitle() {
    switch (true) {
      case this.riskState === 'KY':
        return 'COMMONWEALTH OF KENTUCKY';
      case this.riskState === 'NJ':
        return 'STATE OF NEW JERSEY \n INSURANCE IDENTIFICATION CARD';
      case this.riskState === 'OK':
        return 'OK SECURITY VERIFICATION FORM';
      default:
        return `${this.riskState} Insurance Identification Card`;
    }
  }

  private getZipCode() {
    switch (true) {
      case this.customerSearch.customerAddress.zipCode.length >= 9:
        return this.customerSearch.customerAddress.zipCode.slice(0, 5);
      default:
        return this.customerSearch.customerAddress.zipCode;
    }
  }

  private getShowCustomerAddress(): boolean {
    if (this.riskState === 'NV' || this.riskState === 'NJ') {
      return true;
    }
  }

  private getCaliforniaCompliance(): boolean {
    return this.riskState === 'CA';
  }

  private getShowSubtitle(): boolean {
    return this.riskState === 'KY';
  }
}
