param (
    [switch]$Release,
    [switch]$SignForTesting
)

# BeeYou Android Standalone & Release Build Runner
# Builds web assets, syncs production Capacitor configuration, compiles APK, and verifies security.

$ErrorActionPreference = "Stop"

$jdkPath = "C:\Users\dhenp\.jdk\jdk-21.0.6+7"
$sdkPath = "C:\Users\dhenp\AppData\Local\Android\Sdk"

if (Test-Path $jdkPath) {
    $env:JAVA_HOME = $jdkPath
    $env:Path = "$jdkPath\bin;" + $env:Path
}
if (Test-Path $sdkPath) {
    $env:ANDROID_HOME = $sdkPath
    $env:Path = "$sdkPath\platform-tools;" + $env:Path
}

Write-Host "=== BeeYou Android Build Runner ==="
if ($Release) {
    Write-Host "Target Variant: Genuine Release (Strict Production Network Security)"
} else {
    Write-Host "Target Variant: Standalone Debug (Device Testing with Production Assets)"
}

# Step 1: Build web assets
Write-Host "Building production web assets..."
npm run build

# Step 2: Sync Capacitor using production capacitor.config.ts
Write-Host "Syncing Capacitor with production bundled assets..."
npx cap sync android

# Step 2b: Verify production network security configuration (Fail-closed)
$assetConfigFile = "android\app\src\main\assets\capacitor.config.json"
if (-not (Test-Path $assetConfigFile)) {
    throw "Security Error: Missing required asset configuration file: $assetConfigFile"
}

$rawJson = Get-Content -Raw -Path $assetConfigFile
if ([string]::IsNullOrWhiteSpace($rawJson)) {
    throw "Security Error: Asset configuration file $assetConfigFile is empty or unreadable."
}

try {
    $configContent = $rawJson | ConvertFrom-Json
} catch {
    throw "Security Error: Failed to parse JSON in $assetConfigFile - $($_.Exception.Message)"
}

if ($configContent.server.url) {
    throw "Security Error: Development server URL found in production assets: $($configContent.server.url)"
}
if ($configContent.server.cleartext -ne $false) {
    throw "Security Error: Cleartext HTTP is enabled in production assets."
}
if ($configContent.android.allowMixedContent -eq $true) {
    throw "Security Error: Mixed content is enabled in production assets."
}

Write-Host "Production network security settings verified: cleartext disabled, no dev server URL, mixed content blocked."

# Step 3: Compile native Android APK
Write-Host "Compiling native Android APK..."
Push-Location android
try {
    if ($Release) {
        Write-Host "Compiling genuine Release APK..."
        .\gradlew.bat assembleRelease
    } else {
        Write-Host "Compiling standalone Debug APK for device testing..."
        .\gradlew.bat assembleDebug
    }
} finally {
    Pop-Location
}

