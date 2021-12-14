import { Pipe, PipeTransform } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
} from '@angular/platform-browser';

enum UnsafeData {
  url,
  html,
  style,
  script,
  resourceUrl,
}

type UnsafeDataType = keyof typeof UnsafeData;

@Pipe({
  name: 'safeData',
})
export class SafeDataPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}

  /**
   * Transform by type
   *
   * @param value: string
   * @param type: string
   */
  transform(
    value: string,
    type: UnsafeDataType
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case UnsafeData[UnsafeData.style]:
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case UnsafeData[UnsafeData.script]:
        return this.sanitizer.bypassSecurityTrustScript(value);
      case UnsafeData[UnsafeData.url]:
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case UnsafeData[UnsafeData.resourceUrl]:
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      case UnsafeData[UnsafeData.html]:
      default:
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}
