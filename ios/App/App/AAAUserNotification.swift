import Foundation
import UIKit

@objc
class AAAUserNotification: NSObject, UNUserNotificationCenterDelegate {
    static let shared = AAAUserNotification()
    
    private var lastPresentedNotification: String = ""
    private var notificationDelegates: [UNUserNotificationCenterDelegate] = []

    private override init() {
        super.init()
        print("AAAUserNotification => init")
    }

    public func configure() -> Void {
        let requestOptions: UNAuthorizationOptions = [.alert, .badge, .sound];
        let center = UNUserNotificationCenter.current()
        
        center.requestAuthorization(options: requestOptions) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
        
        center.delegate = self
    }
    
    public func observeNotificationCenterDelegate() -> Void {
        UNUserNotificationCenter.current().addObserver(self, forKeyPath: "delegate", options: [.new, .old], context: nil)
    }
    
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey: Any]?, context: UnsafeMutableRawPointer?) {
        if UNUserNotificationCenter.current().isEqual(object) {
            guard let newDelegate = change?[.newKey] as? UNUserNotificationCenterDelegate else {
                return
            }
            
            if !self.isEqual(newDelegate) {
                updateArrayOfExtraDelegates(with: newDelegate)
                UNUserNotificationCenter.current().delegate = self;
            }
        }
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    
        let allOptionsActive:UNNotificationPresentationOptions = [.alert, .badge, .sound]
                    
        NSLog("Notification: \(notification)");
        NSLog("Notification userInfo: \(notification.request.content.userInfo)");
        
        self.lastPresentedNotification = notification.request.identifier;
        
        /* First check if we have processor responsible for specific identifier*/
        let processor = notificationProcessor(notification.request)
        if (processor != nil) {
            processor!.userNotificationCenter?(center, willPresent: notification, withCompletionHandler: completionHandler)
            return
        }
        
        /* here we notify all extra delegates */
        let thirdPartyNotificationDelegates = thirdPartyNotificationDelegates()
        if thirdPartyNotificationDelegates.count > 0 {
            var tasksToProceed = 0;
            var options: UNNotificationPresentationOptions = [];
            
            for delegate in thirdPartyNotificationDelegates {
                tasksToProceed += 1
                
                DispatchQueue.main.async {
                    delegate.userNotificationCenter?(center, willPresent: notification, withCompletionHandler: { retOptions in
                        options.formUnion(retOptions)
                        tasksToProceed -= 1
                        
                        if (tasksToProceed == 0) {
                            if options.isEmpty {
                                options.formUnion(.alert)
                                completionHandler(options)
                            } else {
                                completionHandler(options)
                            }
                        }
                    })
                }
            }
            
            if (tasksToProceed == 0) {
                completionHandler((options.isEmpty ? allOptionsActive : options));
            }
            
        } else {
            completionHandler(allOptionsActive);
        }
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        
        // First check if we have processor responsible for specific identifier
        let processor = notificationProcessor(response.notification.request)
        if (processor != nil) {
            // if app is running from bg or close by clicking on notificaiton, it skips willPresent delegate
            // so need to send that additonally to ionic with RECEIVE action
            if (self.lastPresentedNotification != response.notification.request.identifier) {
                processor!.processDelivered?(request: response.notification.request)
            }
            
            processor?.userNotificationCenter?(center, didReceive: response, withCompletionHandler: completionHandler)
            return
        }
        
        let thirdPartyNotificationDelegates = self.thirdPartyNotificationDelegates()
        for delegate in thirdPartyNotificationDelegates {
            delegate.userNotificationCenter?(center, didReceive: response, withCompletionHandler: {})
        }
    }
    
    public func checkAndProcessDeliveredNotifications() -> Void {
        UNUserNotificationCenter.current().getDeliveredNotifications(completionHandler: { notifications in
            if Thread.isMainThread {
                self.processDelivered(notifications)
            } else {
                DispatchQueue.main.async {
                    self.processDelivered(notifications)
                }
            }
        })
    }
        
    private func processDelivered(_ notificatons: [UNNotification]) -> Void {
        let deliveredNotificationsKey = "AAANotifications_PROCESSED_DELIVERED_NOTIFICATIONS"
        let processedIDs = UserDefaults.standard.stringArray(forKey: deliveredNotificationsKey) ?? []
        
        var notificationsProcessed:[String] = []
        for notification in notificatons {
            let notificationId = notification.request.identifier
            let processor = notificationProcessor(notification.request)
            if processor != nil {
                if !processedIDs.contains(notificationId) {
                    processor!.processDelivered?(request: notification.request)
                }
                notificationsProcessed.append(notificationId)
            }
        }
        
        UserDefaults.standard.set(notificationsProcessed, forKey: deliveredNotificationsKey)
        NotificationCenter.default.post(name: AAAConstants.NOTIFICATION_PROCESS_TRIGGER, object: nil)
    }
    
    private func updateArrayOfExtraDelegates(with newDelegate: UNUserNotificationCenterDelegate) -> Void {
        var hasMatches = false;
        for delegate in self.notificationDelegates {
            if delegate.isEqual(newDelegate) {
                hasMatches = true;
                break;
            }
        }
        
        if !hasMatches {
            self.notificationDelegates.append(newDelegate)
        }
    }
    
    private func notificationProcessor(_ notificationRequest: UNNotificationRequest) -> AAANotificationProcessing? {
        for delegate in self.notificationDelegates {
            let processor = delegate as? AAANotificationProcessing
            if processor?.canProcessNotification?(request: notificationRequest) ?? false {
                return processor!
            }
        }
        
        return nil
    }
    
    private func thirdPartyNotificationDelegates() -> [UNUserNotificationCenterDelegate] {
        var thirdPartyDelegates:[UNUserNotificationCenterDelegate] = [];
        
        for delegate in self.notificationDelegates {
            let processor = delegate as? AAANotificationProcessing
            if processor == nil {
                thirdPartyDelegates.append(delegate)
            }
        }
        
        return thirdPartyDelegates;
    }
}
