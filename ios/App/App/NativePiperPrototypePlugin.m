#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

/**
 * Objective-C Capacitor Plugin Registration for NativePiperPrototypePlugin
 */
CAP_PLUGIN(NativePiperPrototypePlugin, "NativePiperPrototype",
    CAP_PLUGIN_METHOD(isAvailable, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(loadVoice, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(synthesize, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(play, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
)
