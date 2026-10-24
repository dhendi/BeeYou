# BeeYou Android Production Standalone Build & Deploy Runner
# Builds web assets, syncs production Capacitor configuration, compiles APK, and installs on device.

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

Write-Host "=== BeeYou Android Production Build ==="

param (
    [switch]$Release
)

# Step 1: Build web assets
Write-Host "Building production web assets..."
npm run build

# Step 2: Sync Capacitor using production capacitor.config.ts
Write-Host "Syncing Capacitor with production bundled assets..."
npx cap sync android

# Step 2b: Verify production network security configuration
$assetConfigFile = "android\app\src\main\assets\capacitor.config.json"
if (Test-Path $assetConfigFile) {
    $configContent = Get-Content -Raw -Path $assetConfigFile | ConvertFrom-Json
    if ($configContent.server.url) {
        throw "Security Error: Development server URL found in production assets: $($configContent.server.url)"
    }
    if ($configContent.server.cleartext -ne $false) {
        throw "Security Error: Cleartext HTTP is enabled in production assets."
    }
    Write-Host "Production network security settings verified: cleartext disabled, no dev server URL."
} else {
    throw "Security Error: $assetConfigFile was not generated."
}

# Step 3: Compile native Android APK
Write-Host "Compiling native Android APK..."
Push-Location android
try {
    if ($Release) {
        Write-Host "Building Release APK..."
        .\gradlew.bat assembleRelease
    } else {
        Write-Host "Building Debug APK for device testing..."
        .\gradlew.bat assembleDebug
    }
} finally {
    Pop-Location
}

# Step 4: Install to device if connected
[array]$devices = @(adb devices | Where-Object { $_ -match "\tdevice$" })
if ($devices.Count -gt 0) {
    $deviceId = ($devices[0].Trim() -split "\s+")[0]
    $apkPath = if ($Release) { "android\app\build\outputs\apk\release\app-release-unsigned.apk" } else { "android\app\build\outputs\apk\debug\app-debug.apk" }
    Write-Host "Installing production APK on $deviceId..."
    adb -s $deviceId install -r $apkPath
    Write-Host "Launching BeeYou..."
    adb -s $deviceId shell am start -n com.beeyou.app/com.beeyou.app.MainActivity
    Write-Host "=== Production Build Installed and Running ==="
} else {
    Write-Host "Build completed successfully. No Android device currently connected to install."
    Write-Host "APK path: android\app\build\outputs\apk\debug\app-debug.apk"
}
