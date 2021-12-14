import { Component, OnInit } from '@angular/core';
import { RouterService } from '../../_core/services';
import { noop } from 'rxjs';

@Component({
  selector: 'csaa-paperless-preference-card',
  templateUrl: './paperless-preference-card.component.html',
  styleUrls: ['./paperless-preference-card.component.scss'],
})
export class PaperlessPreferenceCardComponent implements OnInit {
  constructor(private readonly routerService: RouterService) {}

  ngOnInit() {}

  public navigateToPreference(): void {
    this.routerService.navigateForward('csaa.paperless.index').then(noop);
  }
}
