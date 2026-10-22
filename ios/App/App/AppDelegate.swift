import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // AAC Assistive Voice: Ensure speech audio is always audible, even if iPhone hardware Ring/Silent switch is enabled
        configureAudioSessionForPlayback()
        setupAudioInterruptionObserver()
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // AAC Assistive Voice: Re-apply playback category when resuming from background or inactive state
        configureAudioSessionForPlayback()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Re-activate audio session as app enters foreground
        configureAudioSessionForPlayback()
    }

    private func configureAudioSessionForPlayback() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.duckOthers])
            try session.setActive(true)
        } catch {
            print("[BeeYou AAC] Failed to set AVAudioSession category to playback:", error)
        }
    }

    private func setupAudioInterruptionObserver() {
        NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let userInfo = notification.userInfo,
                  let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
                  let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }
            if type == .ended {
                self?.configureAudioSessionForPlayback()
            }
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
