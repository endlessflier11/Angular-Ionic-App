import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, noop, Observable, Subscription } from 'rxjs';
import { unsubscribeIfPresent, withErrorReporter } from '../../_core/helpers';
import { AppEndpointsEnum, Category, EventName, EventType, Policy } from '../../_core/interfaces';
import { PolicyDocument, PolicyDocumentType } from '../../_core/interfaces/document.interface';
import {
  AnalyticsService,
  ConfigService,
  HttpService,
  PdfDisplayService,
  RouterService,
} from '../../_core/services';
import { Select, Store } from '@ngxs/store';
import { PolicyState } from '../../_core/store/states/policy.state';
import { CustomerAction, PolicyAction } from '../../_core/store/actions';
import { finalize, map, mergeMap, switchMap } from 'rxjs/operators';
import { FetchState } from '../../_core/store/states/fetch.state';
import { interactWithLoader } from '../../_core/operators';
import { IonRefresher, ModalController, Platform } from '@ionic/angular';
import { DocumentModalComponent } from '../document-modal/document-modal.component';
import { DOCUMENT_ACTION_MODAL_ID } from '../../_core/ui-kits/document-action-modal/document-action-modal.component';
import { ConfigSelector } from '../../_core/store/selectors';

const ITEM_LIMIT = 50;

@Component({
  selector: 'csaa-csaa-documents-page',
  templateUrl: './csaa-documents-page.component.html',
  styleUrls: ['./csaa-documents-page.component.scss'],
})
export class CsaaDocumentsPageComponent implements OnInit {
  @Select(FetchState.isLoading(PolicyAction.RefreshActiveDocument))
  refreshingUri$: Observable<boolean>;
  policy$: Observable<Policy>;
  documents$: Observable<PolicyDocument[]>;
  limitedDocuments$: Observable<PolicyDocument[]>;
  activeFilter$: BehaviorSubject<string> = new BehaviorSubject('all_documents');
  filterBy: any;

  currentTheme: string;
  policyNumber: string;
  currentFilter: string;
  loading = false;
  backButtonSubscription: Subscription;
  currentLimit$ = new BehaviorSubject(ITEM_LIMIT);
  viewArchive$ = new BehaviorSubject(false);

  public toggleControlValue = false;
  private refresher: IonRefresher;

