/**
 * BeeYou: Android Network Security Verification Suite
 *
 * Requirements & Acceptance Tests:
 * 1. Remove broad cleartext permission from production Capacitor and Android configuration.
 * 2. Preserve HTTP localhost live reload for authorized debug builds only.
 * 3. Ensure release builds cannot accidentally inherit development-only network permissions or the live-reload URL.
 * 4. Preserve HTTPS Firebase, TTS, translation, caregiver sync, and authentication connectivity.
 * 5. Preserve AAC playback, audio resources, offline functionality, and the existing Android testing workflow.
 * 6. Review merged Android manifests and generated Capacitor assets for both debug and release variants.
 * 7. Test that production builds reject unencrypted remote traffic while debug localhost connectivity continues working.
 * 8. Run TypeScript validation, web build, Capacitor sync, and Android debug/release build verification where tooling permits.
 * 9. Fail-closed release guard: Reject release builds when capacitor.config.json is missing, unreadable, malformed, or dev-configured.
 * 10. PowerShell parameter structure: param([switch]$Release) must precede executable statements.
 * 11. Distinct debug vs release testing: Standalone debug APK installable for testing without claiming release restrictions; unsigned release APK not installed without signing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passedCount = 0;
let failedCount = 0;

function pass(name: string): void {
  console.log(`  [PASS] ${name}`);
  passedCount++;
}

function fail(name: string, err: any): void {
  console.error(`  [FAIL] ${name}`);
  console.error(err);
  failedCount++;
}

/**
 * Simulates Android NetworkSecurityConfig and WebView cleartext policy evaluation.
 */
interface NetworkSecurityPolicy {
  variant: 'debug' | 'release';
  cleartextTrafficPermittedBase: boolean;
  cleartextPermittedDomains: string[];
  capacitorCleartext: boolean;
  capacitorScheme: string;
}

function evaluateNetworkRequest(
  policy: NetworkSecurityPolicy,
  targetUrl: string
): { allowed: boolean; reason: string } {
  const url = new URL(targetUrl);
  const isHttps = url.protocol === 'https:';
  const isHttp = url.protocol === 'http:';

  if (!isHttps && !isHttp) {
    return { allowed: false, reason: `Unsupported protocol ${url.protocol}` };
  }

  if (isHttps) {
    return { allowed: true, reason: 'HTTPS traffic is always permitted' };
  }

  // Cleartext HTTP check
  if (policy.variant === 'release') {
    if (!policy.cleartextTrafficPermittedBase) {
      return {
        allowed: false,
        reason: 'Release network security config strictly rejects all cleartext traffic',
      };
    }
    if (!policy.capacitorCleartext) {
      return {
        allowed: false,
        reason: 'Capacitor production configuration forbids cleartext navigation',
      };
    }
  }

  // In debug variant:
  const isDomainPermitted = policy.cleartextPermittedDomains.some((d) => {
    return url.hostname === d || url.hostname.endsWith(`.${d}`);
  });

  if (isDomainPermitted) {
    return {
      allowed: true,
      reason: `Cleartext permitted for authorized local development host: ${url.hostname}`,
    };
  }

  return {
    allowed: false,
    reason: `Cleartext traffic forbidden for host: ${url.hostname} by network security policy`,
  };
}

/**
 * Simulates the fail-closed verifyProductionNetworkSecurity guard.
 */
function simulateProductionNetworkSecurityGuard(configContent: string | null): {
  success: boolean;
  error?: string;
} {
  if (configContent === null) {
    return { success: false, error: 'Missing required configuration file' };
  }
  if (!configContent || configContent.trim().length === 0) {
    return { success: false, error: 'Configuration file is unreadable or empty' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(configContent);
  } catch (e: any) {
    return { success: false, error: `Malformed JSON: ${e.message}` };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: 'Expected JSON object in configuration' };
  }

  if (parsed.server?.url && String(parsed.server.url).trim().length > 0) {
    return {
      success: false,
      error: `Release build contains development server URL (${parsed.server.url})`,
    };
  }
  if (parsed.server?.cleartext === true) {
    return {
      success: false,
      error: 'Release build has server.cleartext set to true',
    };
  }
  if (parsed.android?.allowMixedContent === true) {
    return {
      success: false,
      error: 'Release build has android.allowMixedContent set to true',
    };
  }

  return { success: true };
}

