import { Component } from '@angular/core';
import { CsaaDriversCoveragesContentV1Component } from '../csaa-drivers-coverages-content-v1/csaa-drivers-coverages-content-v1.component';

@Component({
  selector: 'csaa-csaa-drivers-coverages-content-v2',
  templateUrl: './csaa-drivers-coverages-content-v2.component.html',
  styleUrls: ['./csaa-drivers-coverages-content-v2.component.scss'],
})
export class CsaaDriversCoveragesContentV2Component extends CsaaDriversCoveragesContentV1Component {
  protected ignoreItemClick(): boolean {
    return false;
  }
}
