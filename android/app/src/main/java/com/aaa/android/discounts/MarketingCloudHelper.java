package com.aaa.android.discounts;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.salesforce.marketingcloud.MarketingCloudConfig;
import com.salesforce.marketingcloud.notifications.NotificationCustomizationOptions;
import com.salesforce.marketingcloud.notifications.NotificationMessage;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.Random;

@SuppressLint("LogNotTimber")
public class MarketingCloudHelper {
    public static final String TAG = MarketingCloudHelper.class.getSimpleName();

    public static MarketingCloudConfig buildConfig(Context applicationContext, JSONObject exactTargetInfo)
            throws JSONException {
        return MarketingCloudConfig.builder().setApplicationId(exactTargetInfo.getString("appId"))
                .setAccessToken(exactTargetInfo.getString("accessToken"))
                .setAnalyticsEnabled(exactTargetInfo.getBoolean("analyticsEnabled"))
                .setPiAnalyticsEnabled(exactTargetInfo.getBoolean("piAnalyticsEnabled"))
                .setGeofencingEnabled(exactTargetInfo.getBoolean("geofencingEnabled"))
                .setProximityEnabled(exactTargetInfo.getBoolean("proximityEnabled"))
                .setMarketingCloudServerUrl(exactTargetInfo.getString("endpoint")).setMid(exactTargetInfo.getString("mid"))
                .setNotificationCustomizationOptions(
                        NotificationCustomizationOptions.create(R.drawable.ic_notification_small, (context, notificationMessage) -> {
                            int requestCode = new Random().nextInt();
                            Intent receiverIntent = buildReceiverIntent(applicationContext, notificationMessage);

                            return PendingIntent.getActivity(applicationContext, requestCode, receiverIntent,
                                    PendingIntent.FLAG_UPDATE_CURRENT);
                        }, (context, notificationMessage) -> com.salesforce.marketingcloud.notifications.NotificationManager
                                .createDefaultNotificationChannel(applicationContext)))
                .build(applicationContext);
    }

    private static Intent buildReceiverIntent(Context applicationContext, NotificationMessage notificationMessage) {
        Intent receiverIntent = new Intent(applicationContext, MainActivity.class);
        receiverIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

        Bundle message = convertMessageToBundle(notificationMessage);
        receiverIntent.putExtra("data", message);

        return receiverIntent;
    }

    private static Bundle convertMessageToBundle(NotificationMessage notificationMessage) {
        Bundle pushBundle = new Bundle();

        Map<String, String> payload = notificationMessage.payload();
        if (payload != null) {
            Log.w(TAG, "Add payload to intent: " + payload.size() + " items");
            for (Map.Entry<String, String> entry : payload.entrySet()) {
                pushBundle.putString(entry.getKey(), entry.getValue());
            }
        } else {
            Log.w(TAG, "Notification message does not have any payload");
        }

        pushBundle.putString("body", pushBundle.getString("alert"));
        pushBundle.putString("notificationReceiver", Constants.NOTIFICATION_RECEIVER_INBOX);
        pushBundle.putString("messageID", notificationMessage.id());
        pushBundle.putString("internalAction", Action.TAP.toString());

        return pushBundle;
    }
}
