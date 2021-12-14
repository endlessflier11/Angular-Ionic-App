import { Store } from '@ngxs/store';
import { combineLatest, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FetchState } from '../store/states/fetch.state';

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const unsubscribeIfPresent = (...subs: Subscription[]) =>
  subs.filter((s) => !!s && typeof s.unsubscribe === 'function').forEach((s) => s.unsubscribe());

export const fetchIsLoadingFor = (store: Store, ...actions: any[]) =>
  combineLatest(actions.map((action) => store.select(FetchState.isLoading(action)))).pipe(
    map((areActionsLoading) => areActionsLoading.find(Boolean))
  );

export const fetchHasFailedFor = (store: Store, ...actions: any[]) =>
  combineLatest(actions.map((action) => store.select(FetchState.failed(action)))).pipe(
    map((areActionsLoading) => areActionsLoading.find(Boolean)),
    filter((failed) => failed)
  );
