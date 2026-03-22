# Seeding the Weekly Battle Data

You completely locked down your Firestore database by removing the `/system/` block from `firestore.rules`. This means **no user or script on frontend** can create or modify the system's weekly battle state.

To initialize the feature, you only need to create the document exactly **once** inside your Firebase Web Console. After it is seeded, your code will silently read `null` if it ever gets deleted instead of crashing!

### Step-by-Step Instructions

1. Go to your [Firebase Console](https://console.firebase.google.com/) and open your **Firestore Database**.
2. Click **Start collection**.
3. Set the Collection ID to: `system` and hit Next.
4. Set the Document ID to: `weeklyBattle`
5. Add the following fields exactly as written:
   * **Field:** `currentBattleId` | **Type:** string | **Value:** `238_vs_155`
   * **Field:** `currentPresetIndex` | **Type:** number | **Value:** `0`
   * **Field:** `endsAt` | **Type:** timestamp | **Value:** *(Set it to next Friday!)*
   * **Field:** `startedAt` | **Type:** timestamp | **Value:** *(Set it to today!)*
6. Click **Save**.

That's it! As long as that document exists, your `getWeeklyBattle()` function will fetch it securely, and your rotating weekly battles will be fully active across the homepage and the `/battles` route!
