import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ConfigService, CsaaConfigEnv, CsaaTheme } from '../micro-apps/csaa-mobile';
import { ClubConfigHelper } from '../_core/helpers/club-config.helper';
import { ACA_UNINSURED_REDIRECT_URL } from '../micro-apps/csaa-mobile/constants';

@Component({
  selector: 'csaa-club-selection',
  templateUrl: './club-selection.page.html',
  styleUrls: ['./club-selection.page.scss'],
})
export class ClubSelectionPage {
  constructor(private configService: ConfigService, private navCtrl: NavController) {}

  select(club) {
    const theme = ClubConfigHelper.clubToEnum(club);
    const { clubPath, moduleRootPath } = ClubConfigHelper.getPaths(theme);
    const isACA = CsaaTheme.ACA === theme;
    this.configService.setup(
      environment.production ? CsaaConfigEnv.PROD : CsaaConfigEnv.QA,
      theme,
      {
        moduleRootPath,
        nonInsuredRedirectTo: isACA ? null : '/auth',
        showHomeHeader: isACA,
        homeBackButtonRedirectTo: clubPath,
        handleIgToken: isACA,
        clubCode: isACA ? '212' : '005',
        zipCode: isACA ? '73120' : null,
        nonInsuredRedirectToExternal: isACA ? ACA_UNINSURED_REDIRECT_URL : undefined,
      }
    );
    this.navCtrl.navigateForward(clubPath);
  }
}
