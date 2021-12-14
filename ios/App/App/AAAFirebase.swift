import Foundation
import Firebase

@objc
class AAAFirebase: NSObject {
    private static let ENV_APP_STORE = "APPSTORE"
    private static let ENV_DEV = "DEV"

    public static func activateDebugIfRequired() -> Void {
        let environment = Bundle.main.object(forInfoDictionaryKey: "environment") as? String ?? ENV_APP_STORE
        if environment != ENV_APP_STORE {
            var args = ProcessInfo.processInfo.arguments
            args.append("-FIRAnalyticsDebugEnabled")
            args.append("-FIRDebugEnabled")
            ProcessInfo.processInfo.setValue(args, forKey: "arguments")
        }
    }
    
    public static func configure() -> Void {
        FirebaseApp.configure()
    }
    
    public static func dynamicLinkOpenUrl(url: URL) -> Bool {
        if let dynamicLink = DynamicLinks.dynamicLinks().dynamicLink(fromCustomSchemeURL: url) {
            store(dynamicLink: dynamicLink)
            return true
        }
        return false
    }
    
    public static func dynamicLinkUniversalLink(url: URL) -> Bool {
        let handled = DynamicLinks.dynamicLinks().handleUniversalLink(url) { dynamiclink, error in
            if dynamiclink == nil {
                DynamicLinks.dynamicLinks().dynamicLink(fromUniversalLink: url) { dynamiclink, error in
                    store(dynamicLink: dynamiclink)
                }
            } else {
                store(dynamicLink: dynamiclink)
            }
        }

        return handled
    }
    
    private static func store(dynamicLink: DynamicLink?) -> Void {
        if dynamicLink == nil || dynamicLink!.url == nil {
            return
        }
        
        var dynamicLinkData: [String : Any] = [:]
        dynamicLinkData["deepLink"] = dynamicLink!.url?.absoluteString ?? ""
        dynamicLinkData["minimumAppVersion"] = dynamicLink!.minimumAppVersion

        UserDefaults.standard.set(dynamicLinkData, forKey: "FirebaseDynamicLink")
        NotificationCenter.default.post(name: AAAConstants.DYNAMIC_LINK_NOTIFICATION, object: nil)
    }
}
