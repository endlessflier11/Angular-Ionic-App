import Foundation
import UIKit

@objc protocol AAANotificationProcessing: UNUserNotificationCenterDelegate {
   @objc optional func canProcessNotification(request: UNNotificationRequest) -> Bool;
   @objc optional func processDelivered(request: UNNotificationRequest) -> Void;
}

class AAAConstants {
    public static let PREFERENCE_NOTIFICATION = "PREFERENCE_NOTIFICATION";
    public static let NOTIFICATION_NAME = NSNotification.Name("NEW_NOTIFICATION");
    public static let NOTIFICATION_PROCESS_TRIGGER = NSNotification.Name("PROCESS_NOTIFICATIONS");
    public static let DYNAMIC_LINK_NOTIFICATION = NSNotification.Name("DYNAMIC_LINK_RECEIVED");
}

enum AAANotificationActions: String {
    case tap = "TAP"
    case receive = "RECEIVE"
    case process = "PROCESS"
}
