import MarketingCloudSDK

class AAAPushNotificationReceiver : NSObject, AAANotificationProcessing {
    static let shared = AAAPushNotificationReceiver()
    
    private override init() {
        super.init()
        print("AAANotificationReceiver => init")
    }
    
    func setupDelegate() {
        UNUserNotificationCenter.current().delegate = self
    }
    
    func createNotificationPayloadFrom(request: UNNotificationRequest) -> Dictionary <String, Any> {
        let originalUserInfo = request.content.userInfo as? Dictionary <String, Any>
        var notificationPayload: Dictionary <String, Any> = originalUserInfo ?? [:]
        
        let messageId = (originalUserInfo?["_m"] as? String) ?? request.identifier
        let notificationReceiver = (originalUserInfo?["notificationReceiver"] as? String) ?? "Inbox"
        
        notificationPayload["messageID"] = messageId
        notificationPayload["notificationReceiver"] = notificationReceiver
        
        var apsTitle: String?
        var apsBody: String?
        
        if let apsDict = notificationPayload["aps"] as? Dictionary<String, Any>,
            let alertDict = apsDict["alert"] as? Dictionary<String, Any> {
            apsTitle = alertDict["title"] as? String
            apsBody = alertDict["body"] as? String
        }
        
        notificationPayload["aps"] = nil
        notificationPayload["title"] = apsTitle ?? request.content.title
        notificationPayload["body"] = apsBody ?? request.content.body
        
        return notificationPayload
    }
    
    func canProcessNotification(request: UNNotificationRequest) -> Bool {
        return request.trigger?.isKind(of: UNPushNotificationTrigger.self) ?? false
    }
    
    func processDelivered(request: UNNotificationRequest) -> Void {
        print("AAANotificationReceiver => process push notifications received while app was in bg or closed")
        self.sendToSubscriber(notificationDict: self.createNotificationPayloadFrom(request: request), notificationAction: .process)
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        
        print("AAANotificationReceiver => willPresent notification")
        
        self.sendToSubscriber(notificationDict: self.createNotificationPayloadFrom(request: notification.request), notificationAction: .process)
        // do not show system ios toast
        completionHandler([.alert, .badge, .sound])
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        print("AAANotificationReceiver => didReceive notification")
        
        if response.actionIdentifier == UNNotificationDefaultActionIdentifier {
            self.sendToSubscriber(notificationDict: self.createNotificationPayloadFrom(request: response.notification.request), notificationAction: .tap)
        }

        MarketingCloudSDK.sharedInstance().sfmc_setNotificationRequest(response.notification.request)
        
        completionHandler()
    }

    func sendToSubscriber(notificationDict: Dictionary<String, Any>?, notificationAction: AAANotificationActions) {
        print("AAANotificationReceiver => post communication")
        if var notificationWithAction = notificationDict {
            notificationWithAction["internalAction"] = notificationAction.rawValue
            NotificationCenter.default.post(name: AAAConstants.NOTIFICATION_NAME, object: self, userInfo: notificationWithAction)
        }
    }
    
    func isSystemMessage(request: UNNotificationRequest) -> Bool {
        if let notificationReceiver = request.content.userInfo["notificationReceiver"] as? String,
            notificationReceiver.count > 0 {
            return true
        }
        return false
    }
    
    func isFloNotification(request: UNNotificationRequest) -> Bool {
        if let pushIdentifier = request.content.userInfo["pushIdentifier"] as? String,
            pushIdentifier.count > 0 {
            return pushIdentifier.caseInsensitiveCompare("FLO") == .orderedSame
        }
        return false
    }
}

