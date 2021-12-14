import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ThemeIconComponent } from './theme-icon/theme-icon.component';
import { WorkingHoursComponent } from './working-hours/working-hours.component';
import { MyPolicyCardComponent } from './my-policy-card/my-policy-card.component';
import { SkeletonCardComponent } from './skeleton-card/skeleton-card.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { PhonePipe } from './pipes/phone-number.pipe';
import { CsaaAutoIdCardComponent } from './csaa-auto-id-card/csaa-auto-id-card.component';
import { CsaaLoadingComponent } from './csaa-loading/csaa-loading.component';
import { ContentRendererComponent } from './content-renderer/content-renderer.component';
import { NationalCustomAlertModalComponent } from './national-custom-alert/national-custom-alert-modal';
import { SafeDataPipe } from './pipes/safe-data/safe-data.pipe';
import { DocumentActionModalComponent } from './document-action-modal/document-action-modal.component';
import { CsaaPolicySubtitlesComponent } from './csaa-policy-subtitles/csaa-policy-subtitles.component';
import { PaperlessTermsComponent } from './paperless-terms/paperless-terms.component';
import { PaperlessTermsModalComponent } from './paperless-terms-modal/paperless-terms-modal.component';
import { AppleWalletButtonComponent } from './apple-wallet-button/apple-wallet-button.component';

const UI_COMPONENTS = [
  ThemeIconComponent,
  WorkingHoursComponent,
  MyPolicyCardComponent,
  SkeletonCardComponent,
  BackButtonComponent,
  CsaaAutoIdCardComponent,
  CsaaLoadingComponent,
  ContentRendererComponent,
  NationalCustomAlertModalComponent,
  DocumentActionModalComponent,
  CsaaPolicySubtitlesComponent,
  PaperlessTermsComponent,
  PaperlessTermsModalComponent,
  AppleWalletButtonComponent,
];

const UI_PIPES = [PhonePipe, SafeDataPipe];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  declarations: [...UI_COMPONENTS, ...UI_PIPES],
  exports: [...UI_COMPONENTS, ...UI_PIPES],
  providers: [DatePipe],
})
export class UiKitsModule {}
