import { CsaaTheme } from '../../micro-apps/csaa-mobile';

export class ClubConfigHelper {
  static clubToEnum(club: string): CsaaTheme {
    return club === 'mwg' ? CsaaTheme.MWG : CsaaTheme.ACA;
  }

  static getPaths(theme: CsaaTheme): { clubPath: string; moduleRootPath: string } {
    const clubPath = `/mobile/${theme.toLowerCase().replace('theme-', '')}`;
    const moduleRootPath = `${clubPath}/csaa`;

    return { clubPath, moduleRootPath };
  }
}
