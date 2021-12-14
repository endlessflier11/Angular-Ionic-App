import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SubSink } from '../../shared/subscription.helper';
import { ModalController } from '@ionic/angular';
import { noop } from 'rxjs';
import { PlatformService } from '../../services/platform.service';
import { ConfigService } from '../../services/config/config.service';

export enum CallbackDataSelection {
  save = 'save',
  view = 'view',
  share = 'share',
}

export interface CallbackData {
  selection: CallbackDataSelection;
  fileName?: string;
}
export interface CallbackDataResult {
  selection: CallbackDataSelection;
  filePath?: string;
  completed?: boolean;
  app?: string;
  error?: any;
}
export const DOCUMENT_ACTION_MODAL_ID = 'document-action-modal-id';

@Component({
  selector: 'csaa-document-action-modal',
  templateUrl: './document-action-modal.component.html',
  styleUrls: ['./document-action-modal.component.scss'],
})
export class DocumentActionModalComponent implements OnInit, OnDestroy {
  private static nonWordCharRegex = /[^\w]/;

  @Input() fallbackName;

  public readonly fileNameControl: FormControl = new FormControl('', [Validators.required]);
  private subSink = new SubSink();
  currentTheme: string;

  public get canSave(): boolean {
    return !this.platformService.isIos();
  }

  constructor(
    private readonly modalController: ModalController,
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService
  ) {
    this.currentTheme = this.configService.getTheme();
  }

  private static cleanFileName(name: string): string {
    return name ? name.replace(DocumentActionModalComponent.nonWordCharRegex, '_') : name;
  }

  ngOnInit() {
    this.subSink.add(
      this.fileNameControl.valueChanges.subscribe((v) => {
        if (DocumentActionModalComponent.nonWordCharRegex.test(v)) {
          this.fileNameControl.patchValue(DocumentActionModalComponent.cleanFileName(v));
        }
      })
    );
    this.fileNameControl.patchValue(this.fallbackName);
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  public shareDocHandler(): void {
    this.proceed(CallbackDataSelection.share);
  }

  public viewDocHandler(): void {
    this.proceed(CallbackDataSelection.view);
  }

  public saveDocHandler(): void {
    this.proceed(CallbackDataSelection.save);
  }

  public dismiss(data?: CallbackData): void {
    this.modalController.dismiss(data).then(noop);
  }

  private proceed(selection: CallbackDataSelection): void {
    const data: CallbackData = {
      selection,
    };
    if (selection !== CallbackDataSelection.view) {
      data.fileName = this.getNormalizedFileName();
    }
    this.dismiss(data);
  }

  private getNormalizedFileName(): string {
    return (
      this.fileNameControl.value || DocumentActionModalComponent.cleanFileName(this.fallbackName)
    );
  }
}
