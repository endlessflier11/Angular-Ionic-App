import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';

export enum GetPhotoErrorType {
  GENERIC = 'Unable to get photo',
  IMAGE_NOT_SELECTED = 'No Image Selected',
}

export class GetPictureError extends Error {
  constructor(error: any) {
    super(error);
    Object.setPrototypeOf(this, GetPictureError.prototype);

    this.message =
      error?.message === 'User cancelled photos app'
        ? GetPhotoErrorType.IMAGE_NOT_SELECTED
        : error?.message || GetPhotoErrorType.GENERIC;
  }
}

@Injectable({ providedIn: CsaaCommonModule })
export class CameraService {
  constructor(private platform: Platform) {}

  getPicture() {
    return this.platform.ready().then(() =>
      Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.DataUrl,
        saveToGallery: true,
        correctOrientation: true,
        source: CameraSource.Camera,
      }).catch((error) => Promise.reject(new GetPictureError(error)))
    );
  }
}
