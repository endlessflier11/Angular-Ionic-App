import { parse } from 'date-fns';

export const clickEvent: Event = {
  AT_TARGET: 0,
  BUBBLING_PHASE: 0,
  CAPTURING_PHASE: 0,
  NONE: 0,
  bubbles: false,
  cancelBubble: false,
  cancelable: false,
  composed: false,
  currentTarget: undefined,
  defaultPrevented: false,
  eventPhase: 0,
  isTrusted: false,
  returnValue: false,
  srcElement: undefined,
  target: undefined,
  timeStamp: 0,
  type: '',
  composedPath: jest.fn(),
  initEvent: jest.fn(),
  stopImmediatePropagation: jest.fn(),
  stopPropagation: jest.fn(),
  preventDefault: jest.fn(),
};

export const stripStartingSlash = (s: string) => {
  if (s.substr(0, 1) === '/') {
    return s.substr(1);
  }
  return s;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const deepCopy = (obj: object) => JSON.parse(JSON.stringify(obj));

export const mockDateNow = (date: string, format = 'yyyy-MM-dd') => {
  const dateNowStub = jest.fn(() => parse(date, format, new Date()).getTime());
  global.Date.now = dateNowStub;
  return dateNowStub;
};
