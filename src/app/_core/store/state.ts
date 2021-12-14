import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppStateModel {}

@State<AppStateModel>({
  name: 'main_app',
  defaults: {},
})
@Injectable()
export class AppState {}
