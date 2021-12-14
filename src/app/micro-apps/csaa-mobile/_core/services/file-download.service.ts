import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CsaaCommonModule } from '../../csaa-core/csaa-common.module';
import { MetadataService } from './metadata.service';
import { ConfigSelector } from '../store/selectors';
import { Store } from '@ngxs/store';
import { HttpService } from './http/http.service';
import { ResponseType } from '../interfaces';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: CsaaCommonModule })
export class FileDownloadService {
  private readonly platformIsIos: boolean;
  private readonly platformIsAndroid: boolean;

  constructor(
    private platformService: PlatformService,
    private httpService: HttpService,
    private file: File,
    private metadataService: MetadataService,
    private store: Store
  ) {
    this.platformIsIos = this.platformService.isIos();
    this.platformIsAndroid = this.platformService.isAndroid();
  }

  private getPathPrefix() {
    if (this.platformIsIos) {
      return this.file.documentsDirectory;
    } else if (this.platformIsAndroid) {
      return this.file.externalDataDirectory;
    }
  }

  download(url: string, fileName: string): Observable<string> {
    return this.httpService
      .get<Blob>(url, {
        responseType: ResponseType.BLOB,
        headers: {
          'X-ApplicationContext': JSON.stringify(
            this.metadataService.getApplicationContextMetadata()
          ),
          'x-api-key': this.store.selectSnapshot(ConfigSelector.state)?.activeConfigData?.apiKey,
        },
      })
      .pipe(
        switchMap(({ body: blob }) => from(this.storeBlob(blob, fileName))),
        map((filePath) => filePath.nativeURL)
      );
  }

  /**
   * Saves the souce Blob into a file target file name.
   *
   * @param sourceBlob – the blob to be saved
   * @param targetFileName – the name of the file that will be created
   * @return a Promise<any> resolving to the path on the local file system
   */
  storeBlob(sourceBlob: Blob, targetFileName: string): Promise<any> {
    if (this.platformService.isBrowser()) {
      console.log('[CSAA] Attempting to save file on non-cordova environment');
      return Promise.resolve(new Proxy({}, { get: () => `file://www/${targetFileName}` }));
    }
    const path = this.getPathPrefix();
    return this.file.writeFile(path, targetFileName, sourceBlob, { replace: true });
  }
}
