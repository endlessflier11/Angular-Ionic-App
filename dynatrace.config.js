module.exports = {
  cordova: {
    debug: false,
    autoUpdate: true,
  },

  js: {
    url: 'http://bur04826.live.dynatrace.com/api/v1/rum/jsInlineScript/APPLICATION-E34A5FEABD83176C?Api-Token=WUOeu5OWQGiNjnaHfYRhT',
  },

  android: {
    config: `
        dynatrace {
            pluginEnabled false
            configurations {
                debug {
                    autoStart.enabled false
                    hybridWebView.enabled false
                    webRequests.enabled false
                }
                release {
                    autoStart.enabled false
                    hybridWebView.enabled false
                    webRequests.enabled false
                }
            }
        }
        `,
  },

  ios: {
    config: `
        <key>DTXAutoStart</key>
        <false/>
        <key>DTXHybridApplication</key>
        <false/>
        <key>DTXInstrumentWebRequestTiming</key>
        <false/>
        <key>DTXCrashReportingEnabled</key>
        <false/>
        <key>DTXInstrumentLifecycleMonitoring</key>
        <false/>
        <key>DTXInstrumentWebRequestTiming</key>
        <false/>
        <key>DTXInstrumentAutoUserAction</key>
        <false/>
        <key>DTXInstrumentFrameworks</key>
        <false/>
        <key>DTXInstrumentGPSLocation</key>
        <false/>
        <key>DTXUserOptIn</key>
        <true/>
        `,
  },
};
