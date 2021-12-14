package com.aaa.android.discounts;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.regex.Pattern;

@SuppressLint("LogNotTimber")
public class Version {
  public static final String VERSION_BUNDLE = "bundle";
  public static final String VERSION_ERROR = "0.0.0";

  private static final String TAG = Version.class.getSimpleName();
  private static final String APPID_ACG = "883b318b";
  private static final String APPID_MWG = "ff8815da";

  public static final String[] BAD_VERSION_IDS = new String[] {
          "851cc012-0ce5-41de-897c-a084d3f7b648",
          "b97cf205-328a-40f2-8da5-824e30f3f776",
          "70e69e39-5ccf-494c-ac37-41681485ca8f",
          "2477a738-53c2-4468-93a6-5e2a260912d0",
          "7a90fd7f-5c72-4048-94be-ee890da0a721",
          "cc93ae41-3f96-4d49-96ee-be7e9b91b1ea",
  };
  public static final String[] BAD_CHANNELS = new String[] { "Development", "Production", "AppStore" };

  private static final Pattern pattern = Pattern.compile("-?\\d+(\\.\\d+)?");

  public static String getNativeVersion(Context context) {
    String versionName = VERSION_ERROR;
    try {
      PackageInfo pInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
      versionName = pInfo.versionName;
    } catch (PackageManager.NameNotFoundException e) {
      Log.e(TAG, "VersionCheck => Error getting VersionName: " + e.getMessage(), e);
    }

    return versionName;
  }

  public static String getIonicVersion(Context context) {
    IonicPreferences ionicPreferences = extractIonicPreferences(context);

    if (ionicPreferences == null) {
      return VERSION_BUNDLE;
    }

    if (ionicPreferences.currentVersionId == null) {
      return getAvailableUpdateVersion(ionicPreferences);
    }

    if(APPID_ACG.equals(ionicPreferences.appId) && Arrays.asList(BAD_VERSION_IDS).contains(ionicPreferences.currentVersionId)) {
      return VERSION_ERROR;
    }

    IonicPreferences.Update runningVersion = ionicPreferences.updates.get(ionicPreferences.currentVersionId);
    if (runningVersion == null) {
      return VERSION_ERROR;
    }

    if(Arrays.asList(BAD_CHANNELS).contains(runningVersion.channel)) {
      return VERSION_ERROR;
    }

    return runningVersion.ionicVersion != null ? runningVersion.ionicVersion : VERSION_ERROR;
  }

  private static String getAvailableUpdateVersion(IonicPreferences ionicPreferences) {
    if (ionicPreferences.availableUpdate == null) {
      return VERSION_ERROR;
    }

    String ionicVersion = ionicPreferences.availableUpdate.ionicVersion != null ? ionicPreferences.availableUpdate.ionicVersion : VERSION_ERROR;

    return "ready".equals(ionicPreferences.availableUpdate.state) ? ionicVersion : VERSION_ERROR;
  }

  public static boolean isACGOrMWG(Context context) {
    IonicPreferences ionicPreferences = extractIonicPreferences(context);

    if (ionicPreferences == null) {
      return false;
    }

    boolean isACGOrMWG = APPID_ACG.equals(ionicPreferences.appId) || APPID_MWG.equals(ionicPreferences.appId);
    Log.i(TAG, String.format("VersionCheck => isACGOrMWG: %b", isACGOrMWG));

    return isACGOrMWG;
  }

  private static IonicPreferences extractIonicPreferences(Context context) {
    SharedPreferences prefs = context.getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
    String prefsString = prefs.getString("ionicDeploySavedPreferences", null);
    Log.d(TAG, "VersionCheck => Ionic Version: " + prefsString);

    if (prefsString == null || prefsString.length() == 0) {
      return null;
    }

    return IonicPreferences.convert(prefsString);
  }

  public static CompareResult compare(String version1, String version2) {
    String[] v1parts = replaceBetaVersion(version1.split("\\."));
    String[] v2parts = replaceBetaVersion(version2.split("\\."));

    if (isNotValid(v1parts) || isNotValid(v2parts)) {
      return CompareResult.INVALID_RESULT;
    }

    int[] v1numbers = mapToNumbers(v1parts);
    int[] v2numbers = mapToNumbers(v2parts);

    for (int i = 0; i < v1numbers.length; ++i) {
      if (v2numbers.length == i) {
        return CompareResult.GREATER;
      }

      if (v1numbers[i] > v2numbers[i]) {
        return CompareResult.GREATER;
      } else if (v1numbers[i] < v2numbers[i]) {
        return CompareResult.LOWER;
      }
    }

    if (v1numbers.length != v2numbers.length) {
      return CompareResult.GREATER;
    }

    return CompareResult.EQUAL;
  }

  private static String[] replaceBetaVersion(String[] version) {
    ArrayList<String> versionList = new ArrayList<>(Arrays.asList(version));

    try {
      if (versionList.size() > 0 && versionList.get(versionList.size() - 1).contains("-")) {
        String[] betaParts = versionList.get(versionList.size() - 1).split("-");
        versionList.set(versionList.size() - 1, betaParts[0]);
        versionList.add(betaParts[1]);
      }
    } catch (Exception e) {
      Log.e(TAG, "VersionCheck => replaceBetaVersion error" + e.getMessage(), e);
    }

    return versionList.toArray(new String[0]);
  }

  private static boolean isNotValid(String[] version) {
    for (String s : version) {
      if (s == null) {
        return true;
      }

      if (!pattern.matcher(s).matches()) {
        return true;
      }
    }

    return false;
  }

  private static int[] mapToNumbers(String[] version) {
    int[] versionNumber = new int[version.length];

    for (int i = 0; i < version.length; i++) {
      versionNumber[i] = Integer.parseInt(version[i]);
    }

    return versionNumber;
  }

  public enum CompareResult {
    INVALID_RESULT,
    GREATER,
    EQUAL,
    LOWER
  }
}
