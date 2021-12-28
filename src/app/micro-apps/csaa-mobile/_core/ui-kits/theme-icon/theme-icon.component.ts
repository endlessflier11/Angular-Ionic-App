import { Component, Input, OnInit } from '@angular/core';
import { PolicyType } from '../../interfaces/policy.interface';
import { ConfigService, CsaaTheme } from '../../services';

const PATH_TO_VECTOR = '/assets/csaa-mobile/vectors';

@Component({
  selector: 'csaa-theme-icon',
  templateUrl: './theme-icon.component.html',
  styleUrls: ['./theme-icon.component.scss'],
})
export class ThemeIconComponent implements OnInit {
  @Input() name: any;
  @Input() type: any;
  @Input() size = 25;
  @Input() svgFileName: string;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  PolicyType = PolicyType;
  prefix = '';

  constructor(private readonly configService: ConfigService) {}

  ngOnInit() {
    const theme = this.configService.getTheme();
    if (theme !== CsaaTheme.DEFAULT) {
      this.prefix = `${theme}/`;
    }
  }

  get sourcePath() {
    if (this.name) {
      return `${PATH_TO_VECTOR}/${this.prefix}icn-${this.name}.svg`;
    } else if (PolicyType[this.type]) {
      return `${PATH_TO_VECTOR}/${this.prefix}icn-${PolicyType[this.type]}.svg`;
    } else if (this.svgFileName) {
      return `${PATH_TO_VECTOR}/${this.svgFileName}.svg`;
    }
  }
}
