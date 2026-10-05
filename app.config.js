export default {
  expo: {
    name: "KanoonAI",
    slug: "kanoonai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: { backgroundColor: "#1E4CB0" },
    plugins: [
      ["expo-camera", { cameraPermission: "KanoonAI needs camera for emergency recording and evidence collection." }],
      ["expo-av", { microphonePermission: "KanoonAI needs microphone for emergency audio recording." }],
      "expo-secure-store",
      "expo-task-manager",
      ["expo-notifications", { sounds: [] }],
      "expo-font"
    ],
    android: {
      adaptiveIcon: { backgroundColor: "#1E4CB0" },
      package: "com.kanoonai.app",
      permissions: ["CAMERA", "RECORD_AUDIO", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    ios: {
      bundleIdentifier: "com.kanoonai.app",
      infoPlist: {
        NSCameraUsageDescription: "KanoonAI uses camera for emergency evidence recording.",
        NSMicrophoneUsageDescription: "KanoonAI uses microphone for emergency audio recording."
      }
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://iielijvyqtoplwbpseqk.supabase.co",
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "sb_publishable_Yr8FMEidnfDNb51kfDiY5Q_3CwXUE04",
      geminiKey: process.env.EXPO_PUBLIC_GEMINI_KEY ?? ""
    }
  }
}