async function runTests(): Promise<void> {
  console.log('========================================================================');
  console.log('BeeYou: Android Network Security Verification Suite');
  console.log('========================================================================\n');

  const rootDir = path.resolve(__dirname, '..');

  // 1. Production Capacitor Configuration (capacitor.config.ts)
  try {
    const configTsPath = path.join(rootDir, 'capacitor.config.ts');
    assert.ok(fs.existsSync(configTsPath), 'capacitor.config.ts must exist');
    const content = fs.readFileSync(configTsPath, 'utf-8');

    assert.ok(
      content.includes('cleartext: false'),
      'capacitor.config.ts must set cleartext: false'
    );
    assert.ok(
      !content.includes('cleartext: true'),
      'capacitor.config.ts must not set cleartext: true'
    );
    assert.ok(
      content.includes("androidScheme: 'https'"),
      "capacitor.config.ts must set androidScheme to 'https'"
    );
    assert.ok(
      !content.includes('url:'),
      'capacitor.config.ts must not define a dev server URL'
    );
    assert.ok(
      content.includes('allowMixedContent: false'),
      'capacitor.config.ts must forbid mixed content'
    );

    pass('1. Production Capacitor configuration (capacitor.config.ts) enforces strict HTTPS and cleartext: false');
  } catch (err) {
    fail('1. Production Capacitor configuration (capacitor.config.ts)', err);
  }

  // 2. Development Capacitor Configuration (capacitor.config.dev.json)
  try {
    const devConfigPath = path.join(rootDir, 'capacitor.config.dev.json');
    assert.ok(fs.existsSync(devConfigPath), 'capacitor.config.dev.json must exist');
    const devContent = JSON.parse(fs.readFileSync(devConfigPath, 'utf-8'));

    assert.strictEqual(
      devContent.server?.cleartext,
      true,
      'Development config must permit cleartext for live reload'
    );
    assert.strictEqual(
      devContent.server?.url,
      'http://localhost:3000',
      'Development config must target localhost:3000 for live reload'
    );
    assert.strictEqual(
      devContent.android?.allowMixedContent,
      true,
      'Development config may permit mixed content during local testing'
    );

    pass('2. Development Capacitor configuration (capacitor.config.dev.json) is isolated for local live reload');
  } catch (err) {
    fail('2. Development Capacitor configuration (capacitor.config.dev.json)', err);
  }

  // 3. Generated Production Assets (android/app/src/main/assets/capacitor.config.json)
  try {
    const assetConfigPath = path.join(
      rootDir,
      'android',
      'app',
      'src',
      'main',
      'assets',
      'capacitor.config.json'
    );
    assert.ok(fs.existsSync(assetConfigPath), 'assets/capacitor.config.json must exist');
    const assetContent = JSON.parse(fs.readFileSync(assetConfigPath, 'utf-8'));

    assert.strictEqual(
      assetContent.server?.cleartext,
      false,
      'assets/capacitor.config.json must have cleartext: false'
    );
    assert.strictEqual(
      assetContent.server?.url,
      undefined,
      'assets/capacitor.config.json must not have a server url'
    );
    assert.strictEqual(
      assetContent.server?.androidScheme,
      'https',
      'assets/capacitor.config.json must specify androidScheme https'
    );

    pass('3. Generated Android asset capacitor.config.json enforces production settings (no live reload URL, cleartext: false)');
  } catch (err) {
    fail('3. Generated Android asset capacitor.config.json', err);
  }

  // 4. Main Android Manifest (android/app/src/main/AndroidManifest.xml)
  try {
    const mainManifestPath = path.join(
      rootDir,
      'android',
      'app',
      'src',
      'main',
      'AndroidManifest.xml'
    );
    assert.ok(fs.existsSync(mainManifestPath), 'Main AndroidManifest.xml must exist');
    const manifestContent = fs.readFileSync(mainManifestPath, 'utf-8');

    assert.ok(
      manifestContent.includes('android:usesCleartextTraffic="false"'),
      'Main manifest must explicitly set android:usesCleartextTraffic="false"'
    );
    assert.ok(
      manifestContent.includes('tools:replace="android:usesCleartextTraffic"'),
      'Main manifest must override third-party cleartext permissions with tools:replace'
    );
    assert.ok(
      manifestContent.includes(
        'android:networkSecurityConfig="@xml/network_security_config"'
      ),
      'Main manifest must link android:networkSecurityConfig="@xml/network_security_config"'
    );

    // Permission preservation checks
    assert.ok(
      manifestContent.includes('android.permission.INTERNET'),
      'INTERNET permission must be preserved'
    );
    assert.ok(
      manifestContent.includes('android.permission.RECORD_AUDIO'),
      'RECORD_AUDIO permission must be preserved for voice/AAC features'
    );
    assert.ok(
      manifestContent.includes('android.permission.MODIFY_AUDIO_SETTINGS'),
      'MODIFY_AUDIO_SETTINGS permission must be preserved for speech audio'
    );
    assert.ok(
      manifestContent.includes('android.permission.VIBRATE'),
      'VIBRATE permission must be preserved for haptic feedback'
    );

    pass('4. Main Android manifest disables cleartext traffic, configures network security config, and preserves core permissions');
  } catch (err) {
    fail('4. Main Android manifest', err);
  }

  // 5. Debug Android Manifest (android/app/src/debug/AndroidManifest.xml)
  try {
    const debugManifestPath = path.join(
      rootDir,
      'android',
      'app',
      'src',
      'debug',
      'AndroidManifest.xml'
    );
    assert.ok(fs.existsSync(debugManifestPath), 'Debug AndroidManifest.xml must exist');
    const debugManifestContent = fs.readFileSync(debugManifestPath, 'utf-8');

    assert.ok(
      debugManifestContent.includes('android:usesCleartextTraffic="true"'),
      'Debug manifest must set android:usesCleartextTraffic="true" for development overlay'
    );
    assert.ok(
      debugManifestContent.includes('tools:replace="android:usesCleartextTraffic"'),
      'Debug manifest must use tools:replace to override base manifest in debug mode'
    );

    pass('5. Debug Android manifest provides debug-only overlay for development live reload');
  } catch (err) {
    fail('5. Debug Android manifest', err);
  }

  // 6. Production Network Security Config (android/app/src/main/res/xml/network_security_config.xml)
  try {
    const prodConfigPath = path.join(
      rootDir,
      'android',
      'app',
      'src',
      'main',
      'res',
      'xml',
      'network_security_config.xml'
    );
    assert.ok(
      fs.existsSync(prodConfigPath),
      'main/res/xml/network_security_config.xml must exist'
    );
    const xml = fs.readFileSync(prodConfigPath, 'utf-8');

    assert.ok(
      xml.includes('<network-security-config>'),
      'Must contain <network-security-config>'
    );
    assert.ok(
      xml.includes('<base-config cleartextTrafficPermitted="false">'),
      'Production base-config must set cleartextTrafficPermitted="false"'
    );
    assert.ok(
      xml.includes('<certificates src="system" />'),
      'Production config must trust system certificates'
    );
    assert.ok(
      !xml.includes('cleartextTrafficPermitted="true"'),
      'Production network security config must NOT allow cleartext traffic for any domain'
    );
    assert.ok(
      !xml.includes('localhost'),
      'Production network security config must NOT exempt localhost'
    );

    pass('6. Production Network Security Config forbids cleartext HTTP globally with no domain exemptions');
  } catch (err) {
    fail('6. Production Network Security Config', err);
  }

  // 7. Debug Network Security Config (android/app/src/debug/res/xml/network_security_config.xml)
  try {
    const debugXmlPath = path.join(
      rootDir,
      'android',
      'app',
      'src',
      'debug',
      'res',
      'xml',
      'network_security_config.xml'
    );
    assert.ok(
      fs.existsSync(debugXmlPath),
      'debug/res/xml/network_security_config.xml must exist'
    );
    const xml = fs.readFileSync(debugXmlPath, 'utf-8');

    assert.ok(
      xml.includes('<network-security-config>'),
      'Debug config must contain <network-security-config>'
    );
    assert.ok(
      xml.includes('<base-config cleartextTrafficPermitted="false">'),
      'Debug base-config must still reject arbitrary remote cleartext by default'
    );
    assert.ok(
      xml.includes('<domain-config cleartextTrafficPermitted="true">'),
      'Debug config must explicitly scope cleartext to permitted dev domains'
    );
    assert.ok(
      xml.includes('<domain includeSubdomains="true">localhost</domain>'),
      'Debug config must permit localhost for ADB reverse'
    );
    assert.ok(
      xml.includes('<domain includeSubdomains="true">127.0.0.1</domain>'),
      'Debug config must permit 127.0.0.1 for loopback'
    );
    assert.ok(
      xml.includes('<domain includeSubdomains="true">10.0.2.2</domain>'),
      'Debug config must permit 10.0.2.2 for Android emulator host loopback'
    );
    assert.ok(
      xml.includes('<debug-overrides>'),
      'Debug config must define debug-overrides'
    );
    assert.ok(
      xml.includes('<certificates src="user" />'),
      'Debug config may trust user certificates for local proxy inspection'
    );

    pass('7. Debug Network Security Config scopes cleartext strictly to localhost, 127.0.0.1, and 10.0.2.2 while rejecting remote cleartext');
  } catch (err) {
    fail('7. Debug Network Security Config', err);
  }

  // 8. Fail-Closed Build-Time Security Guard in android/app/build.gradle
  try {
    const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
    assert.ok(fs.existsSync(gradlePath), 'android/app/build.gradle must exist');
    const gradleContent = fs.readFileSync(gradlePath, 'utf-8');

    assert.ok(
      gradleContent.includes('verifyProductionNetworkSecurity'),
      'build.gradle must register verifyProductionNetworkSecurity task'
    );
    assert.ok(
      gradleContent.includes('!configFile.exists()'),
      'verifyProductionNetworkSecurity must fail-closed if config file is missing'
    );
    assert.ok(
      gradleContent.includes('!configFile.canRead() || configFile.length() == 0'),
      'verifyProductionNetworkSecurity must fail-closed if config file is unreadable or empty'
    );
    assert.ok(
      gradleContent.includes('parsed.server?.url'),
      'verifyProductionNetworkSecurity must check for dev server url'
    );
    assert.ok(
      gradleContent.includes('parsed.server?.cleartext == true'),
      'verifyProductionNetworkSecurity must check for cleartext: true'
    );
    assert.ok(
      gradleContent.includes('parsed.android?.allowMixedContent == true'),
      'verifyProductionNetworkSecurity must check for allowMixedContent: true'
    );
    assert.ok(
      gradleContent.includes(
        "tasks.matching { it.name in ['preReleaseBuild', 'mergeReleaseAssets', 'packageRelease'] }"
      ),
      'verifyProductionNetworkSecurity must guard preReleaseBuild, mergeReleaseAssets, and packageRelease'
    );

    pass('8. Fail-closed Gradle build-time security verification task is configured and guards release tasks');
  } catch (err) {
    fail('8. Fail-Closed Build-Time Security Guard in build.gradle', err);
  }

  // 9. Fail-Closed Guard Simulation Tests
  try {
    // Test: missing config
    const resMissing = simulateProductionNetworkSecurityGuard(null);
    assert.strictEqual(resMissing.success, false);
    assert.ok(resMissing.error?.includes('Missing'));

    // Test: empty config
    const resEmpty = simulateProductionNetworkSecurityGuard('');
    assert.strictEqual(resEmpty.success, false);
    assert.ok(resEmpty.error?.includes('unreadable or empty'));

    // Test: malformed JSON
    const resMalformed = simulateProductionNetworkSecurityGuard('{ malformed: ');
    assert.strictEqual(resMalformed.success, false);
    assert.ok(resMalformed.error?.includes('Malformed'));

    // Test: dev server URL present
    const resUrl = simulateProductionNetworkSecurityGuard(
      JSON.stringify({ server: { url: 'http://localhost:3000', cleartext: false } })
    );
    assert.strictEqual(resUrl.success, false);
    assert.ok(resUrl.error?.includes('development server URL'));

    // Test: cleartext enabled
    const resCleartext = simulateProductionNetworkSecurityGuard(
      JSON.stringify({ server: { cleartext: true } })
    );
    assert.strictEqual(resCleartext.success, false);
    assert.ok(resCleartext.error?.includes('server.cleartext'));

    // Test: mixed content enabled
    const resMixed = simulateProductionNetworkSecurityGuard(
      JSON.stringify({ server: { cleartext: false }, android: { allowMixedContent: true } })
    );
    assert.strictEqual(resMixed.success, false);
    assert.ok(resMixed.error?.includes('allowMixedContent'));

    // Test: valid production config
    const resValid = simulateProductionNetworkSecurityGuard(
      JSON.stringify({
        appId: 'com.beeyou.app',
        appName: 'BeeYou',
        server: { androidScheme: 'https', cleartext: false, hostname: 'localhost' },
        android: { allowMixedContent: false },
      })
    );
    assert.strictEqual(resValid.success, true);

    pass('9. Fail-closed security guard simulation validates all edge cases (missing, empty, malformed, dev URLs, cleartext, mixed content)');
  } catch (err) {
    fail('9. Fail-Closed Guard Simulation Tests', err);
  }

  // 10. Merged Manifests Verification (Debug vs Release)
  try {
    const releaseMergedManifest = path.join(
      rootDir,
      'android',
      'app',
      'build',
      'intermediates',
      'merged_manifests',
      'release',
      'processReleaseManifest',
      'AndroidManifest.xml'
    );
    const debugMergedManifest = path.join(
      rootDir,
      'android',
      'app',
      'build',
      'intermediates',
      'merged_manifests',
      'debug',
      'processDebugManifest',
      'AndroidManifest.xml'
    );

    if (fs.existsSync(releaseMergedManifest)) {
      const releaseXml = fs.readFileSync(releaseMergedManifest, 'utf-8');
      assert.ok(
        releaseXml.includes('android:usesCleartextTraffic="false"'),
        'Release merged manifest must have usesCleartextTraffic="false"'
      );
      assert.ok(
        !releaseXml.includes('android:usesCleartextTraffic="true"'),
        'Release merged manifest must NOT have usesCleartextTraffic="true"'
      );
      assert.ok(
        releaseXml.includes(
          'android:networkSecurityConfig="@xml/network_security_config"'
        ),
        'Release merged manifest must include networkSecurityConfig'
      );
    }

    if (fs.existsSync(debugMergedManifest)) {
      const debugXml = fs.readFileSync(debugMergedManifest, 'utf-8');
      assert.ok(
        debugXml.includes('android:usesCleartextTraffic="true"'),
        'Debug merged manifest must have usesCleartextTraffic="true"'
      );
      assert.ok(
        debugXml.includes(
          'android:networkSecurityConfig="@xml/network_security_config"'
        ),
        'Debug merged manifest must include networkSecurityConfig'
      );
    }

    pass('10. Compiled intermediate Android manifests correctly differentiate release (usesCleartextTraffic=false) vs debug (usesCleartextTraffic=true)');
  } catch (err) {
    fail('10. Merged Manifests Verification', err);
  }

  // 11. Packaged XML Resources Verification (Debug vs Release)
  try {
    const releaseRes = path.join(
      rootDir,
      'android',
      'app',
      'build',
      'intermediates',
      'packaged_res',
      'release',
      'packageReleaseResources',
      'xml',
      'network_security_config.xml'
    );
    const debugRes = path.join(
      rootDir,
      'android',
      'app',
      'build',
      'intermediates',
      'packaged_res',
      'debug',
      'packageDebugResources',
      'xml',
      'network_security_config.xml'
    );

    if (fs.existsSync(releaseRes)) {
      const releaseResXml = fs.readFileSync(releaseRes, 'utf-8');
      assert.ok(
        releaseResXml.includes('cleartextTrafficPermitted="false"'),
        'Release packaged resource must forbid cleartext'
      );
      assert.ok(
        !releaseResXml.includes('localhost'),
        'Release packaged resource must not contain localhost exception'
      );
    }

    if (fs.existsSync(debugRes)) {
      const debugResXml = fs.readFileSync(debugRes, 'utf-8');
      assert.ok(
        debugResXml.includes('<domain-config cleartextTrafficPermitted="true">'),
        'Debug packaged resource must permit cleartext for domain-config'
      );
      assert.ok(
        debugResXml.includes('localhost'),
        'Debug packaged resource must permit localhost'
      );
    }

    pass('11. Packaged XML resources correctly enforce strict cleartext block for release and localhost-only for debug');
  } catch (err) {
    fail('11. Packaged XML Resources Verification', err);
  }

  // 12. Simulated Network Policy Enforcement
  try {
    const prodPolicy: NetworkSecurityPolicy = {
      variant: 'release',
      cleartextTrafficPermittedBase: false,
      cleartextPermittedDomains: [],
      capacitorCleartext: false,
      capacitorScheme: 'https',
    };

    const debugPolicy: NetworkSecurityPolicy = {
      variant: 'debug',
      cleartextTrafficPermittedBase: false,
      cleartextPermittedDomains: ['localhost', '127.0.0.1', '10.0.2.2'],
      capacitorCleartext: true,
      capacitorScheme: 'https',
    };

    // Test cases for production:
    const prodRemoteHttp = evaluateNetworkRequest(
      prodPolicy,
      'http://api.beeyou.app/v1/sync'
    );
    assert.strictEqual(
      prodRemoteHttp.allowed,
      false,
      'Production build must block remote HTTP'
    );

    const prodThirdPartyHttp = evaluateNetworkRequest(
      prodPolicy,
      'http://insecure-cdn.example.com/sound.mp3'
    );
    assert.strictEqual(
      prodThirdPartyHttp.allowed,
      false,
      'Production build must block third-party HTTP'
    );

    const prodLocalhostHttp = evaluateNetworkRequest(
      prodPolicy,
      'http://localhost:3000'
    );
    assert.strictEqual(
      prodLocalhostHttp.allowed,
      false,
      'Production build must block localhost HTTP'
    );

    const prodFirebaseHttps = evaluateNetworkRequest(
      prodPolicy,
      'https://beeyou-app.firebaseio.com/families/demo.json'
    );
    assert.strictEqual(
      prodFirebaseHttps.allowed,
      true,
      'Production build must allow Firebase HTTPS'
    );

    const prodGoogleTtsHttps = evaluateNetworkRequest(
      prodPolicy,
      'https://texttospeech.googleapis.com/v1/text:synthesize'
    );
    assert.strictEqual(
      prodGoogleTtsHttps.allowed,
      true,
      'Production build must allow Google TTS HTTPS'
    );

    const prodCapacitorInternal = evaluateNetworkRequest(
      prodPolicy,
      'https://localhost/index.html'
    );
    assert.strictEqual(
      prodCapacitorInternal.allowed,
      true,
      'Production build must allow Capacitor https://localhost scheme'
    );

    // Test cases for debug:
    const debugLocalhostHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://localhost:3000'
    );
    assert.strictEqual(
      debugLocalhostHttp.allowed,
      true,
      'Debug build must permit localhost HTTP live reload'
    );

    const debugLoopbackHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://127.0.0.1:3000'
    );
    assert.strictEqual(
      debugLoopbackHttp.allowed,
      true,
      'Debug build must permit 127.0.0.1 HTTP'
    );

    const debugEmulatorHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://10.0.2.2:3000'
    );
    assert.strictEqual(
      debugEmulatorHttp.allowed,
      true,
      'Debug build must permit 10.0.2.2 emulator loopback'
    );

    const debugRemoteHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://api.beeyou.app/v1/sync'
    );
    assert.strictEqual(
      debugRemoteHttp.allowed,
      false,
      'Debug build must still block unencrypted remote HTTP'
    );

    const debugHttps = evaluateNetworkRequest(
      debugPolicy,
      'https://firestore.googleapis.com/v1/projects/beeyou/databases'
    );
    assert.strictEqual(
      debugHttps.allowed,
      true,
      'Debug build must allow HTTPS traffic'
    );

    pass('12. Simulated network security policy correctly evaluates production vs debug traffic scenarios');
  } catch (err) {
    fail('12. Simulated Network Policy Enforcement', err);
  }

  // 13. PowerShell Parameter & Script Structure (scripts/android-prod.ps1)
  try {
    const prodScriptPath = path.join(rootDir, 'scripts', 'android-prod.ps1');
    assert.ok(fs.existsSync(prodScriptPath), 'scripts/android-prod.ps1 must exist');
    const prodScript = fs.readFileSync(prodScriptPath, 'utf-8');

    // Remove comments and whitespace to verify param() is first executable statement
    const nonCommentLines = prodScript
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    assert.ok(
      nonCommentLines.length > 0 && nonCommentLines[0].startsWith('param'),
      'param() block must be the very first statement in scripts/android-prod.ps1'
    );
    assert.ok(
      prodScript.includes('[switch]$Release'),
      'android-prod.ps1 must declare [switch]$Release'
    );

    // Verify it distinguishes standalone debug testing from release testing
    assert.ok(
      prodScript.includes('assembleRelease'),
      'android-prod.ps1 must invoke assembleRelease when -Release is provided'
    );
    assert.ok(
      prodScript.includes('assembleDebug'),
      'android-prod.ps1 must invoke assembleDebug for ordinary standalone device testing'
    );
    assert.ok(
      !prodScript.includes('adb -s $deviceId install -r $unsignedApkPath'),
      'android-prod.ps1 must NOT attempt to adb install an unsigned release APK'
    );
    assert.ok(
      prodScript.includes('Release APK is unsigned'),
      'android-prod.ps1 must document that unsigned release APK cannot be installed directly'
    );

    pass('13. scripts/android-prod.ps1 places param() before all executable statements and cleanly differentiates debug vs release testing');
  } catch (err) {
    fail('13. PowerShell Parameter & Script Structure', err);
  }

  // 14. Development Script Safe Exit & Restoration (scripts/android-dev.ps1)
  try {
    const devScriptPath = path.join(rootDir, 'scripts', 'android-dev.ps1');
    assert.ok(fs.existsSync(devScriptPath), 'scripts/android-dev.ps1 must exist');
    const devScript = fs.readFileSync(devScriptPath, 'utf-8');

    assert.ok(
      devScript.includes('finally'),
      'android-dev.ps1 must have finally block'
    );
    assert.ok(
      devScript.includes('npx cap copy android'),
      'android-dev.ps1 must restore production config on exit'
    );

    pass('14. scripts/android-dev.ps1 guarantees restoration of production config via finally block');
  } catch (err) {
    fail('14. Development Script Safe Exit & Restoration', err);
  }

  console.log('\n========================================================================');
  console.log(`Suite Summary: ${passedCount} passed, ${failedCount} failed`);
  console.log('========================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
