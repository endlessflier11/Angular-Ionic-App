import { Injectable } from '@angular/core';
import { AlertOptions } from '@ionic/core';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { WebviewService } from './webview/webview.service';
import { from, noop, Observable } from 'rxjs';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { FileDownloadService } from './file-download.service';
import {
  CallbackData,
  CallbackDataResult,
  CallbackDataSelection,
  DOCUMENT_ACTION_MODAL_ID,
  DocumentActionModalComponent,
} from '../ui-kits/document-action-modal/document-action-modal.component';
import { map, mergeMap } from 'rxjs/operators';
import { Share, ShareOptions, ShareResult } from '@capacitor/share';
import { PolicyDocument, PolicyDocumentType } from '../interfaces/document.interface';
import { PolicyState } from '../store/states/policy.state';
import { PolicyAction } from '../store/actions';
import { interactWithLoader } from '../operators';
import { ErrorWithReporter, withErrorReporter } from '../helpers';
import { Store } from '@ngxs/store';
import { AppEndpointsEnum, Category, EventName, EventType, Policy } from '../interfaces';
import { AnalyticsService } from './analytics.service';
import { UniHttpErrorResponse } from './http/uni-http.model';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: CsaaCommonModule,
})
export class PdfDisplayService {
  private static defaultDocName = 'document';
  private readonly isIos: boolean;

  constructor(
    private readonly webviewService: WebviewService,
    private readonly fileOpener: FileOpener,
    private readonly platform: Platform,
    private readonly fileDownloadService: FileDownloadService,
    private readonly modalController: ModalController,
    private alertController: AlertController,
    private readonly store: Store,
    private readonly analyticsService: AnalyticsService,
    private readonly httpService: HttpService
  ) {
    this.isIos = this.platform.is('ios');
  }

  public accessPdfDocument(
    url: string,
    mode: keyof typeof CallbackDataSelection,
    saveFileAs: string = PdfDisplayService.defaultDocName
  ): Observable<CallbackDataResult> {
    switch (mode) {
      case 'save':
        return this.savePdfHandler(url, saveFileAs);
      case 'share':
        return this.sharePdfHandler(url);
      case 'view':
        return this.viewPdfHandler(url);
    }
  }

  openPdf(url: string) {
    if (this.isIos) {
      return this.webviewService.open(url, null, false);
    }
    return this.fileOpener.open(url, 'application/pdf').then(noop);
  }

  public showDocumentErrorAlert(options: AlertOptions = {}): void {
    this.alertController
      .create({
        header: 'Unable to load document',
        message:
          'Oops! An error occurred when trying to load your document. Please try again. If the issue persists, please give us a call.',
        buttons: ['Close'],
        ...options,
      })
      .then((alert) => alert.present());
  }

  showDocumentOptions(policyDocument: PolicyDocument) {
    const policy = this.store.selectSnapshot(PolicyState.policyData(policyDocument.policyNumber));
    this.trackEvent(EventName.DOCUMENT_SELECTED, EventType.OPTION_SELECTED, policyDocument, policy);

    this.showDocumentActionPrompt(policyDocument.docName).subscribe(({ selection, fileName }) => {
      this.store
        .dispatch(new PolicyAction.RefreshActiveDocument(policy.number, policyDocument))
        .pipe(
          mergeMap(() => {
            const externalURI = this.store.selectSnapshot(PolicyState.activeDocumentUri);
            const url = this.httpService.getCompiledUrl(AppEndpointsEnum.policyDocumentBaseUrl, {
              routeParams: { externalURI },
            });
            return this.accessPdfDocument(url, selection, fileName).pipe(interactWithLoader());
          })
        )
        .subscribe(
          withErrorReporter(
            (result) => {
              this.onActionSuccess(policy, policyDocument, selection, result);
            },
            (error) => this.onActionFailed(policy, policyDocument, error)
          )
        );
    });
  }

  /**
   * Manage appropriate Analytics Events on successful access to Pdf Document
   *
   * @param policy
   * @param policyDocument
   * @param selection
   * @param result
   */
  public onActionSuccess(
    policy: Policy,
    policyDocument: PolicyDocument,
    selection: CallbackDataSelection,
    result: CallbackDataResult
  ) {
    if (selection === CallbackDataSelection.view || selection === CallbackDataSelection.save) {
      const isViewing = selection === CallbackDataSelection.view;
      const eventName = isViewing ? EventName.DOCUMENT_VIEWED : EventName.DOCUMENT_SAVED;
      const eventType = isViewing ? EventType.AUTOMATED_SYSTEM_PROCESS : EventType.FILE_DOWNLOADED;
      this.trackEvent(eventName, eventType, policyDocument, policy);

      if (selection === CallbackDataSelection.save) {
        this.showDocumentSavedAlert(result.filePath);
      }
    } else {
      // On IOS, track save event from social sharing plugin response
      if (result?.completed && this.platform.is('ios') && result?.app?.indexOf('SaveTo') >= 0) {
        this.trackEvent(
          EventName.DOCUMENT_SAVED,
          EventType.FILE_DOWNLOADED,
          policyDocument,
          policy
        );
      }
    }
  }

