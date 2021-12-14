import { of } from 'rxjs';
import { CsaaTheme } from '../../app/micro-apps/csaa-mobile/_core/services';
import { CONFIG_STATE_FIXTURE_MOCK } from '../fixtures';

export class ConfigMockService {
  setup = jest.fn();
  ready = jest.fn().mockReturnValue(of(CONFIG_STATE_FIXTURE_MOCK));
  getTheme = jest.fn().mockReturnValue(CsaaTheme.DEFAULT);
}
