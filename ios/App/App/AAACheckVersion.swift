import Foundation
import os

@objc
class AAACheckVersion: NSObject {
    private static let VERSION_CHECK:String = "IonicVersionCheck"
    private static let IONIC5_READY: String = "ionic5_ready"
    private static let IONIC_CHANNEL:String = "deployChannel";
    private static let IONIC_CHANNEL_PREFIX:String = "C5-";
    private static let IONIC_CHANNEL_PREFIX_OLD:String = "I5-";

    @objc
    static func checkChannel() {
        guard let channel = UserDefaults.standard.string(forKey: IONIC_CHANNEL) else {
            return
        }
        var newChannel = channel
        
        if newChannel.starts(with: IONIC_CHANNEL_PREFIX_OLD) {
            os_log("VersionCheck => Ionic Channel does point to old I5 Channels, need to change them");
            newChannel = newChannel.replacingOccurrences(of: IONIC_CHANNEL_PREFIX_OLD, with: IONIC_CHANNEL_PREFIX)
        }
        
        if !newChannel.starts(with: IONIC_CHANNEL_PREFIX) && !newChannel.starts(with: "Feature") {
            os_log("VersionCheck => Ionic Channel does not point to C5 Channels, need to change them");
            newChannel = IONIC_CHANNEL_PREFIX + newChannel
        }
        
        if newChannel == channel {
            os_log("VersionCheck => No channel name change required")
        } else {
            UserDefaults.standard.set(newChannel, forKey: IONIC_CHANNEL)
        }
    }
    
    @objc
    static func checkVersion() {
        let nativeVersion = AAAVersion.getNativeVersion()
        let previousVersion = getPreviousNativeVersion()
        
        if (nativeVersion == previousVersion) {
            os_log("VersionCheck => Version check not needed already done")
            return
        }
        
        ionicVersionCheck(nativeVersion)

        updatePreviousNativeVersion(with: nativeVersion)
    }
        
    private static func ionicVersionCheck(_ nativeVersion: String) {
        let ionicVersion = AAAVersion.getIonicVersion()
        if ionicVersion == AAAVersion.VERSION_BUNDLE {
            os_log("VersionCheck => Application running bundle, all good")
        } else if ionicVersion == AAAVersion.VERSION_ERROR {
            os_log("VersionCheck => Ionic Version is error, RESET TO BUNDLE")
            resetToBundle()
        } else {
            compareVersions(nativeVersion, ionicVersion)
        }
    }
    
    private static func compareVersions(_ nativeVersion: String, _ ionicVersion: String) {
        let result = AAAVersion.compare(ionicVersion, with: nativeVersion)
        os_log("VersionCheck => native -> %@; ionic -> %@ = %@", nativeVersion, ionicVersion, result.rawValue)
        
        switch result {
        case .InvalidResult:
            os_log("VersionCheck => Application running but I don't know what versions, let's RESET TO BUNDLE")
            resetToBundle()
            break
        case .Equal, .Greater:
            os_log("VersionCheck => Application running same or newer version, all good")
            break
        case .Lower:
            if (shouldResetToBundle()) {
                os_log("VersionCheck => Application running older version, RESET TO BUNDLE")
                resetToBundle()
            } else {
                os_log("VersionCheck => Application running older version, but ACG or MWG, all good")
            }
            break
        }
    }
    
    private static func shouldResetToBundle() -> Bool {
        if AAAVersion.isACGorMWG() && isIonic5Ready() {
            return false
        }
                
        return true
    }
    
    private static func isIonic5Ready() -> Bool {
        guard let ionic5Ready = UserDefaults.standard.string(forKey: IONIC5_READY) else {
            return false
        }
        
        return ionic5Ready == "true"
    }

    private static func resetToBundle() {
        let userDefault = UserDefaults.standard

        // Reset WebView back to bundled
        userDefault.set("", forKey:"serverBasePath")
        
        guard var ionicPreferences = userDefault.dictionary(forKey: "ionicDeploySavedPreferences") as [String: Any]? else {
            os_log("VersionCheck => No Ionic Preferences no reset to bundle required")
            return
        }
        
        // Remove currentVersionId preference
        ionicPreferences.removeValue(forKey: "availableUpdate")
        ionicPreferences.updateValue([String: Any](), forKey: "updates")
        ionicPreferences.removeValue(forKey: "currentVersionId")
        ionicPreferences.removeValue(forKey: "currentVersionForAppId")
        
        userDefault.set(ionicPreferences, forKey: "ionicDeploySavedPreferences")
    }

    private static func getPreviousNativeVersion() -> String {
        return UserDefaults.standard.string(forKey: VERSION_CHECK) ?? "0.0.0"
    }

    private static func updatePreviousNativeVersion(with nativeVersion: String) {
        UserDefaults.standard.set(nativeVersion, forKey: VERSION_CHECK)
    }
}

