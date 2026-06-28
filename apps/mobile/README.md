# Soundscape Mobile — Build & Submission Runbook

Capacitor 8 wrapper for iOS and Android.  
App ID: `world.soundscape.mobile` — App Name: `Soundscape`  
These values are baked into `capacitor.config.ts` and become permanent once the first store listing is created. Confirm before submitting.

---

## USER ACTIONS

The following steps require a human and cannot be automated:

- Install the native toolchains listed in [Prerequisites](#prerequisites)
- Generate the native projects (`cap add ios`, `cap add android`)
- Supply the icon source file (`apps/mobile/assets/icon.png`)
- Configure signing (Apple cert + provisioning profile; Android upload keystore)
- Create the three accounts (Apple Developer, Google Play, Apple TestFlight is included)
- Perform the on-device smoke test listed in [Real-Device Smoke Test](#real-device-smoke-test)

---

## Prerequisites

These are one-time installs. The Capacitor CLI and project dependencies install automatically via `pnpm install`.

### iOS

- **Xcode** — present on this machine (Xcode 26.3). Keep it updated via the Mac App Store.
- **CocoaPods** — **not installed**. Required for `cap add ios` and `cap sync` on iOS.

  ```bash
  brew install cocoapods
  ```

  Or via RubyGems if you prefer the system Ruby:

  ```bash
  sudo gem install cocoapods
  ```

### Android

- **Android Studio** (recommended) or the Android command-line tools.  
  Download: <https://developer.android.com/studio>  
  After installing, open SDK Manager and install the latest stable SDK platform + build tools.

- Set environment variables (add to `~/.zshrc` or `~/.bash_profile`):

  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export ANDROID_SDK_ROOT=$ANDROID_HOME
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
  ```

  Accept all SDK licenses:

  ```bash
  sdkmanager --licenses
  ```

- **JDK 21** — this machine has JDK 22, but the Android Gradle Plugin requires JDK 21. Install Temurin 21:

  ```bash
  brew install --cask temurin@21
  ```

  Then point `JAVA_HOME` at it for Android builds (add to your shell profile or set per-session before Gradle commands):

  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 21)
  ```

---

## First Build

Run from the **repo root**:

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Build the web app and bundle audio/model assets into build/
pnpm --filter @soundscape/mobile run prepare:web

# 3. Generate native projects (run once; commits ios/ and android/ to version control)
pnpm --filter @soundscape/mobile exec cap add ios
pnpm --filter @soundscape/mobile exec cap add android

# 4. Sync web build + plugins into both native projects
pnpm --filter @soundscape/mobile exec cap sync

# 5. Open in Xcode to run on simulator or device
pnpm --filter @soundscape/mobile exec cap open ios

# 6. Open in Android Studio to run on emulator or device
pnpm --filter @soundscape/mobile exec cap open android
```

`prepare:web` runs `build:web` (Vite build with `--mode mobile`) followed by `bundle:assets`, which downloads bundled audio and 3D models into `build/` via `apps/desktop/scripts/sync-assets.mjs`. The first run downloads ~several hundred MB; subsequent runs are incremental.

---

## Rebuild Loop (After Web Changes)

```bash
pnpm --filter @soundscape/mobile run prepare:web && \
pnpm --filter @soundscape/mobile exec cap copy
```

`cap copy` copies the web build into the native projects without re-running pod install or Gradle sync. Use `cap sync` instead if you also changed plugin dependencies.

---

## Orientation

Capacitor's default is follow-device (no pinning). After `cap add`:

- **iOS:** open `ios/App/App/Info.plist` and confirm `UISupportedInterfaceOrientations` includes both portrait and landscape entries for iPhone and iPad.
- **Android:** open `android/app/src/main/AndroidManifest.xml` and confirm the `<activity>` element does not set `android:screenOrientation`.

If either is pinned, remove the restriction.

---

## Icons & Splash Screen

There is no store-ready square icon in the repo — `public/img/` contains non-square previews. Prepare:

1. Design a 1024×1024 icon and place it at `apps/mobile/assets/icon.png`.
2. Optionally place a splash image at `apps/mobile/assets/splash.png`.
3. Generate all required sizes:

   ```bash
   pnpm dlx @capacitor/assets generate
   ```

This writes platform-specific icon and splash assets into `ios/` and `android/`. Re-run whenever you update the source.

The `SplashScreen` plugin is configured in `capacitor.config.ts` with `launchAutoHide: false` — the app shell hides it programmatically once initialized, so the transition is code-controlled rather than timer-based.

---

## Signing

### iOS

1. Enroll in the Apple Developer Program ($99/yr): <https://developer.apple.com/programs/>
2. In Xcode, open `ios/App/App.xcworkspace`, select the `App` target, and under **Signing & Capabilities** select your team. Xcode manages the signing certificate and provisioning profile automatically when "Automatically manage signing" is enabled.
3. For distribution builds, select the **Release** scheme and use **Product → Archive**.

### Android

1. Generate an upload keystore (run once; store securely — losing it means you cannot update the app):

   ```bash
   keytool -genkey -v \
     -keystore soundscape-upload.jks \
     -alias soundscape \
     -keyalg RSA -keysize 2048 \
     -validity 10000
   ```

2. Reference it in `android/app/build.gradle` under `signingConfigs`, or enroll in **Play App Signing** (recommended — Google holds the release key, you upload with the upload key).

3. Build a signed release AAB:

   ```bash
   cd android && ./gradlew bundleRelease
   ```

---

## Store Submission

### Apple App Store

- Cost: $99/yr (Apple Developer Program)
- Privacy policy URL required before submission
- Supply screenshots for each supported device size (iPhone 6.7", 6.5", iPad Pro 12.9")
- Set an age rating (4+ is typical for ambient music)
- **App Privacy → "Data Not Collected"** — GA is gated to the web host only; the native shell loads no analytics, so this declaration is accurate
- Submit via TestFlight for internal and external testing before App Store review
- Review turnaround is typically 1–3 business days

### Google Play

- Cost: $25 one-time (Google Play Developer account)
- Complete the **Data Safety** form — "No data collected" is accurate for the same reason as above
- Supply screenshots for phone and tablet
- Complete the content rating questionnaire (ESRB / IARC)
- Use the **Internal testing** track first, then promote through Closed → Open → Production
- Requires a signed AAB (not APK) for Play Store submission

---

## CI Guard

The Playwright `webkit` project runs every PR, exercising scenes through WebKit — the same engine family WKWebView uses on iOS. This is the standing automated iOS proxy. It does not replace on-device testing but catches most regressions before they reach a device.

---

## Real-Device Smoke Test

Run this checklist on a physical iOS device and a physical Android device before each store submission:

- [ ] First tap after launch plays audio (Web Audio context is unlocked correctly)
- [ ] Scenes render without blank screens or WebGL errors
- [ ] `/info` page "← Back" button navigates back to the scene
- [ ] Android hardware back button steps through navigation history, then exits the app at the root
- [ ] Status bar does not overlap UI content in portrait (notch/Dynamic Island is cleared)
- [ ] Put the device in airplane mode — all scenes load and play from bundled assets (no network required)
