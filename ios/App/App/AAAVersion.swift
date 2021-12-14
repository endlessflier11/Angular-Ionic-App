import Foundation

class AAAVersion: NSObject {
    public static let VERSION_BUNDLE: String = "bundle"
    public static let VERSION_ERROR: String = "0.0.0"

    private static let APPID_ACG: String = "883b318b"
    private static let APPID_MWG: String = "ff8815da"
    
    private static let ACG_IONIC_3_APP_IDS: Set = [
        "851cc012-0ce5-41de-897c-a084d3f7b648",
        "b97cf205-328a-40f2-8da5-824e30f3f776",
        "70e69e39-5ccf-494c-ac37-41681485ca8f",
        "2477a738-53c2-4468-93a6-5e2a260912d0",
        "7a90fd7f-5c72-4048-94be-ee890da0a721",
        "cc93ae41-3f96-4d49-96ee-be7e9b91b1ea",
    ]
    private static let IONIC_3_CHANNELS: Set = ["Development", "Production", "AppStore"]
    
    static func getNativeVersion() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as! String
    }
    
    static func getIonicVersion() -> String {
        let userDefaults = UserDefaults.standard
        
        guard let ionicPreferences = userDefaults.dictionary(forKey: "ionicDeploySavedPreferences") else {
            return VERSION_BUNDLE
        }

        guard let currentVersionId = ionicPreferences["currentVersionId"] as? String else {
            return getAvailableUpdateVersion(ionicPreferences)
        }

        guard let appId = ionicPreferences["appId"] as? String else {
            return VERSION_ERROR;
        }
        
        if(appId == APPID_ACG && ACG_IONIC_3_APP_IDS.contains(currentVersionId)) {
            return VERSION_ERROR
        }
        
        guard let updates = ionicPreferences["updates"] as? [String: Any] else {
            return VERSION_ERROR
        }
        
        guard let runningUpate = updates[currentVersionId] as? [String: Any] else {
            return VERSION_ERROR
        }
        
        guard let ionicVersion = runningUpate["ionicVersion"] as? String else {
            return VERSION_ERROR
        }
        
        guard let runningChannel = runningUpate["channel"] as? String else {
            return VERSION_ERROR
        }
        
        if(IONIC_3_CHANNELS.contains(runningChannel)) {
            return VERSION_ERROR
        }
        
        return ionicVersion
    }
    
    private static func getAvailableUpdateVersion(_ ionicPreferences: [String: Any]) -> String {
        guard let availableUpdate = ionicPreferences["availableUpdate"] as? [String: Any?] else {
            return VERSION_ERROR
        }
        
        let state = availableUpdate["state"] as? String
        let ionicVersion = availableUpdate["ionicVersion"] as? String ?? VERSION_ERROR

        return state == "ready" ? ionicVersion : VERSION_ERROR
    }
        
    static func isACGorMWG() -> Bool {
        let userDefaults = UserDefaults.standard
        
        guard let ionicPreferences = userDefaults.dictionary(forKey: "ionicDeploySavedPreferences") else {
            return false
        }

        guard let appId = ionicPreferences["appId"] as? String else {
            return false
        }

        return appId == APPID_ACG || appId == APPID_MWG
    }
    
    static func compare(_ version1: String, with version2: String) -> CompareResult {
        let v1Parts = replaceBetaVersion(version1.split(separator: "."))
        let v2Parts = replaceBetaVersion(version2.split(separator: "."))
        
        if (isNotValid(v1Parts) || isNotValid(v2Parts)) {
            return CompareResult.InvalidResult
        }
        
        let v1Numbers = mapToNumers(v1Parts)
        let v2Numbers = mapToNumers(v2Parts)

        for index in 0..<v1Numbers.count {
            if (v2Numbers.count == index) {
              return CompareResult.Greater
            }
            
            if (v1Numbers[index] > v2Numbers[index]) {
              return CompareResult.Greater
            } else if (v1Numbers[index] < v2Numbers[index]) {
              return CompareResult.Lower
            }
        }
        
        if (v1Numbers.count != v2Numbers.count) {
          return CompareResult.Greater
        }
        
        return CompareResult.Equal
    }
    
    private static func replaceBetaVersion(_ version: [String.SubSequence]) -> [String.SubSequence] {
        var newVersion = version
        
        if (version.count > 0 && version[version.count - 1].contains("-")) {
            let betaParts = version[version.count - 1].split(separator: "-")
            newVersion[version.count - 1] = betaParts[0]
            newVersion.append(betaParts[1])
        }
        
        return newVersion
    }
    
    private static func isNotValid(_ version: [String.SubSequence]) -> Bool {
        for tuple in version {
            if (Int(tuple) == nil) {
                return true
            }
        }
        
        return false
    }
    
    private static func mapToNumers(_ version: [String.SubSequence]) -> [Int] {
        var versionToNumber = [Int]()
        
        for tuple in version {
            versionToNumber.append(Int(tuple) ?? 0)
        }
        
        return versionToNumber
    }
    
    public enum CompareResult: String {
        case InvalidResult = "InvalidResult"
        case Equal = "Equal"
        case Greater = "Greater"
        case Lower = "Lower"
    }
}

