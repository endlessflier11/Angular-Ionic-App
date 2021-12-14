import { Component, Input, OnInit } from '@angular/core';
import { noop } from 'rxjs';
import { Store } from '@ngxs/store';
import { ModalController } from '@ionic/angular';
import { ConfigState } from '../../../_core/store/states/config.state';
import { finalize, map, switchMap } from 'rxjs/operators';
import { CustomerAction, PolicyAction, UserSettingAction } from '../../../_core/store/actions';
import { interactWithLoader } from '../../../_core/operators';
import {
  AppEndpointsEnum,
  Category,
  EventName,
  EventType,
  Policy,
} from '../../../_core/interfaces';
import { AnalyticsService, WebviewService } from '../../../_core/services';
import { UserSettingsState } from '../../store/states/user-setting.state';
import { MetadataState } from '../../store/states/metadata.state';
import { ConfigSelector } from '../../store/selectors';

@Component({
  selector: 'csaa-paperless-terms-modal',
  templateUrl: './paperless-terms-modal.component.html',
  styleUrls: ['./paperless-terms-modal.component.scss'],
})
export class PaperlessTermsModalComponent implements OnInit {
  currentTheme: string;
  email = '';
  loading = false;
  @Input() policy: Policy;

  constructor(
    private readonly store: Store,
    private readonly modalCtrl: ModalController,
    private readonly analyticsService: AnalyticsService,
    private readonly webviewService: WebviewService
  ) {}

  ngOnInit() {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.loading = true;
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() =>
          this.store.dispatch(new UserSettingAction.LoadPolicyPaperlessPreferences())
        ),
        map(() => {
          const paperless = this.store.selectSnapshot(UserSettingsState.paperlessPreferences);
          // 1) If policy is provided, try to get the email associated with the policy
          let email = paperless?.find((p) => p.policyNumber === this.policy?.number)?.email?.email;
          // 2) Or else, try to get any email from paperless preferences
          email = email || paperless?.reduce((e, p) => e || p?.email?.email, '');
          // 3) As a fallback, get the email from user login
          return email || this.store.selectSnapshot(MetadataState)?.email;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((e) => (this.email = e));
  }

  dismissModal(withSuccess?: boolean) {
    this.modalCtrl.dismiss(withSuccess).then(noop);
  }

  acceptClickHandler(): void {
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_ANSWERED, Category.documents, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Accept',
    });
    this.store
      .dispatch(new CustomerAction.AcceptPaperlessTerms())
      .pipe(interactWithLoader())
      .subscribe(() => this.dismissModal(true));
  }

  async openTerms() {
    this.analyticsService.trackEvent(EventName.TERMS_AND_CONDITIONS_CLICKED, Category.documents, {
      event_type: EventType.FILE_DOWNLOADED,
      file: 'Paperless Terms and Conditions',
    });
    // TODO: Adding these cookies is not preventing the user to be redirected
    // const { zipCode, clubCode } = this.store.selectSnapshot(ConfigState);
    // const cookies: CookieJar[] = [
    //   {
    //     domain: '.aaa.com',
    //     name: 'AAAClubCode',
    //     value: `${clubCode}`,
    //   },
    //   {
    //     domain: '.aaa.com',
    //     name: 'AAAZIPCode',
    //     value: `${zipCode}`,
    //   },
    // ];
    const {
      appEndpoints: { endpoints },
    } = this.store.selectSnapshot(ConfigSelector.state);
    const url = endpoints[AppEndpointsEnum[AppEndpointsEnum.paperlessTermsOfUseUrl]];
    await this.webviewService.openWithCookies(url, []);
  }
}
