import {
  Action,
  createSelector,
  getActionTypeFromInstance,
  State,
  StateContext,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { FetchAction } from '../actions';
import { FetchStatus } from '../../interfaces/ngxs-store.interface';

export interface FetchStateError {
  message: string;
  time: number;
}

export interface FetchStateModel {
  status: {
    [key: string]: FetchStatus;
  };
  lastError: {
    [key: string]: FetchStateError;
  };
}

export const FETCH_STATE_TOKEN = 'csaa_fetch';

const getInitialState = (): FetchStateModel => ({
  status: {},
  lastError: {},
});

@State<FetchStateModel>({
  name: FETCH_STATE_TOKEN,
  defaults: {
    ...getInitialState(),
  },
})
@Injectable()
export class FetchState {
  /**
   * A selector to check if the process/request has ever been started in the application life
   */
  static needsFetching(action) {
    const key = getActionTypeFromInstance(action);
    return createSelector(
      [FetchState],
      ({ status }: FetchStateModel) => !!key && (status[key] === undefined || status[key] === FetchStatus.NOT_FETCHED)
    );
  }

  static isLoading(action) {
    const key = getActionTypeFromInstance(action);
    return createSelector(
      [FetchState],
      ({ status }: FetchStateModel) => !!key && status[key] === FetchStatus.FETCHING
    );
  }

  static failed(action) {
    const key = getActionTypeFromInstance(action);
    return createSelector([FetchState], ({ status }: FetchStateModel) => !!key && status[key] === FetchStatus.ERROR);
  }

  static succeeded(action) {
    const key = getActionTypeFromInstance(action);
    return createSelector([FetchState], ({ status }: FetchStateModel) => !!key && status[key] === FetchStatus.SUCCESS);
  }

  static lastErrorFor(action) {
    const key = getActionTypeFromInstance(action);
    return createSelector([FetchState], ({ lastError }: FetchStateModel) => !!key && lastError[key]);
  }

  static activeErrorFor(action) {
    const key = getActionTypeFromInstance(action);
    return createSelector(
      [FetchState],
      ({ status, lastError }: FetchStateModel) => !!key && status[key] === FetchStatus.ERROR && lastError[key]
    );
  }

  @Action(FetchAction.Reset)
  reset({ getState, patchState }: StateContext<FetchStateModel>, action: FetchAction.Reset) {
    const { status } = getState();
    const updatedStatus = { ...status };
    updatedStatus[action.action] = FetchStatus.NOT_FETCHED;
    patchState({
      status: updatedStatus,
    });
  }

  @Action(FetchAction.Fetching)
  fetching({ getState, patchState }: StateContext<FetchStateModel>, action: FetchAction.Fetching) {
    const { status } = getState();
    const updatedStatus = { ...status };
    updatedStatus[action.action] = FetchStatus.FETCHING;
    patchState({
      status: updatedStatus,
    });
  }

  @Action(FetchAction.Success)
  success({ getState, patchState }: StateContext<FetchStateModel>, action: FetchAction.Success) {
    const { status } = getState();
    const updatedStatus = { ...status };
    updatedStatus[action.action] = FetchStatus.SUCCESS;
    patchState({
      status: updatedStatus,
    });
  }

  @Action(FetchAction.Error)
  error({ getState, patchState }: StateContext<FetchStateModel>, action: FetchAction.Error) {
    const { status, lastError } = getState();
    const updatedStatus = { ...status };
    updatedStatus[action.action] = FetchStatus.ERROR;

    const updatedLastError = { ...lastError };
    updatedLastError[action.action] = { message: action.error, time: Date.now() };
    patchState({
      status: updatedStatus,
      lastError: updatedLastError,
    });
  }
}
