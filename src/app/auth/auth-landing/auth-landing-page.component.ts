import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { noop } from 'rxjs';
import { RouterHelpers } from '@csaadigital/mobile-mypolicy';

@Component({
  selector: 'app-csaa-auth-landing',
  templateUrl: './auth-landing-page.component.html',
  styleUrls: ['./auth-landing-page.component.scss'],
})
export class AuthLandingPage implements OnInit {
  public readonly route = RouterHelpers.getRoutePath;

  constructor(private readonly navController: NavController) {}

  ngOnInit() {}

  navigateToSsoAuth() {
    this.navController.navigateForward(this.route('csaa.parent.auth.sso')).then(noop);
  }

  goBack() {
    this.navController.back();
  }
}
