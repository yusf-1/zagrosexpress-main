# Native Release Checklist

## Versioning
- Bump Android versionCode and versionName in android/app/build.gradle
- Bump iOS MARKETING_VERSION and CURRENT_PROJECT_VERSION in Xcode
- Keep package.json version aligned for reference

## App Identity
- Confirm bundle ID / applicationId matches in:
  - capacitor.config.ts appId
  - android/app/build.gradle applicationId + namespace
  - iOS project PRODUCT_BUNDLE_IDENTIFIER

## Icons
- App icon 1024x1024 (App Store)
- Android adaptive icons (foreground + background)
- iOS AppIcon asset set updated
- Verify small-size legibility (48px / 64px)

## Splash Screen
- Android splash images in res/drawable-*
- iOS LaunchScreen storyboard or assets
- Confirm background color and brand alignment

## Permissions
- Android: INTERNET, POST_NOTIFICATIONS
- iOS: add usage strings if required by features
- Ensure permission prompts are shown only when needed

## Push Notifications
- Android: Firebase set up and POST_NOTIFICATIONS requested on Android 13+
- iOS: APNs key + push capability enabled
- Verify token registration and delivery on device

## Privacy & Legal
- Privacy Policy updated in app and store listing
- Terms & Conditions page accessible in app
- Data collection and usage accurately disclosed in store forms

## App Bound Domains (iOS)
- If disabled, confirm external URLs open correctly
- If enabled, list all required domains in WKAppBoundDomains

## Store Listing
- Screenshots: phone + iPad in EN/AR/KU
- App name and subtitle localized
- Support URL and privacy policy URL
- Keywords and description localized

## QA
- Test login, order flow, and notifications on real devices
- Test deep links / external URL opens
- Check offline or poor network behavior
- Verify landscape handling on iPad
