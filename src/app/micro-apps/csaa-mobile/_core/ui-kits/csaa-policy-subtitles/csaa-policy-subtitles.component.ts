import { Component, Input } from '@angular/core';

@Component({
  selector: 'csaa-policy-subtitles',
  templateUrl: './csaa-policy-subtitles.component.html',
  styleUrls: ['./csaa-policy-subtitles.component.scss'],
})
export class CsaaPolicySubtitlesComponent {
  public policySubtitlesExpanded = false;
  @Input() public policySubtitle: string;

  public get policySubtitles(): string[] {
    if (!this.policySubtitle) {return [];}
    return this.policySubtitle.split(', ');
  }

  onToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    this.policySubtitlesExpanded = !this.policySubtitlesExpanded;
  }
}
