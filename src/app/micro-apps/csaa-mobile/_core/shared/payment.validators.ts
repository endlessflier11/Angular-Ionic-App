import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import * as accountValidator from 'us-bank-account-validator';
import * as cardValidator from 'card-validator';
import { isBefore, startOfMonth } from 'date-fns';

export function routingNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const validationResult = accountValidator.routingNumber(control.value);

    return validationResult.isValid
      ? null
      : {
          routingNumber: { value: control.value },
        };
  };
}

export function accountNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const validationResult = accountValidator.accountNumber(control.value);

    return validationResult.isValid
      ? null
      : {
          accountNumber: { value: control.value },
        };
  };
}

export function nicknameValidator(form: FormGroup) {
  const saveCard = form.get('saveCard');
  const saveAccount = form.get('saveAccount');
  const nickname = form.get('nickname');

  const account = saveCard || saveAccount;

  if (account && account.value === true && !nickname.value) {
    return { nickname: true };
  }
}

export function cardNumberValidator(control) {
  if (control.value && !control.isMasked) {
    const numberValidator = cardValidator.number(control.value.replace(/\D+/g, ''));
    if (!numberValidator.isValid) {
      return { cardNumber: true };
    }
  }
}

export function expirationValidator(control) {
  // check mask is valid
  const expirationRegex = /^[0-9]{2}\/[0-9]{2}$/;
  if (!control.value || !control.value.match(expirationRegex)) {
    return { expiration: true };
  }
  // check month is valid
  const [month, year] = control.value.split('/');
  if (+month > 12) {
    return { expiration: true };
  }
  // check expiration is valid
  if (isCardExpired(+year + 2000, +month)) {
    return { expiration: true };
  }
}

export function isCardExpired(year: number, month: number): boolean {
  // check expiration is valid
  const expDate = new Date(year, month - 1, 1);
  const curDate = startOfMonth(new Date(Date.now()));
  return isBefore(expDate, curDate);
}

export function zipCodeValidator(control) {
  const zipCodeRegex = /^[0-9]{5}$/;
  if (control.value && !control.value.match(zipCodeRegex)) {
    return { zipCode: true };
  }
}
