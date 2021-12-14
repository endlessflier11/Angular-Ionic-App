// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserSettingAction {
  export class LoadPolicyPaperlessPreferences {
    static readonly type = '[CSAA:UserSettingAction] LoadPolicyPaperlessPreferences';
  }
  export class ReloadPolicyPaperlessPreferences {
    static readonly type = '[CSAA:UserSettingAction] ReloadPolicyPaperlessPreferences';
  }
  export class Reset {
    static readonly type = '[CSAA:UserSettingAction] Reset';
  }
}