  constructor(
    private analyticsService: AnalyticsService,
    private configService: ConfigService,
    private routerService: RouterService,
    private route: ActivatedRoute,
    private store: Store,
    private platform: Platform,
    private pdfDisplayService: PdfDisplayService,
    private modalCtrl: ModalController
  ) {
    this.loading = true;
    this.currentTheme = this.configService.getTheme();
  }
  ionViewWillEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () =>
      this.backButtonClick()
    );
  }

  ionViewWillLeave() {
    unsubscribeIfPresent(this.backButtonSubscription);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      withErrorReporter((paramMap) => {
        this.policyNumber = paramMap.get('policyNumber');
        this.policy$ = this.store.select(PolicyState.policyData(this.policyNumber));
        this.documents$ = combineLatest([
          this.store.select(PolicyState.documentsForPolicy(this.policyNumber)),
          this.activeFilter$,
          this.viewArchive$,
        ]).pipe(
          map(([documents, filterBy, viewArchive]) =>
            this.applyActiveFilter(documents, filterBy, viewArchive)
          )
        );
        this.limitedDocuments$ = combineLatest([this.documents$, this.currentLimit$]).pipe(
          map(([documents, currentLimit]) => documents.slice(0, currentLimit))
        );
        this.dispatchLoadAction();
      })
    );
  }

  documentsRefresh(event) {
    this.loading = true;
    this.refresher = event.target;
    this.dispatchReloadAction();
  }

  applyActiveFilter(documents: PolicyDocument[], filterBy: string, viewArchive: boolean) {
    const currentDocuments = documents.filter(
      (d) => (d.current && !viewArchive) || (!d.current && viewArchive)
    );

    if (filterBy === 'all_documents') {
      return currentDocuments;
    } else if (filterBy === 'billing_&_payments') {
      return currentDocuments.filter((d) => d.category === 'Billing & Payments');
    } else if (filterBy === 'policy_documents') {
      return currentDocuments.filter((d) => d.category === 'Policy Documents');
    }
    return currentDocuments.filter((d) => d.docType === filterBy);
  }

  getFilterLabel(filterBy: string) {
    if (filterBy === 'all_documents') {
      return 'All Documents';
    } else if (filterBy === 'billing_&_payments') {
      return 'Billing & Payments';
    } else if (filterBy === 'policy_documents') {
      return 'Policy Documents';
    }
    return PolicyDocumentType[filterBy];
  }

  clickDocumentsForPdf(policyDocument: PolicyDocument) {
    const policy = this.store.selectSnapshot(PolicyState.policyData(this.policyNumber));
    this.pdfDisplayService
      .showDocumentActionPrompt(policyDocument.docName)
      .subscribe(({ selection, fileName }) => {
        this.store
          .dispatch(new PolicyAction.RefreshActiveDocument(this.policyNumber, policyDocument))
          .pipe(
            mergeMap(() => {
              const externalURI = this.store.selectSnapshot(PolicyState.activeDocumentUri);
              const {
                appEndpoints: { endpoints },
              } = this.store.selectSnapshot(ConfigSelector.state);

              // We can add a property to suggest whether user choose to save only or to view in addition
              this.analyticsService.trackEvent(EventName.DOCUMENT_SELECTED, Category.documents, {
                event_type: EventType.OPTION_SELECTED,
                selection: policyDocument.docName,
                document_category: policyDocument.category,
                document_type: PolicyDocumentType[policyDocument.docType],
                document_name: policyDocument.docName,
                document_effective: policyDocument.current ? 'current' : 'archive',
                process_date: policyDocument.processDate,
                ...AnalyticsService.mapPolicy(policy),
              });

              const url = HttpService.compileUrlWithParams(
                endpoints[AppEndpointsEnum[AppEndpointsEnum.policyDocumentBaseUrl]],
                { externalURI }
              );
              return this.pdfDisplayService
                .accessPdfDocument(url, selection, fileName)
                .pipe(interactWithLoader());
            })
          )
          .subscribe(
            withErrorReporter(
              (result) => {
                this.pdfDisplayService.onActionSuccess(policy, policyDocument, selection, result);
              },
              (error) => {
                this.pdfDisplayService.onActionFailed(policy, policyDocument, error);
              }
            )
          );
      });
  }

  backButtonClick() {
    this.analyticsService.trackEvent(EventName.HOME_ACCESSED, Category.global, {
      event_type: EventType.LINK_ACCESSED,
      link: 'Home',
    });
    this.modalCtrl.dismiss(undefined, undefined, DOCUMENT_ACTION_MODAL_ID).catch(noop).then(noop);
    this.routerService.back();
  }

  private dispatchLoadAction() {
    this.loading = true;
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() =>
          this.store.dispatch(new PolicyAction.LoadPolicyDocuments(this.policyNumber))
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  private dispatchReloadAction() {
    this.loading = true;
    this.store
      .dispatch(new CustomerAction.LoadCustomer())
      .pipe(
        switchMap(() => this.store.dispatch(new PolicyAction.LoadPolicies())),
        switchMap(() =>
          this.store.dispatch(new PolicyAction.ReloadPolicyDocuments(this.policyNumber))
        ),
        finalize(() => this.completeLoading())
      )
      .subscribe(withErrorReporter());
  }

  private completeLoading() {
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete().then(noop);
    }
  }

  async openModal() {
    const policy = this.store.selectSnapshot(PolicyState.policyData(this.policyNumber));
    const docTypes = new Set(
      this.store
        .selectSnapshot(PolicyState.documentsForPolicy(this.policyNumber))
        .filter((d) => (this.viewArchive$.getValue() ? !d.current : d.current))
        .map((d) => d.docType)
    );

    const modal = await this.modalCtrl.create({
      component: DocumentModalComponent,
      componentProps: {
        currentFilter: Array.from(docTypes),
        policyType: policy.type,
        activeFilter: this.activeFilter$.getValue(),
      },
    });

    modal.onWillDismiss().then((docTypeReturned) => {
      if (docTypeReturned?.data) {
        this.activeFilter$.next(docTypeReturned.data);
        this.currentLimit$.next(ITEM_LIMIT);
      }
    });

    await modal.present();
  }

  showMore() {
    this.currentLimit$.next(this.currentLimit$.getValue() + ITEM_LIMIT);
  }

  viewArchiveChanged(event) {
    this.viewArchive$.next(event?.detail?.checked);
    this.currentLimit$.next(ITEM_LIMIT);
  }
}
