import UIKit
import Capacitor
import MarketingCloudSDK
import FirebaseDynamicLinks

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
        
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        AAAFirebase.activateDebugIfRequired()
        AAAFirebase.configure()

        AAACheckVersion.checkChannel()
        AAACheckVersion.checkVersion()

        AAAPushNotificationHelper.checkNotification(with: launchOptions)

        AAAUserNotification.shared.configure()
        AAAUserNotification.shared.observeNotificationCenterDelegate()
        AAAPushNotificationReceiver.shared.setupDelegate()
        
        setupUDID()
        
        acgDidFinishLaunchingWithOptions(launchOptions)

        return true
    }
    
    func acgDidFinishLaunchingWithOptions(_ launchOptions: [UIApplication.LaunchOptionsKey: Any]?) {
        
    }
    
    func acgDidReceiveRemoteNotification(_ userInfo: [AnyHashable : Any]) {
        
    }

    func setupUDID() -> Void {
        var udid = UserDefaults.standard.string(forKey: "UDID")
        if udid == nil {
            udid = UUID.init().uuidString
            UserDefaults.standard.set(udid, forKey: "UDID")
        }
    }
    
    func sfmcSetMarketingCloudRequest(_ userInfo: [AnyHashable: Any]) {
        let content = UNMutableNotificationContent.init()
        content.userInfo = userInfo
        let uuid = UUID.init().uuidString
        let request = UNNotificationRequest.init(identifier: uuid, content: content, trigger: nil)
        
        MarketingCloudSDK.sharedInstance().sfmc_setNotificationRequest(request)
    }
    
    func sfmcMarkAllMessagesRead() {
        MarketingCloudSDK.sharedInstance().sfmc_markAllMessagesRead()
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        sfmcMarkAllMessagesRead()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        sfmcMarkAllMessagesRead()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        AAAUserNotification.shared.checkAndProcessDeliveredNotifications()
        sfmcMarkAllMessagesRead()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        let handled = AAAFirebase.dynamicLinkOpenUrl(url: url)
        
        return handled ? handled : ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        let handled = AAAFirebase.dynamicLinkUniversalLink(url: userActivity.webpageURL!)
        
        return handled ? handled : ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)

        let statusBarRect = UIApplication.shared.statusBarFrame
        guard let touchPoint = event?.allTouches?.first?.location(in: self.window) else { return }

        if statusBarRect.contains(touchPoint) {
          NotificationCenter.default.post(name: .capacitorStatusBarTapped, object: nil)
        }
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        AAAPushNotificationHelper.savePushToken(deviceToken)
       
        let mcInstance = MarketingCloudSDK.sharedInstance();
        mcInstance.sfmc_setDeviceToken(deviceToken)
    }
    
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any]) {
        acgDidReceiveRemoteNotification(userInfo)
        AAAPushNotificationHelper.handleRemoteNotification(userInfo)
        sfmcSetMarketingCloudRequest(userInfo)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}
