// WIP
export class LoaderMock {
  private resolveFn;

  public onDidDismiss = jest.fn().mockReturnValue(
    new Promise((resolve) => {
      this.resolveFn = resolve;
    })
  );

  public present = jest.fn().mockResolvedValue(null);

  public dismiss = jest.fn().mockImplementation(() => {
    if (typeof this.resolveFn === 'function') {
      this.resolveFn.call(this.resolveFn);
    }
    return Promise.resolve();
  });
}

export class LoadingControllerMock {
  public create = jest.fn().mockResolvedValue(new LoaderMock());
}