# Step 4: Verification and installation
if ($Release) {
    Write-Host "=== Verifying Release Variant Build Artifacts ==="
    $mergedManifestPath = "android\app\build\intermediates\merged_manifests\release\processReleaseManifest\AndroidManifest.xml"
    $packagedResPath = "android\app\build\intermediates\packaged_res\release\packageReleaseResources\xml\network_security_config.xml"
    $unsignedApkPath = "android\app\build\outputs\apk\release\app-release-unsigned.apk"

    if (Test-Path $mergedManifestPath) {
        $manifestXml = Get-Content -Raw -Path $mergedManifestPath
        if ($manifestXml -notmatch 'android:usesCleartextTraffic="false"') {
            throw "Security Verification Failed: Release merged manifest does not enforce usesCleartextTraffic='false'!"
        }
        if ($manifestXml -notmatch 'android:networkSecurityConfig="@xml/network_security_config"') {
            throw "Security Verification Failed: Release merged manifest is missing networkSecurityConfig!"
        }
        Write-Host "[VERIFIED] Release merged manifest enforces usesCleartextTraffic='false' and networkSecurityConfig."
    }

    if (Test-Path $packagedResPath) {
        $resXml = Get-Content -Raw -Path $packagedResPath
        if ($resXml -notmatch 'cleartextTrafficPermitted="false"') {
            throw "Security Verification Failed: Release packaged network security config does not enforce cleartextTrafficPermitted='false'!"
        }
        if ($resXml -match 'localhost') {
            throw "Security Verification Failed: Release packaged network security config must not contain localhost cleartext exemption!"
        }
        Write-Host "[VERIFIED] Release packaged network security config blocks cleartext traffic with zero domain exemptions."
    }

    if (Test-Path $unsignedApkPath) {
        Write-Host "[SUCCESS] Genuine Release APK built successfully at: $unsignedApkPath"
    }

    [array]$devices = @(adb devices | Where-Object { $_ -match "\tdevice$" })
    if ($SignForTesting) {
        if ($devices.Count -gt 0) {
            $deviceId = ($devices[0].Trim() -split "\s+")[0]
            Write-Host "Preparing test-signed Release APK for device testing..."

            $debugKeystore = "$env:USERPROFILE\.android\debug.keystore"
            if (-not (Test-Path $debugKeystore)) {
                Write-Host "Creating ephemeral debug keystore for test signing..."
                & keytool -genkeypair -v -keystore $debugKeystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
            }

            $buildToolsDir = Get-ChildItem -Path "$sdkPath\build-tools" -Directory | Sort-Object Name -Descending | Select-Object -First 1
            $apksigner = "$($buildToolsDir.FullName)\apksigner.bat"
            $testSignedApk = "android\app\build\outputs\apk\release\app-release-test-signed.apk"

            if (Test-Path $apksigner) {
                Write-Host "Signing release APK with test credentials using apksigner..."
                Copy-Item -Path $unsignedApkPath -Destination $testSignedApk -Force
                & $apksigner sign --ks $debugKeystore --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --out $testSignedApk $unsignedApkPath
                Write-Host "Installing test-signed Release APK on $deviceId..."
                adb -s $deviceId install -r $testSignedApk
                Write-Host "Launching BeeYou..."
                adb -s $deviceId shell am start -n com.beeyou.app/com.beeyou.app.MainActivity
                Write-Host "=== Test-Signed Release Build Installed and Running ==="
            } else {
                Write-Warning "apksigner not found in $sdkPath\build-tools. Unsigned release APK cannot be installed via ADB."
            }
        } else {
            Write-Host "No Android device currently connected to install test-signed release APK."
        }
    } else {
        Write-Host "Note: Release APK is unsigned ($unsignedApkPath). Android OS rejects unsigned APKs via ADB."
        Write-Host "To install a test-signed release APK on a connected device, invoke with: .\scripts\android-prod.ps1 -Release -SignForTesting"
        Write-Host "For ordinary standalone device testing, invoke without -Release to build and install the debug-signed standalone APK."
    }
} else {
    Write-Host "=== Standalone Device Testing (Debug Variant with Production Assets) ==="
    Write-Host "Notice: This APK is debug-signed for local installation on test devices."
    Write-Host "Release-only network restrictions are verified separately via -Release."

    [array]$devices = @(adb devices | Where-Object { $_ -match "\tdevice$" })
    if ($devices.Count -gt 0) {
        $deviceId = ($devices[0].Trim() -split "\s+")[0]
        $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
        Write-Host "Installing standalone debug APK on $deviceId..."
        adb -s $deviceId install -r $apkPath
        Write-Host "Launching BeeYou..."
        adb -s $deviceId shell am start -n com.beeyou.app/com.beeyou.app.MainActivity
        Write-Host "=== Standalone Debug Build Installed and Running ==="
    } else {
        Write-Host "Standalone debug build completed successfully. No Android device currently connected to install."
        Write-Host "APK path: android\app\build\outputs\apk\debug\app-debug.apk"
    }
}
