import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { AlertController, Platform } from '@ionic/angular';
import { from, Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { PolicyService } from '../services/policy.service';
import { MetadataService } from '../services/metadata.service';
import { PdfDisplayService } from '../services/pdf-display.service';
import { FileDownloadService } from '../services/file-download.service';
import { HttpService } from '../services/http/http.service';
import { DocumentType, PolicyDocument, ProductType } from '../interfaces/document.interface';
import { ErrorWithReporter, getErrorReason, withErrorReporter } from '../helpers';
import { interactWithLoader } from '../operators';
import { ContactInfoState } from '../store/states/contact-info.state';
import { PolicyState } from '../store/states/policy.state';
import { ConfigSelector } from '../store/selectors';
import { AppEndpointsEnum } from '../interfaces';

@Injectable({ providedIn: CsaaCommonModule })
export class PolicyDocumentHelper {
  constructor(
    private readonly store: Store,
    private alertCtrl: AlertController,
    private pdfDisplayService: PdfDisplayService,
    private policyService: PolicyService,
    private fileDownloadService: FileDownloadService,
    private httpClient: HttpClient,
    private platform: Platform,
    private metadataService: MetadataService,
    private httpService: HttpService
  ) {}

  async openDocument(policyNumber: string, productType: ProductType, documentType: DocumentType) {
    this.policyService
      .getPolicyDocument(policyNumber, productType, documentType)
      .pipe(
        switchMap(({ externalURI }: PolicyDocument): Observable<string> => {
          const url = this.httpService.getCompiledUrl(AppEndpointsEnum.policyDocumentBaseUrl, {
            routeParams: { externalURI },
          });
          if (this.platform.is('android')) {
            const documentName = `${documentType}_${policyNumber}.pdf`;
            return this.downloadFile(url, documentName);
          }
          return of(url);
        }),
        interactWithLoader()
      )
      .subscribe(
        withErrorReporter(
          async (url: string) => {
            // setTimeout(() => {
            try {
              await this.pdfDisplayService.openPdf(url);
            } catch (error) {
              this.handleDownloadError(new ErrorWithReporter(error), policyNumber);
            }
            // }, 0); // setTimeout suppresses errors, if there isn't a good reason for this then we should remove
          },
          (error) => this.handleDownloadError(error, policyNumber)
        )
      );
  }

  public downloadFile(url: string, documentName: string): Observable<string> {
    return this.httpClient
      .get<Blob>(url, {
        responseType: 'blob' as 'json',
        headers: new HttpHeaders({
          'X-ApplicationContext': JSON.stringify(
            this.metadataService.getApplicationContextMetadata()
          ),
          'x-api-key': this.store.selectSnapshot(ConfigSelector.state)?.activeConfigData?.apiKey,
        }),
      })
      .pipe(
        switchMap((blob) => from(this.fileDownloadService.storeBlob(blob, documentName))),
        map((filePath) => filePath.nativeURL)
      );
  }

  public async displayFileDownloadError(policyNumber: string) {
    const policy = this.store.selectSnapshot(PolicyState.policyData(policyNumber));

    const servicePhoneNumber = this.store.selectSnapshot(
      ContactInfoState.serviceNumber(policy.riskState)
    );
    const alert = await this.alertCtrl.create({
      header: 'No File Found',
      message: `We could not download the file for this policy number. Please contact Service for assistance, <a href='tel://${encodeURI(
        servicePhoneNumber
      )}'>${servicePhoneNumber}</a>.`,
      buttons: ['OK'],
    });
    return alert.present();
  }

  private handleDownloadError(error, policyNumber) {
    console.log('CSAA: Policy Document', getErrorReason(error.getOriginalError()));
    this.displayFileDownloadError(policyNumber);
    error.report();
  }
}
