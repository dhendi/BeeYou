# BeeYou Android Live Reload Development Runner
# Sets up ADB reverse forwarding, development config, and starts the local dev server.

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

Write-Host "=== BeeYou Android Live Reload Development Environment ==="

# Check connected device
$devices = adb devices | Where-Object { $_ -match "\tdevice$" }
if (-not $devices) {
    Write-Warning "No authorized Android device detected via ADB."
    Write-Host "Ensure USB debugging is enabled and the phone is unlocked."
    exit 1
}

$deviceId = ($devices[0] -split "\t")[0]
Write-Host "Target Device: $deviceId"

# Reverse port 3000 and 3001 over USB
Write-Host "Setting up ADB reverse port forwarding (tcp:3000, tcp:3001)..."
adb -s $deviceId reverse tcp:3000 tcp:3000
adb -s $deviceId reverse tcp:3001 tcp:3001

# Copy development configuration to Android assets
$devConfig = "capacitor.config.dev.json"
$targetAssetConfig = "android\app\src\main\assets\capacitor.config.json"

if (Test-Path $devConfig) {
    Write-Host "Applying development configuration with live reload (http://localhost:3000)..."
    Copy-Item -Path $devConfig -Destination $targetAssetConfig -Force
}

# Compile and install live-reload debug build if needed
Write-Host "Compiling and updating Android debug app..."
Push-Location android
try {
    .\gradlew.bat assembleDebug
} finally {
    Pop-Location
}

$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "Installing live reload build on $deviceId..."
    adb -s $deviceId install -r $apkPath
}

# Launch the app
Write-Host "Launching BeeYou on device..."
adb -s $deviceId shell am start -n com.beeyou.app/com.beeyou.app.MainActivity

Write-Host "=== Live Reload Active ==="
Write-Host "Any React, CSS, or TypeScript changes will update automatically on your phone."
Write-Host "Starting Vite development server on port 3000 (Press Ctrl+C to stop)..."

try {
    npm run dev
} finally {
    Write-Host "Restoring production configuration..."
    npx cap copy android
}
