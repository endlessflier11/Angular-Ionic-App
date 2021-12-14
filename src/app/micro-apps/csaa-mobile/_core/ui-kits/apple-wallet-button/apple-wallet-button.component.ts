import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'csaa-apple-wallet-button',
  templateUrl: './apple-wallet-button.component.html',
  styleUrls: ['./apple-wallet-button.component.css'],
})
export class AppleWalletButtonComponent implements OnInit {
  @Output() clickBtn = new EventEmitter<void>();

  public readonly isIos: boolean;

  constructor(private readonly platformService: PlatformService) {
    this.isIos = this.platformService.isIos();
  }

  ngOnInit(): void {}
}
