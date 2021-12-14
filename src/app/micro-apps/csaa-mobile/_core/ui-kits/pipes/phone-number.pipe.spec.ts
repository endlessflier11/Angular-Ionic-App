import { PhonePipe } from './phone-number.pipe';

describe('PhonePipe', () => {
  let pipe: PhonePipe;

  beforeEach(() => {
    pipe = new PhonePipe();
  });

  it('should format number to us phone format', () => {
    expect(pipe.transform('0000000000')).toEqual('000-000-0000');
  });
});