  /**
   * Handle message and events on action failed
   *
   * @param policy
   * @param policyDocument
   * @param error
   */
  public onActionFailed(policy: Policy, policyDocument: PolicyDocument, error: ErrorWithReporter) {
    let options: AlertOptions = {};
    console.log('[CSAA:Error] Sharing document', { error });
    const cause = error.getOriginalError();
    if (cause instanceof UniHttpErrorResponse) {
      const originalError: UniHttpErrorResponse = error.getOriginalError();
      if (originalError.isNetworkError) {
        options = {
          header: 'Connection Failed',
          message:
            'We were unable to load the requested document at this time. Please check your connection and try again.',
        };
      }
    }
    if (cause?.selection === CallbackDataSelection.share && !cause?.completed) {
      const errorMessage = cause?.error?.errorMessage || cause?.error?.message;
      if (errorMessage === 'Share canceled') {
        return;
      }
      options = {
        header: 'Sharing failed',
        message: errorMessage || 'Sharing did not complete',
      };
    }

    this.showDocumentErrorAlert(options);
    this.trackEvent(EventName.ERROR_NOTIFICATION, EventType.MESSAGED, policyDocument, policy);
    error.report();
  }

  public showDocumentActionPrompt(documentTitle?: string): Observable<CallbackData> {
    return new Observable<any>((subscriber) => {
      (async () => {
        const modal = await this.modalController.create({
          id: DOCUMENT_ACTION_MODAL_ID,
          component: DocumentActionModalComponent,
          componentProps: {
            fallbackName: documentTitle,
          },
          cssClass: 'action-sheet-modal-wrapper document-actions',
          backdropDismiss: false,
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data !== undefined) {
          subscriber.next(data);
        }
        subscriber.complete();
      })();
    });
  }

  private viewPdfHandler(url: string): Observable<CallbackDataResult> {
    if (!url || url.trim().length === 0) {
      throw new Error('Provided url is blank');
    }

    return this.fileDownloadService
      .download(url, `${PdfDisplayService.defaultDocName}.pdf`)
      .pipe(
        mergeMap((filePath) =>
          from(
            this.isIos
              ? this.webviewService.open(url)
              : this.fileOpener.open(filePath, 'application/pdf')
          ).pipe(map(() => ({ selection: CallbackDataSelection.view, filePath, completed: true })))
        )
      );
  }

  private savePdfHandler(url: string, fileName: string): Observable<CallbackDataResult> {
    const normalizedName = fileName.replace(/\.pdf$/i, '') + '.pdf';
    return this.fileDownloadService
      .download(url, normalizedName)
      .pipe(
        map((filePath) => ({ selection: CallbackDataSelection.save, completed: true, filePath }))
      );
  }

  private sharePdfHandler(url: string): Observable<CallbackDataResult> {
    return this.savePdfHandler(url, PdfDisplayService.defaultDocName).pipe(
      mergeMap(({ filePath }) => {
        const options: ShareOptions = {
          dialogTitle: 'Share ' + PdfDisplayService.defaultDocName,
          url: filePath,
        };
        const onSuccess = function (shareResult: ShareResult) {
          console.log('Share completed: ' + shareResult);
          return Promise.resolve<CallbackDataResult>({
            selection: CallbackDataSelection.share,
            filePath,
            completed: true,
            app: shareResult.activityType === undefined ? 'web' : shareResult.activityType,
          });
        };

        const onError = function (msg) {
          console.log('Sharing failed with message: ' + msg);
          return Promise.reject<CallbackDataResult>({
            selection: CallbackDataSelection.share,
            completed: false,
            error: msg,
          });
        };

        return from(Share.share(options).then(onSuccess, onError));
      })
    );
  }

  private showDocumentSavedAlert(filePath: string): void {
    this.alertController
      .create({
        header: 'Success!',
        message: `Document saved!`,
        buttons: [
          'Close',
          {
            text: 'Open',
            handler: () => {
              this.openPdf(filePath).then(noop);
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  private trackEvent(
    eventName: EventName,
    eventType: EventType,
    policyDocument: PolicyDocument,
    policy: Policy
  ) {
    this.analyticsService.trackEvent(eventName, Category.documents, {
      event_type: eventType,
      selection: policyDocument.docName,
      document_category: policyDocument.category,
      document_type: PolicyDocumentType[policyDocument.docType],
      document_name: policyDocument.docName,
      document_effective: policyDocument.current ? 'current' : 'archive',
      process_date: policyDocument.processDate,
      ...AnalyticsService.mapPolicy(policy),
    });
  }
}
