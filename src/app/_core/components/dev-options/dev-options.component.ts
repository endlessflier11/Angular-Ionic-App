import { AfterContentInit, Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { Store } from '@ngxs/store';
import { combineLatest } from 'rxjs';
import { ConfigState } from '../../../micro-apps/csaa-mobile/_core/store/states/config.state';
import { FormControl } from '@angular/forms';
import { CsaaConfig } from '@csaadigital/mobile-mypolicy';
import { ConfigAction } from '../../../micro-apps/csaa-mobile/_core/store/actions';

@Component({
  selector: 'csaa-dev-options',
  templateUrl: './dev-options.component.html',
  styleUrls: ['./dev-options.component.scss'],
})
export class DevOptionsComponent implements AfterContentInit {
  @Input() codeVersion = 'Loading..';
  @Input() env = 'Loading..';
  @Input() theme = 'Loading..';
  @Output() reloadServiceLocator = new EventEmitter<any>();
  @Output() goBackClubSelection = new EventEmitter<any>();

  public selectInputControl: FormControl = new FormControl('');
  public availableConfigs: CsaaConfig[] = [];

  constructor(private readonly store: Store, private readonly injector: Injector) {}

  ngAfterContentInit(): void {
    this.availableConfigs = this.injector.get(ConfigState).availableConfigs;

    combineLatest([
      this.store.select(ConfigState.configAndEndpointsLoaded),
      this.store.select(ConfigState.activeConfig),
    ]).subscribe(([, activeConfig]) => {
      if (activeConfig.env !== this.selectInputControl.value) {
        this.selectInputControl.patchValue(activeConfig.env);
      }
    });

    this.selectInputControl.valueChanges.subscribe((v) => {
      this.store
        .dispatch(new ConfigAction.SetActiveConfig(v))
        .subscribe(() => this.reloadServiceLocator.emit());
      console.log('New config: ', v, this.store.selectSnapshot(ConfigState.activeConfig));
    });
  }
}
