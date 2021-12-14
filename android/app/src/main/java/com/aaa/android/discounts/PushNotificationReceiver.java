package com.aaa.android.discounts;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.salesforce.marketingcloud.MarketingCloudSdk;
import com.salesforce.marketingcloud.messages.push.PushMessageManager;

import java.util.Random;

@SuppressLint("LogNotTimber")
public class PushNotificationReceiver extends FirebaseMessagingService {
  public static final String TAG = PushNotificationReceiver.class.getSimpleName();
  public static final String PUSH_TYPE_FLO = "FLO";

  @Override
  public void onCreate() {
    super.onCreate();
    Log.i(TAG, "Push Notification Receiver created");
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    Log.i(TAG, "Push Notification Receiver destroyed");
  }

  @Override
  public void onNewToken(@NonNull String token) {
    Log.i(TAG, "New Push Token Received: " + token);
    try {
      MarketingCloudSdk.requestSdk(marketingCloudSdk -> marketingCloudSdk.getPushMessageManager().setPushToken(token));
    } catch(Exception outerEx) {
      Log.i(TAG, outerEx.getMessage(), outerEx);
    }
  }

  @Override
  public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
    try {
      Log.i(TAG, "Notification received: " + remoteMessage.getMessageId());
      if (hasNotificationData(remoteMessage)) {
        processMessage(remoteMessage);
      }
    } catch (Exception e) {
      Log.e(TAG, e.getMessage(), e);
    }
  }

  private void processMessage(RemoteMessage remoteMessage) {
    if (PushMessageManager.isMarketingCloudPush(remoteMessage)) {
      boolean hasProcessed = processMarketingCloudMessage(remoteMessage);
      if (hasProcessed) {
        return;
      }
    }

    processAllOtherMessages(remoteMessage);
  }

  private boolean processMarketingCloudMessage(RemoteMessage remoteMessage) {
    try {
      MarketingCloudSdk.requestSdk((sdk) -> {
        Log.i(TAG, "MarketingCloud message, will be processed in SDK.");
        sendPushNotification(remoteMessage);
        sdk.getPushMessageManager().handleMessage(remoteMessage);
      });

      return true;
    } catch (Exception e) {
      Log.e(TAG, "Marketing Cloud SDK not available process internally");
      return false;
    }
  }

  private void processAllOtherMessages(RemoteMessage remoteMessage) {
    if (isFloNotification(remoteMessage)) {
      Log.i(TAG, "Flo HB Push Received. Ignore from displaying Push Message in notification tray.");
    } else {
      sendPushNotification(remoteMessage);
      if (!isSystemNotification(remoteMessage)) {
        showNotificationInTray(remoteMessage);
      }
    }
  }

  private void sendPushNotification(RemoteMessage remoteMessage) {
    Bundle notification = convertMessageToBundle(remoteMessage, Action.PROCESS);

    if (ActivityStatus.isForeground) {
      Log.i(TAG, "Send notification to plugin");
      PushNotificationHelper.send(getApplicationContext(), notification);
    } else {
      Log.i(TAG, "Store notification to preferences");
      PushNotificationHelper.store(getApplicationContext(), notification);
    }
  }

  private void showNotificationInTray(RemoteMessage remoteMessage) {
    Log.d(TAG, "Show notification in tray");
    Intent receiverIntent = buildReceiverIntent(remoteMessage);
    PendingIntent pendingIntent = buildPendingIntent(receiverIntent);

    String title = remoteMessage.getData().get("title");
    String body = remoteMessage.getData().get("alert");

    NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this, Constants.MARKETINGCLOUD_NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_small)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true);

    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
    notificationManager.notify(1, mBuilder.build());
  }

  private Intent buildReceiverIntent(RemoteMessage remoteMessage) {
    Intent receiverIntent = new Intent(getApplicationContext(), MainActivity.class);
    receiverIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

    Bundle message = convertMessageToBundle(remoteMessage, Action.TAP);
    receiverIntent.putExtra("data", message);

    return receiverIntent;
  }

  private PendingIntent buildPendingIntent(Intent receiverIntent) {
    int requestCode = new Random().nextInt();
    return PendingIntent.getActivity(getApplicationContext(), requestCode, receiverIntent,
            PendingIntent.FLAG_UPDATE_CURRENT);
  }

  private Bundle convertMessageToBundle(RemoteMessage remoteMessage, Action action) {
    Bundle pushBundle = new Bundle();
    String notificationReceiver = remoteMessage.getData().get("notificationReceiver");

    for (String key : remoteMessage.getData().keySet()) {
      pushBundle.putString(key, remoteMessage.getData().get(key));
    }

    String messageId = remoteMessage.getData().get("_m") != null ? remoteMessage.getData().get("_m")
            : remoteMessage.getMessageId();

    pushBundle.putString("body", pushBundle.getString("alert"));
    pushBundle.putString("notificationReceiver", notificationReceiver == null ? Constants.NOTIFICATION_RECEIVER_INBOX : notificationReceiver);
    pushBundle.putString("messageID", messageId);
    pushBundle.putString("internalAction", action.toString());

    return pushBundle;
  }

  private boolean hasNotificationData(RemoteMessage remoteMessage) {
    return remoteMessage.getData().size() > 0;
  }

  private boolean isSystemNotification(RemoteMessage remoteMessage) {
    String notificationReceiver = remoteMessage.getData().get("notificationReceiver");

    return notificationReceiver != null && notificationReceiver.length() > 0;
  }

  private boolean isFloNotification(RemoteMessage remoteMessage) {
    String pushIdentifier = remoteMessage.getData().get("pushIdentifier");

    return PUSH_TYPE_FLO.equalsIgnoreCase(pushIdentifier);
  }
}
