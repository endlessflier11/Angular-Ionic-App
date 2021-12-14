// Todo: create HttpServiceTestingController
import { of } from 'rxjs/internal/observable/of';

export class HttpMockService {
  get = jest.fn();
  post = jest.fn();
  getNamedResource = jest.fn().mockReturnValue(of(null));
  postNamedResource = jest.fn().mockReturnValue(of(null));
}
