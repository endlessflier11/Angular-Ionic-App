import { Injectable } from '@angular/core';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';

@Injectable({ providedIn: CsaaCommonModule })
export class EmailService {
  mailTo(email: string, subject?: string) {
    const mailtoAddress = 'mailto:' + email + (subject ? '?subject=' + subject : '');
    window.location.assign(mailtoAddress);
  }
}
