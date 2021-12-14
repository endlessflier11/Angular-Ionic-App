import { Component, Input, OnInit } from '@angular/core';
import { PolicyType } from '../../interfaces/policy.interface';
import { ConfigService, CsaaTheme } from '../../services';

@Component({
  selector: 'csaa-theme-icon',
  templateUrl: './theme-icon.component.html',
  styleUrls: ['./theme-icon.component.scss'],
})
export class ThemeIconComponent implements OnInit {
  @Input() name: any;
  @Input() type: any;
  @Input() size = 25;

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
}
