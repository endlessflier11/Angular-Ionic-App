package com.aaa.android.discounts;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

@SuppressLint("LogNotTimber")
public class PushNotificationHelper {
  public static final String TAG = PushNotificationHelper.class.getSimpleName();

  public static void send(Context context, Bundle notification) {
    Log.i(TAG, "Send Notification to notification plugin");
    Intent intent = new Intent();
    intent.setAction(Constants.BROADCAST_NEW_NOTIFICATION);
    intent.putExtra("data", notification);
    LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
  }

  public static void store(Context context, Bundle notification) {
    Log.i(TAG, "Store Notification in shared preferences");
    SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
    Set<String> notifications = new HashSet<>(sharedPreferences.getStringSet(Constants.PREFERENCE_NOTIFICATION, new HashSet<>()));
    Log.i(TAG, "Stored Notification: " + notifications.size());

    String notificationString = convertBundleToJson(notification).toString();
    notifications.add(notificationString);

    SharedPreferences.Editor sharedPreferencesEditor = sharedPreferences.edit();
    sharedPreferencesEditor.putStringSet(Constants.PREFERENCE_NOTIFICATION, notifications);
    sharedPreferencesEditor.apply();
  }

  private static JSONObject convertBundleToJson(Bundle notification) {
    JSONObject jsonNotification = new JSONObject();

    try {
      for (String key : notification.keySet()) {
        try {
          jsonNotification.put(key, JSONObject.wrap(notification.get(key)));
        } catch (JSONException e) {
          Log.e(TAG, e.getMessage(), e);
        }
      }
    } catch (Exception ex) {
      Log.e(TAG, ex.getMessage(), ex);
    }

    return jsonNotification;
  }
}
