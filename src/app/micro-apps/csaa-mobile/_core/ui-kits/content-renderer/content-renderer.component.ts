import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { withErrorReporter } from '../../helpers';
import { Store } from '@ngxs/store';
import { ConfigState } from '../../store/states/config.state';

@Component({
  selector: 'csaa-content-renderer',
  templateUrl: './content-renderer.component.html',
  styleUrls: ['./content-renderer.component.scss'],
})
export class ContentRendererComponent implements OnInit {
  @Input() source$: Observable<string>;

  currentTheme: string;
  content: string;

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.currentTheme = this.store.selectSnapshot(ConfigState.theme);
    this.loadData();
  }

  loadData(): void {
    this.source$.subscribe(withErrorReporter((content) => (this.content = content)));
  }
}
