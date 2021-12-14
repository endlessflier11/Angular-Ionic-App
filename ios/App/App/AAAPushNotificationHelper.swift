import Foundation
import UIKit
import os

@objc
class AAAPushNotificationHelper: NSObject {
    public static func checkNotification(with launchOptions: [UIApplication.LaunchOptionsKey : Any]?) -> Void {
        guard let options = launchOptions else {
            return
        }
        
        guard let notification = options[UIApplication.LaunchOptionsKey.remoteNotification] as? [AnyHashable : Any] else {
            return
        }
        
        //Launched from push notification
        let aps = notification["aps"] as? [String: Any]
        NSLog("\n Custom: \(String(describing: aps))")
        
        handleRemoteNotification(notification)
    }
            
    public static func savePushToken(_ deviceToken: Data) -> Void {
        let deviceTokenString = deviceTokenAsString(deviceToken)
        
        NSLog("APNS token: %@", deviceTokenString);
        
        UserDefaults.standard.set(deviceToken, forKey: "deviceToken")
        UserDefaults.standard.set(deviceTokenString, forKey: "deviceTokenString")
    }

    public static func handleRemoteNotification(_ notification: [AnyHashable : Any]?) -> Void {
        if notification == nil {
            return;
        }
        
        NSLog("Received notification: \(notification!)");
        
        let notificationWithAction = createNotificationDictFrom(notification: notification)
        NotificationCenter.default.post(name: AAAConstants.NOTIFICATION_NAME, object: self, userInfo: notificationWithAction)
    }
    
    private static func deviceTokenAsString(_ deviceToken: Data) -> String {
        return deviceToken.map { String(format: "%.2hhx", $0) }.joined()
    }
    
    private static func createNotificationDictFrom(notification: [AnyHashable : Any]?) -> [AnyHashable : Any]? {
        guard var result = notification else {
            return notification
        }
        
        if result["notificationReceiver"] == nil {
            result["notificationReceiver"] = "Inbox"
        }
        
        result["body"] = result["alert"] ?? "";
        result["internalAction"] = "PROCESS";

        return result;
    }
}
