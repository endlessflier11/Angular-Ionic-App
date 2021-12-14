import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Agent } from '../../_core/interfaces/agent.interface';
import { Category, EventName } from '../../_core/interfaces/analytics.interface';
import { DocumentType } from '../../_core/interfaces/document.interface';
import { Coverage, PolicyType } from '../../_core/interfaces/policy.interface';
import { RouterService } from '../../_core/services';
import { AnalyticsService } from '../../_core/services/analytics.service';
import { GlobalStateService } from '../../_core/services/global-state.service';
import { PolicyDocumentHelper } from '../../_core/shared/policy-document.helper';
import { PolicyHelper } from '../../_core/shared/policy.helper';
import { ConfigState } from '../../_core/store/states/config.state';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

@Component({
  selector: 'csaa-indented-coverage-details',
  templateUrl: './indented-coverage-details.page.html',
  styleUrls: ['./indented-coverage-details.page.scss'],
})
export class CsaaIndentedCoveragesDetailsPage implements OnInit, OnDestroy {
  private readonly tearDown$: Subject<any> = new Subject();
  @Output() viewDeclarationClick = new EventEmitter<any>();

  coverage: Coverage;
  title: string;
  policyType: PolicyType;
  policyNumber: string;

  agent: Agent;
  isAndroidPlatform: boolean;
  currentTheme: string;

  constructor(
    private readonly store: Store,
    private readonly analyticsService: AnalyticsService,
    private readonly policyDocumentHelper: PolicyDocumentHelper,
    private readonly platform: Platform,
    private readonly routerService: RouterService,
    private readonly globalStateService: GlobalStateService
  ) {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.isAndroidPlatform = this.platform.is('android');
  }

  ngOnInit() {
    const state = this.globalStateService.getIndentedCoverageDetailsState();
    if (!!state) {
      this.coverage = state.coverage;
      this.agent = state.agent;
      this.policyType = state.policyType;
      this.policyNumber = state.policyNumber;
      this.title = state.title || 'Coverages';

      // Todo: using policyNumber, fetch policy and pass it's riskState to working-hours component
    } else {
      this.routerService.back();
    }
  }

  ngOnDestroy() {
    this.tearDown$.next(true);
    this.tearDown$.complete();
  }

  viewDeclaration() {
    this.analyticsService.trackEvent(EventName.VIEW_DECLARATIONS, Category.documents, {});
    const productType = PolicyHelper.prodTypeFromPolicyType(this.policyType);
    this.policyDocumentHelper.openDocument(
      this.policyNumber,
      productType,
      DocumentType.Declarations
    );
  }

  onClickBack() {
    this.routerService.back();
  }
}
