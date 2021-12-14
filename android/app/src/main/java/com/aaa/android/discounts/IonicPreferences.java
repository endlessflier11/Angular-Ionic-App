package com.aaa.android.discounts;

import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

public class IonicPreferences {
  public String appId;
  public String channel;
  public String binaryVersion;
  public String binaryVersionName;
  public String binaryVersionCode;
  public boolean disabled;
  public String host;
  public String updateMethod;
  public int maxVersions;
  public int minBackgroundDuration;
  public String currentVersionId;
  public String currentVersionForAppId;
  public String currentBuildId;
  public String bundlePath;
  public Update availableUpdate;
  public Map<String, Update> updates = new HashMap<>();

  public static class Update {
    public String binaryVersionName;
    public String binaryVersionCode;
    public String channel;
    public String lastUsed;
    public String state;
    public String url;
    public String versionId;
    public String buildId;
    public String ionicVersion;
  }

  private IonicPreferences() {
  }

  public static IonicPreferences convert(String jsonString) {
    IonicPreferences result = new IonicPreferences();

    if (jsonString != null) {
      Gson gson = new Gson();
      result = gson.fromJson(jsonString, IonicPreferences.class);
    }

    return result;
  }
}
