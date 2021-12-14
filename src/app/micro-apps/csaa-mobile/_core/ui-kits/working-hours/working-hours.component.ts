import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HoursOfOperation, StateContactInfo } from '../../interfaces/phone-numbers.interface';
import { AnalyticsService, CallService } from '../../services';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { ContactInfoState } from '../../store/states/contact-info.state';
import { takeUntil } from 'rxjs/operators';
import { Category, EventName, EventType } from '../../interfaces';
import { FetchState } from '../../store/states/fetch.state';
import { ContactInfoAction } from '../../store/actions/contact-info.actions';
import { fetchIsLoadingFor } from '../../helpers';

enum ServiceType {
  CLAIMS = 'CLAIMS',
  CUSTOMER = 'CUSTOMER',
  EMERGENCY = 'EMERGENCY',
}

@Component({
  selector: 'csaa-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss'],
})
export class WorkingHoursComponent implements OnInit, OnDestroy {
  private readonly tearDown$: Subject<any> = new Subject();

  @Output() callClicked = new EventEmitter<StateContactInfo>();
  @Input() riskState?: string;
  @Input() serviceType: keyof typeof ServiceType;
  @Input() title? = 'Service Hours';
  @Input() label? = 'Call Service';

  @Select(FetchState.isLoading(ContactInfoAction.LoadContacts)) isLoading$: Observable<boolean>;
  @Select(FetchState.needsFetching(ContactInfoAction.LoadContacts))
  needsFetching: Observable<boolean>;

  public showLoader$: Observable<boolean>;
  hidden = true;

  public stateContactInfo: StateContactInfo;
  public get hoursOfOperation(): HoursOfOperation[] {
    switch (this.serviceType) {
      case ServiceType.CLAIMS:
        return this.stateContactInfo.claimsHoursOfOperation;
      case ServiceType.CUSTOMER:
        return this.stateContactInfo.customerServiceHoursOfOperation;
      case ServiceType.EMERGENCY:
      default:
        return [];
    }
  }
  public get phoneNumber(): string {
    switch (this.serviceType) {
      case ServiceType.CLAIMS:
        return this.stateContactInfo.claims;
      case ServiceType.CUSTOMER:
        return this.stateContactInfo.customerService;
      case ServiceType.EMERGENCY:
      default:
        return this.stateContactInfo.emergencyNumber;
    }
  }

  constructor(
    private readonly store: Store,
    private readonly callService: CallService,
    private readonly analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.showLoader$ = fetchIsLoadingFor(this.store, [this.isLoading$, this.needsFetching]);
    this.store
      .select(ContactInfoState.stateContactInfo(this.riskState))
      .pipe(takeUntil(this.tearDown$))
      .subscribe((contactInfo) => {
        this.stateContactInfo = contactInfo;
      });
  }

  ngOnDestroy(): void {
    this.tearDown$.next(true);
    this.tearDown$.complete();
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  toggle() {
    this.hidden = !this.hidden;
  }

  onOverlayClick($event) {
    $event.stopPropagation();
    $event.preventDefault();
    this.hide();
  }

  onCallClicked($event) {
    $event.stopPropagation();
    $event.preventDefault();
    this.callClicked.emit(this.stateContactInfo);
    this.trackContactInitiatedEvent();
    this.callService.call(this.phoneNumber);
    this.hide();
  }

  private trackContactInitiatedEvent(): void {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.global, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Call Service',
      method: 'phone',
    });
  }
}
