const isFunction = (fn: any) => typeof fn === 'function';
export type Nullable<T> = T | null | undefined;

export interface SubscriptionLike {
  unsubscribe(): void;
}

/**
 * Subscription sink that holds Observable subscriptions
 * until you call unsubscribe on it in ngOnDestroy.
 */
export class SubSink {
  protected subs: Nullable<SubscriptionLike>[] = [];

  /**
   * Subscription sink that holds Observable subscriptions
   * until you call unsubscribe on it in ngOnDestroy.
   *
   * @example
   * In Angular:
   * ```
   *   private subSink = new SubSink();
   *   ...
   *   this.subSink.add(observable$.subscribe(...));
   *   ...
   *   ngOnDestroy() {
   *     this.subSink.unsubscribe();
   *   }
   * ```
   */
  constructor() {}

  /**
   * Add subscriptions to the tracked subscriptions
   *
   * @example
   *  this.subSink.add(observable$.subscribe(...));
   */
  add(...subscriptions: Nullable<SubscriptionLike>[]) {
    this.subs = this.subs.concat(subscriptions);
  }

  /**
   * Unsubscribe to all subscriptions in ngOnDestroy()
   *
   * @example
   *   ngOnDestroy() {
   *     this.subSink.unsubscribe();
   *   }
   */
  unsubscribe() {
    this.subs.forEach((sub) => sub && isFunction(sub.unsubscribe) && sub.unsubscribe());
    this.subs = [];
  }
}
