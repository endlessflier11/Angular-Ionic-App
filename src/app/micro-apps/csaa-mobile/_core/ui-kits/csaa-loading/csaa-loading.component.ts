import { Component, Input } from '@angular/core';

@Component({
  selector: 'csaa-loading',
  templateUrl: './csaa-loading.component.html',
  styleUrls: ['./csaa-loading.component.scss'],
})
export class CsaaLoadingComponent {
  @Input()
  visible = false;
}
