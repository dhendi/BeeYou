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

# Step 1: Build web assets
Write-Host "Building production web assets..."
npm run build

# Step 2: Sync Capacitor using production capacitor.config.ts
Write-Host "Syncing Capacitor with production bundled assets..."
npx cap sync android

# Step 3: Compile native Android debug APK
Write-Host "Compiling native Android APK..."
Push-Location android
try {
    .\gradlew.bat assembleDebug
} finally {
    Pop-Location
}

# Step 4: Install to device if connected
$devices = adb devices | Where-Object { $_ -match "\tdevice$" }
if ($devices) {
    $deviceId = ($devices[0] -split "\t")[0]
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    Write-Host "Installing production APK on $deviceId..."
    adb -s $deviceId install -r $apkPath
    Write-Host "Launching BeeYou..."
    adb -s $deviceId shell am start -n com.beeyou.app/com.beeyou.app.MainActivity
    Write-Host "=== Production Build Installed and Running ==="
} else {
    Write-Host "Build completed successfully. No Android device currently connected to install."
    Write-Host "APK path: android\app\build\outputs\apk\debug\app-debug.apk"
}
