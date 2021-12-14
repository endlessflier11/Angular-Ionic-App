import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

export enum NationalCustomAlertModalAction {
  Login = 'login',
  Call = 'call',
  Cancel = 'cancel',
}

@Component({
  selector: 'csaa-national-custom-alert-modal',
  templateUrl: 'national-custom-alert-modal.html',
  styleUrls: ['national-custom-alert-modal.scss'],
})
export class NationalCustomAlertModalComponent {
  @Input() headerText: string;
  @Input() messageText: string;
  @Input() buttonText: string;
  @Input() showLoginOption: boolean;
  @Input() phoneMessage: string;

  public constructor(private modalCtrl: ModalController) {}

  public onCancel(): void {
    this.modalCtrl.dismiss({
      role: NationalCustomAlertModalAction.Cancel,
    });
  }

  public onCallAAA(): void {
    window.location.href = 'tel://800-222-4357';
    this.modalCtrl.dismiss({
      role: NationalCustomAlertModalAction.Call,
    });
  }

  public onLogin(): void {
    this.modalCtrl.dismiss({
      role: NationalCustomAlertModalAction.Login,
    });
  }
}
