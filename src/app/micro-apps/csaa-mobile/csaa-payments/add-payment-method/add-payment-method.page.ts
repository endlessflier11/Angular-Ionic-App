import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { noop } from 'rxjs';
import { RouterService } from '../../_core/services';
import { MakePaymentService } from '../_shared/services/make-payment.service';

@Component({
  selector: 'csaa-add-payment-method',
  templateUrl: './add-payment-method.page.html',
  styleUrls: ['./add-payment-method.page.scss'],
})
export class CsaaAddPaymentMethodPage implements OnInit {
  currentTheme: string;

  constructor(
    private readonly store: Store,
    private readonly routerService: RouterService,
    private readonly makePaymentService: MakePaymentService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  ngOnInit() {}

  onClickBackBtn() {
    // this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
    //   event_type: EventType.LINK_ACCESSED,
    //   link: 'Home',
    // });
    const { path, params } = this.makePaymentService.getReturnPathFromAmountMethodPages();
    this.routerService.navigateBack(path, params).then(noop);
  }
}
