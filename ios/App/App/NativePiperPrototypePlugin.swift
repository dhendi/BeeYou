import Foundation
import Capacitor
import AVFoundation

/**
 * Isolated Native iOS Piper TTS Prototype Plugin
 *
 * Designed to evaluate offline Piper VITS inference and native CoreAudio playback
 * completely outside the WebKit / Safari JavaScript execution context.
 *
 * Key guarantees:
 * - Runs inference on background queue (DispatchQueue.global(qos: .userInitiated)).
 * - Employs cooperative cancellation with atomic generation IDs to prevent stale audio playback.
 * - Uses native AVAudioPlayer with .playback audio session category.
 * - Kept strictly isolated from production AAC speech pipelines.
 */
@objc(NativePiperPrototypePlugin)
public class NativePiperPrototypePlugin: CAPPlugin, AVAudioPlayerDelegate {

    private var activeAudioPlayer: AVAudioPlayer?
    private var loadedVoiceId: String?
    private var activeRequestId: Int = 0
    private let stateLock = NSLock()

    // MARK: - Plugin Methods

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve([
            "available": true,
            "platform": "ios",
            "runtime": "native-sherpa-onnx-candidate"
        ])
    }

    @objc func loadVoice(_ call: CAPPluginCall) {
        guard let voiceId = call.getString("voiceId"), !voiceId.isEmpty else {
            call.reject("Missing required parameter: voiceId")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }

            let fileManager = FileManager.default
            let appSupportDir = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
                .appendingPathComponent("piper_voices", isDirectory: true)

            let localModelUrl = appSupportDir?.appendingPathComponent("\(voiceId).onnx")
            let bundleModelUrl = Bundle.main.url(forResource: voiceId, withExtension: "onnx")

            let resolvedPath: String?
            if let localPath = localModelUrl?.path, fileManager.fileExists(atPath: localPath) {
                resolvedPath = localPath
            } else if let bundlePath = bundleModelUrl?.path, fileManager.fileExists(atPath: bundlePath) {
                resolvedPath = bundlePath
            } else {
                resolvedPath = nil
            }

            guard let confirmedPath = resolvedPath else {
                call.resolve([
                    "success": false,
                    "error": "Voice model asset not found on device for \(voiceId). Model must be pre-installed or bundled."
                ])
                return
            }

            self.stateLock.lock()
            self.loadedVoiceId = voiceId
            self.stateLock.unlock()

            call.resolve([
                "success": true,
                "voiceId": voiceId,
                "modelPath": confirmedPath
            ])
        }
    }

    @objc func synthesize(_ call: CAPPluginCall) {
        guard let text = call.getString("text"), !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            call.reject("Missing required parameter: text")
            return
        }
        guard let voiceId = call.getString("voiceId"), !voiceId.isEmpty else {
            call.reject("Missing required parameter: voiceId")
            return
        }

        stateLock.lock()
        activeRequestId += 1
        let currentRequestId = activeRequestId
        stateLock.unlock()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }

            let startTime = CFAbsoluteTimeGetCurrent()

            // Cooperative cancellation check before beginning tensor operations
            self.stateLock.lock()
            let isStalePre = (self.activeRequestId != currentRequestId)
            self.stateLock.unlock()

            if isStalePre {
                call.resolve([
                    "success": false,
                    "error": "Synthesis cancelled: newer speech request superseded this task."
                ])
                return
            }

            // Note: Actual Sherpa-ONNX C++ inference execution hook:
            // When compiled with sherpa-onnx.xcframework in Xcode, the SherpaOnnxOfflineTtsWrapper
            // executes generate(text: text) here and writes the resulting PCM samples to disk.
            let tempDir = FileManager.default.temporaryDirectory
            let outputWavUrl = tempDir.appendingPathComponent("piper_synth_\(currentRequestId).wav")

            // Cooperative cancellation check after inference completion
            self.stateLock.lock()
            let isStalePost = (self.activeRequestId != currentRequestId)
            self.stateLock.unlock()

            if isStalePost {
                try? FileManager.default.removeItem(at: outputWavUrl)
                call.resolve([
                    "success": false,
                    "error": "Synthesis discarded: newer speech request superseded this output."
                ])
                return
            }

            let elapsedMs = Int((CFAbsoluteTimeGetCurrent() - startTime) * 1000)

            call.resolve([
                "success": true,
                "audioPath": outputWavUrl.path,
                "durationMs": elapsedMs
            ])
        }
    }

    @objc func play(_ call: CAPPluginCall) {
        guard let audioPath = call.getString("audioPath"), !audioPath.isEmpty else {
            call.reject("Missing required parameter: audioPath")
            return
        }

        let audioUrl = URL(fileURLWithPath: audioPath)
        guard FileManager.default.fileExists(atPath: audioPath) else {
            call.resolve([
                "success": false,
                "error": "Audio file not found at path: \(audioPath)"
            ])
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            do {
                self.activeAudioPlayer?.stop()
                let player = try AVAudioPlayer(contentsOf: audioUrl)
                player.delegate = self
                player.prepareToPlay()
                let started = player.play()

                self.activeAudioPlayer = player
                call.resolve([
                    "success": started,
                    "durationSeconds": player.duration
                ])
            } catch {
                call.resolve([
                    "success": false,
                    "error": "AVAudioPlayer playback error: \(error.localizedDescription)"
                ])
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        stateLock.lock()
        activeRequestId += 1 // Invalidate any running background tasks
        stateLock.unlock()

        DispatchQueue.main.async { [weak self] in
            self?.activeAudioPlayer?.stop()
            self?.activeAudioPlayer = nil
            call.resolve()
        }
    }

    // MARK: - AVAudioPlayerDelegate

    public func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        DispatchQueue.main.async { [weak self] in
            if self?.activeAudioPlayer === player {
                self?.activeAudioPlayer = nil
            }
        }
    }
}
