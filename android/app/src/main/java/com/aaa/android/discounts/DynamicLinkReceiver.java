package com.aaa.android.discounts;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.firebase.dynamiclinks.FirebaseDynamicLinks;
import com.google.firebase.dynamiclinks.PendingDynamicLinkData;

import org.json.JSONObject;

import java.util.Arrays;
import java.util.List;

@SuppressLint("LogNotTimber")
public class DynamicLinkReceiver extends AppCompatActivity {

    private static final String TAG = DynamicLinkReceiver.class.getSimpleName();

    protected void onCreate(Bundle savedInstanceState) {
        Log.i(TAG, "Creating Activity");
        super.onCreate(savedInstanceState);

        handleFirebaseDynamicLink(getIntent());
    }

    protected void onNewIntent(Intent intent) {
        Log.i(TAG, "Received Intent");
        super.onNewIntent(intent);

        handleFirebaseDynamicLink(intent);
    }

    protected void handleFirebaseDynamicLink(Intent intent) {
        if (!MainApplication.APP_ALREADY_STARTED) {
            startApplication(intent);
            doFinish();
            return;
        }

        Resources res = getResources();
        String appLinkAction = intent.getAction();
        Uri appLinkData = intent.getData();
        String host = appLinkData.getHost() != null ? appLinkData.getHost().toLowerCase() : "";
        String[] dynamicLinkHosts = res.getStringArray(R.array.dynamic_link_hosts);

        if (Intent.ACTION_VIEW.equals(appLinkAction) && Arrays.asList(dynamicLinkHosts).contains(host)) {
            sendDynamicLink(intent);
        } else {
            moveToFront();
        }
    }

    private void sendDynamicLink(Intent intent) {
        Log.i(TAG, "Check Firebase for Dynamic Links");
        FirebaseDynamicLinks.getInstance().getDynamicLink(intent)
                .continueWith(task -> {
                    PendingDynamicLinkData data = task.getResult();

                    JSONObject result = new JSONObject();
                    result.put("deepLink", data.getLink());
                    result.put("clickTimestamp", data.getClickTimestamp());
                    result.put("minimumAppVersion", data.getMinimumAppVersion());

                    Log.i(TAG, "Received Dynamic Link sending it to plugin");
                    sendNotification(result);
                    moveToFront();

                    return result;
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, e.getMessage(), e);
                    moveToFront();
                });
    }

    private void sendNotification(JSONObject dynamicLinkData) {
        Log.i(TAG, "Send Notification to plugin");
        Intent intent = new Intent();
        intent.setAction(Constants.BROADCAST_NEW_DYNAMIC_LINK);
        intent.putExtra("data", dynamicLinkData.toString());
        LocalBroadcastManager.getInstance(this.getApplicationContext()).sendBroadcast(intent);
    }

    private void startApplication(Intent intent) {
        Log.i(TAG, "Start MainActivity");
        intent.setClass(this.getApplicationContext(), MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_NO_ANIMATION);

        getApplicationContext().startActivity(intent);
    }

    private void moveToFront() {
        Log.i(TAG, "Move task to front");
        ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);

        List<ActivityManager.AppTask> tasksList = am.getAppTasks();
        for (ActivityManager.AppTask task : tasksList) {
            Log.i(TAG, "MainActivity is in front");
            task.moveToFront();
            doFinish();
        }
    }

    private void doFinish() {
        Log.i(TAG, "Finish");
        finish();
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
    }
}
