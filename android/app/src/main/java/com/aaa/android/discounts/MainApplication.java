package com.aaa.android.discounts;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.salesforce.marketingcloud.MarketingCloudConfig;
import com.salesforce.marketingcloud.MarketingCloudSdk;

import org.json.JSONException;
import org.json.JSONObject;

@SuppressLint("LogNotTimber")
public class MainApplication extends Application {
    public static final String TAG = MainApplication.class.getSimpleName();

    private static final String VERSION_CHECK = "IonicVersionCheck";
    private static final String IONIC5_READY = "ionic5_ready";
    private static final String IONIC_CHANNEL = "deployChannel";
    private static final String IONIC_CHANNEL_PREFIX = "C5-";
    private static final String IONIC_CHANNEL_PREFIX_OLD = "I5-";

    public static boolean APP_ALREADY_STARTED = false;

    @Override
    public void onCreate() {
        FirebaseApp.initializeApp(this.getApplicationContext());

        checkChannel();
        checkVersion();
        initMarketingCloud();
        super.onCreate();
    }

    private void checkChannel() {
        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
        String channel = sharedPrefs.getString(IONIC_CHANNEL, null);
        String newChannel = channel;
        if (channel == null) {
            return;
        }

        if (!newChannel.startsWith(IONIC_CHANNEL_PREFIX_OLD)) {
            Log.i(TAG, "VersionCheck => Ionic Channel does point to old I5 Channels, need to change them");
            newChannel = channel.replace(IONIC_CHANNEL_PREFIX_OLD, IONIC_CHANNEL_PREFIX);
        }

        if (!newChannel.startsWith(IONIC_CHANNEL_PREFIX) && !newChannel.startsWith("Feature")) {
            Log.i(TAG, "VersionCheck => Ionic Channel does not point to C5 Channels, need to change them");
            newChannel = IONIC_CHANNEL_PREFIX + newChannel;
        }

        if (newChannel.equals(channel)) {
            Log.i(TAG, "VersionCheck => No channel name change required");
        } else {
            SharedPreferences.Editor prefs = sharedPrefs.edit();
            prefs.putString(IONIC_CHANNEL, IONIC_CHANNEL_PREFIX + channel);
            prefs.apply();
        }
    }

    private void checkVersion() {
        String nativeVersion = Version.getNativeVersion(getApplicationContext());
        String previousVersion = getPreviousNativeVersion();

        if (nativeVersion.equals(previousVersion)) {
            Log.i(TAG, "VersionCheck => Version check not needed already done");
            return;
        }

        ionicVersionCheck(nativeVersion);

        updatePreviousNativeVersion(nativeVersion);
    }

    private void initMarketingCloud() {
        try {
            if (MarketingCloudSdk.isReady() || MarketingCloudSdk.isInitializing()) {
                Log.i(TAG, String.format("MarketingCloud init => isReady: %b; isInitializing: %b", MarketingCloudSdk.isReady(), MarketingCloudSdk.isInitializing()));
            } else {
                SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
                JSONObject exactTargetInfo = new JSONObject(
                        preferences.getString(Constants.PREFERENCE_EXACT_TARGET_INFO, "{}"));
                if (exactTargetInfo.has("appId")) {
                    Log.i(TAG, "MarketingCloud init => Found MarketingCloudConfig do init");
                    MarketingCloudConfig config = MarketingCloudHelper.buildConfig(getApplicationContext(), exactTargetInfo);
                    MarketingCloudSdk.init(this, config, status -> Log.i(TAG, "MarketingCloud init => done"));
                } else {
                    Log.i(TAG, "MarketingCloud init => can't be done yet as no configuration stored");
                }
            }
        } catch (Exception ex) {
            Log.e(TAG, ex.getMessage(), ex);
        }
    }

    private void ionicVersionCheck(String nativeVersion) {
        String ionicVersion = Version.getIonicVersion(getApplicationContext());
        if (Version.VERSION_BUNDLE.equals(ionicVersion)) {
            Log.i(TAG, "VersionCheck => Application running bundle, all good");
        } else if (Version.VERSION_ERROR.equals(ionicVersion)) {
            Log.i(TAG, "VersionCheck => Ionic Version is error, RESET TO BUNDLE");
            resetToBundle();
        } else {
            compareVersions(nativeVersion, ionicVersion);
        }
    }

    private void compareVersions(String nativeVersion, String ionicVersion) {
        Version.CompareResult result = Version.compare(ionicVersion, nativeVersion);
        Log.d(TAG, String.format("VersionCheck => Comparing versions: native -> %s; ionic -> %s = %s", nativeVersion, ionicVersion, result.toString()));

        switch (result) {
            case INVALID_RESULT:
                Log.e(TAG, "VersionCheck => Application running but I don't know what versions, let's RESET TO BUNDLE");
                resetToBundle();
                break;
            case EQUAL:
            case GREATER:
                Log.i(TAG, "VersionCheck => Application running same or newer version, all good");
                break;
            case LOWER:
                if (shouldResetToBundle()) {
                    Log.i(TAG, "VersionCheck => Application running older version, RESET TO BUNDLE");
                    resetToBundle();
                } else {
                    Log.i(TAG, "VersionCheck => Application running older version, but ACG or MWG, all good");
                }
                break;
        }
    }

    private boolean shouldResetToBundle() {
        return !Version.isACGOrMWG(getApplicationContext()) || !isIonic5Ready();
    }

    private boolean isIonic5Ready() {
        SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
        String ionic5Ready = sharedPrefs.getString(IONIC5_READY, "false");
        Log.i(TAG, "VersionCheck => isIonic5Ready: " + ionic5Ready);

        return ionic5Ready.equals("true");
    }

    private void resetToBundle() {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("com.ionic.deploy.preferences", Context.MODE_PRIVATE);
        String prefsString = prefs.getString("ionicDeploySavedPreferences", null);
        JSONObject customPrefs = new JSONObject();

        try {
            if (prefsString != null) {
                customPrefs = new JSONObject(prefsString);
            }

            customPrefs.remove("availableUpdate");
            customPrefs.put("updates", new JSONObject());
            customPrefs.remove("currentVersionId");
            customPrefs.remove("currentVersionForAppId");
        } catch (JSONException e) {
            Log.e(TAG, "VersionCheck => Ionic Prefs Json Error: " + e.getMessage(), e);
        }

        SharedPreferences.Editor prefsEdit = prefs.edit();
        prefsEdit.putString("ionicDeploySavedPreferences", customPrefs.toString());
        prefsEdit.apply();

        SharedPreferences webViewPrefs = getApplicationContext().getSharedPreferences("WebViewSettings", Activity.MODE_PRIVATE);
        SharedPreferences.Editor webViewPrefsEdit = webViewPrefs.edit();
        webViewPrefsEdit.remove("serverBasePath");
        webViewPrefsEdit.apply();
    }

    private String getPreviousNativeVersion() {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences(VERSION_CHECK, Context.MODE_PRIVATE);

        return prefs.getString("nativeVersion", "0.0.0");
    }

    private void updatePreviousNativeVersion(String version) {
        SharedPreferences.Editor prefs = getApplicationContext().getSharedPreferences(VERSION_CHECK, Context.MODE_PRIVATE).edit();
        prefs.putString("nativeVersion", version);
        prefs.apply();
    }
}