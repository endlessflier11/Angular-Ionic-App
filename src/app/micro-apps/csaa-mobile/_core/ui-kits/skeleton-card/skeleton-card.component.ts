import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'csaa-skeleton-card',
  templateUrl: './skeleton-card.component.html',
  styleUrls: ['./skeleton-card.component.scss'],
})
export class SkeletonCardComponent implements OnInit {
  @Input() showHeader = true;
  @Input() showList = true;
  @Input() showButton = true;
  @Input() hideCardBorder = false;

  constructor() {}

  ngOnInit() {}
}
