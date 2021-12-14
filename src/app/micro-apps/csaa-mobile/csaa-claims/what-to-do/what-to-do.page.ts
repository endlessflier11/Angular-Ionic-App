import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { withErrorReporter } from '../../_core/helpers';
import { unsubscribeIfPresent } from '../../_core/helpers/async.helper';
import { Category, EventName, EventType } from '../../_core/interfaces/analytics.interface';
import { PolicyType } from '../../_core/interfaces/policy.interface';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { CallService } from '../../_core/services/call.service';
import { CameraService, GetPictureError } from '../../_core/services/camera.service';
import { RouterService } from '../../_core/services/router/router.service';
import { ROOT_NAME__INDEX } from '../../constants';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../_core/store/states/config.state';
import { ContactInfoState } from '../../_core/store/states/contact-info.state';

@Component({
  selector: 'csaa-what-to-do.page',
  templateUrl: './what-to-do.page.html',
  styleUrls: ['./what-to-do.page.scss'],
})
export class WhatToDoPage implements OnInit {
  title: string;
  policyType: PolicyType;
  isAndroidPlatform: boolean;
  currentTheme: string;
  backButtonSubscription: Subscription;

  constructor(
    private store: Store,
    private callService: CallService,
    private cameraService: CameraService,
    private alertCtrl: AlertController,
    private analyticsService: AnalyticsService,
    private platform: Platform,
    private route: ActivatedRoute,
    private routerService: RouterService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      withErrorReporter((paramMap) => {
        this.policyType = +paramMap.get('policyType');
        if (this.isPolicyTypeHome) {
          this.title = 'Home Policy';
        } else if (this.isPolicyTypeAuto) {
          this.title = 'Auto Policy';
        }
        this.isAndroidPlatform = this.platform.is('android');
      })
    );
  }

  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.backButtonClick()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  callClaims() {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Contact Claims',
      method: 'phone',
    });
    this.callService.call(this.store.selectSnapshot(ContactInfoState.claimsNumber()));
  }

  call911() {
    this.analyticsService.trackEvent(EventName.CONTACT_INITIATED, Category.claims, {
      event_type: EventType.OPTION_SELECTED,
      selection: 'Call 911',
      method: 'phone',
    });
    this.callService.call(this.store.selectSnapshot(ContactInfoState.emergencyNumber()));
  }

  openCamera() {
    this.analyticsService.trackEvent(EventName.CAMERA_ACCESSED, Category.claims, {
      event_type: EventType.LINK_ACCESSED,
      selection: 'Camera',
    });
    const showAlert = async (header, subHeader) => {
      const alert = await this.alertCtrl.create({
        header,
        subHeader,
        buttons: ['OK'],
      });
      alert.present();
    };

    this.cameraService.getPicture().then(
      () => {
        showAlert(
          'Success',
          'The picture was saved on your device and has not been sent to claims'
        );
      },
      (err: GetPictureError) => showAlert('Error', err.message)
    );
  }

  backButtonClick() {
    if (this.routerService.previousRouteIs(ROOT_NAME__INDEX)) {
      this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
        event_type: EventType.LINK_ACCESSED,
        link: 'Home',
      });
    }
    this.routerService.back();
  }

  get isPolicyTypeHome() {
    return this.policyType === PolicyType.Home;
  }

  get isPolicyTypeAuto() {
    return this.policyType === PolicyType.Auto;
  }

  trackCardToggle(isOpen: boolean, cardName) {
    if (!isOpen) {
      return;
    }
    this.analyticsService.trackEvent(EventName.CARD_EXPANDED, Category.claims, {
      event_type: EventType.UX_MODIFIED,
      card_name: cardName,
    });
  }
}
