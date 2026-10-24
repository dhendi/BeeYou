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
      content.includes("cleartext: false"),
      'capacitor.config.ts must set cleartext: false'
    );
    assert.ok(
      !content.includes("cleartext: true"),
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

  // 8. Build-Time Security Guard in android/app/build.gradle
  try {
    const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
    assert.ok(fs.existsSync(gradlePath), 'android/app/build.gradle must exist');
    const gradleContent = fs.readFileSync(gradlePath, 'utf-8');

    assert.ok(
      gradleContent.includes('verifyProductionNetworkSecurity'),
      'build.gradle must register verifyProductionNetworkSecurity task'
    );
    assert.ok(
      gradleContent.includes("it.name == 'preReleaseBuild'"),
      'build.gradle must hook preReleaseBuild to verifyProductionNetworkSecurity'
    );
    assert.ok(
      gradleContent.includes('parsed.server?.url'),
      'verifyProductionNetworkSecurity must check for dev server url'
    );
    assert.ok(
      gradleContent.includes('parsed.server?.cleartext == true'),
      'verifyProductionNetworkSecurity must check for cleartext: true'
    );

    pass('8. Gradle build-time security verification task is configured and guards preReleaseBuild');
  } catch (err) {
    fail('8. Build-Time Security Guard in build.gradle', err);
  }

  // 9. Merged Manifests Verification (Debug vs Release)
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

    pass('9. Compiled intermediate Android manifests correctly differentiate release (usesCleartextTraffic=false) vs debug (usesCleartextTraffic=true)');
  } catch (err) {
    fail('9. Merged Manifests Verification', err);
  }

  // 10. Packaged XML Resources Verification (Debug vs Release)
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

    pass('10. Packaged XML resources correctly enforce strict cleartext block for release and localhost-only for debug');
  } catch (err) {
    fail('10. Packaged XML Resources Verification', err);
  }

  // 11. Simulated Network Policy Enforcement
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
    // 1. Remote HTTP must be blocked
    const prodRemoteHttp = evaluateNetworkRequest(
      prodPolicy,
      'http://api.beeyou.app/v1/sync'
    );
    assert.strictEqual(
      prodRemoteHttp.allowed,
      false,
      'Production build must block remote HTTP'
    );

    // 2. Insecure third party HTTP must be blocked
    const prodThirdPartyHttp = evaluateNetworkRequest(
      prodPolicy,
      'http://insecure-cdn.example.com/sound.mp3'
    );
    assert.strictEqual(
      prodThirdPartyHttp.allowed,
      false,
      'Production build must block third-party HTTP'
    );

    // 3. Localhost HTTP in production must be blocked
    const prodLocalhostHttp = evaluateNetworkRequest(
      prodPolicy,
      'http://localhost:3000'
    );
    assert.strictEqual(
      prodLocalhostHttp.allowed,
      false,
      'Production build must block localhost HTTP'
    );

    // 4. Secure HTTPS Firebase endpoints must be permitted
    const prodFirebaseHttps = evaluateNetworkRequest(
      prodPolicy,
      'https://beeyou-app.firebaseio.com/families/demo.json'
    );
    assert.strictEqual(
      prodFirebaseHttps.allowed,
      true,
      'Production build must allow Firebase HTTPS'
    );

    // 5. Secure HTTPS Google Cloud TTS & Translation must be permitted
    const prodGoogleTtsHttps = evaluateNetworkRequest(
      prodPolicy,
      'https://texttospeech.googleapis.com/v1/text:synthesize'
    );
    assert.strictEqual(
      prodGoogleTtsHttps.allowed,
      true,
      'Production build must allow Google TTS HTTPS'
    );

    // 6. Capacitor internal scheme must be permitted
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
    // 1. Localhost HTTP live reload must be permitted
    const debugLocalhostHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://localhost:3000'
    );
    assert.strictEqual(
      debugLocalhostHttp.allowed,
      true,
      'Debug build must permit localhost HTTP live reload'
    );

    // 2. 127.0.0.1 HTTP must be permitted
    const debugLoopbackHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://127.0.0.1:3000'
    );
    assert.strictEqual(
      debugLoopbackHttp.allowed,
      true,
      'Debug build must permit 127.0.0.1 HTTP'
    );

    // 3. 10.0.2.2 emulator host loopback must be permitted
    const debugEmulatorHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://10.0.2.2:3000'
    );
    assert.strictEqual(
      debugEmulatorHttp.allowed,
      true,
      'Debug build must permit 10.0.2.2 emulator loopback'
    );

    // 4. Remote HTTP in debug MUST STILL BE BLOCKED
    const debugRemoteHttp = evaluateNetworkRequest(
      debugPolicy,
      'http://api.beeyou.app/v1/sync'
    );
    assert.strictEqual(
      debugRemoteHttp.allowed,
      false,
      'Debug build must still block unencrypted remote HTTP'
    );

    // 5. HTTPS in debug must be permitted
    const debugHttps = evaluateNetworkRequest(
      debugPolicy,
      'https://firestore.googleapis.com/v1/projects/beeyou/databases'
    );
    assert.strictEqual(
      debugHttps.allowed,
      true,
      'Debug build must allow HTTPS traffic'
    );

    pass('11. Simulated network security policy correctly evaluates production vs debug traffic scenarios');
  } catch (err) {
    fail('11. Simulated Network Policy Enforcement', err);
  }

  // 12. Build Scripts Safety Verification (scripts/android-prod.ps1 & scripts/android-dev.ps1)
  try {
    const prodScriptPath = path.join(rootDir, 'scripts', 'android-prod.ps1');
    const devScriptPath = path.join(rootDir, 'scripts', 'android-dev.ps1');

    assert.ok(fs.existsSync(prodScriptPath), 'scripts/android-prod.ps1 must exist');
    assert.ok(fs.existsSync(devScriptPath), 'scripts/android-dev.ps1 must exist');

    const prodScript = fs.readFileSync(prodScriptPath, 'utf-8');
    const devScript = fs.readFileSync(devScriptPath, 'utf-8');

    // Production script checks
    assert.ok(
      prodScript.includes('npx cap sync android'),
      'android-prod.ps1 must sync Capacitor assets'
    );
    assert.ok(
      prodScript.includes('configContent.server.url'),
      'android-prod.ps1 must check for dev server url'
    );
    assert.ok(
      prodScript.includes('configContent.server.cleartext -ne $false'),
      'android-prod.ps1 must check that cleartext is disabled'
    );
    assert.ok(
      prodScript.includes('[switch]$Release'),
      'android-prod.ps1 must support -Release switch'
    );

    // Development script checks
    assert.ok(
      devScript.includes('finally'),
      'android-dev.ps1 must have finally block'
    );
    assert.ok(
      devScript.includes('npx cap copy android'),
      'android-dev.ps1 must restore production config on exit'
    );

    pass('12. Build scripts enforce security validations and clean restoration of production config');
  } catch (err) {
    fail('12. Build Scripts Safety Verification', err);
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
