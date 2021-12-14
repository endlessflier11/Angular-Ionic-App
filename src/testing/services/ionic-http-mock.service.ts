import { of } from 'rxjs';

export class IonicHttpMockService {
  setDataSerializer = jest.fn();
  get = jest.fn();
  post = jest.fn();
  sendRequest = jest.fn().mockReturnValue(of({ status: 200, statusText: 'OK' }));
}
