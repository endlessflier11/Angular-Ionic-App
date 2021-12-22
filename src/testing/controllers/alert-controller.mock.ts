import { AlertOptions, AlertButton } from '@ionic/core';
import { noop } from '../../app/micro-apps/csaa-mobile/_core/helpers';

// Testing...
// - let alertControllerMock: AlertControllerMock;
// - { provide: AlertController, useClass: AlertControllerMock },
// - alertControllerMock = TestBed.inject(AlertController) as any;
// - const alertInstance = alertControllerMock.getTop();
// - alertInstance.selectButton('Confirm')

export class AlertMock {
  private resolveFn;

  constructor(private controller: AlertControllerMock, private options: AlertOptions) {}

  public onDidDismiss = jest.fn().mockReturnValue(
    new Promise((resolve) => {
      this.resolveFn = resolve;
    })
  );

  public async present() {
    this.controller.pushToTop(this);
  }

  public async dismiss() {
    this.controller.pop(this);
    this.resolve();
  }

  public getOptions() {
    return this.options;
  }

  private resolve(event = { data: null, role: null }) {
    if (typeof this.resolveFn === 'function') {
      this.resolveFn.call(this.resolveFn, { data: event.data, role: event.role });
      this.resolveFn = null;
    }
  }

  selectButton(buttonText: string, data = null) {
    const btn = this.options.buttons.find((b: string | AlertButton) => {
      let btnText = b as string;
      if (b.hasOwnProperty('text')) {
        const alertBtn: AlertButton = b as AlertButton;
        btnText = alertBtn.text;
      }
      return new RegExp(buttonText).test(btnText);
    });

    if (btn.hasOwnProperty('handler')) {
      const handler = (btn as AlertButton).handler;
      handler.call(handler);
    }
    this.resolve({ data, role: (btn as AlertButton).role || undefined });
    this.dismiss().then(noop);
  }
}

export class AlertControllerMock {
  private alerts: AlertMock[] = [];

  public create = jest.fn().mockImplementation((options: any) => {
    const alert = new AlertMock(this, options);
    this.alerts.push(alert);
    return Promise.resolve(alert);
  });

  public dismiss = jest.fn().mockReturnValue(Promise.resolve(true));

  getTop(): AlertMock | undefined {
    return this.alerts.length ? this.alerts[this.alerts.length - 1] : undefined;
  }

  pushToTop(alert: AlertMock) {
    this.alerts.push(alert);
  }

  pop(instance: AlertMock) {
    if (this.getTop() === instance) {
      return this.alerts.pop();
    }
  }
}
