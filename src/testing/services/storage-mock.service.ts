import { of } from 'rxjs';
import { StorageService } from '../../app/micro-apps/csaa-mobile/_core/services';

export class StorageMock {
  get = jest.fn();
  set = jest.fn();
  remove = jest.fn();
}

export class StorageMockService {
  public static KEY = StorageService.KEY;
  public isReady = true;
  public get = jest.fn().mockResolvedValue(null);
  public set = jest.fn().mockResolvedValue(undefined);
  public remove = jest.fn().mockResolvedValue(undefined);
  public ready = jest.fn(() => of(this.isReady));
}
