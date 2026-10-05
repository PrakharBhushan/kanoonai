export default {
  auth: {
    login: "Log In", signup: "Sign Up", email: "Email", password: "Password",
    name: "Full Name", loginBtn: "Log In to KanoonAI", signupBtn: "Create Account",
    haveAccount: "Already have an account?", noAccount: "New to KanoonAI?",
    pinSetupTitle: "Set Your Security PIN",
    pinSetupDesc: "This PIN protects your emergency recordings. Choose 4 digits you will remember.",
    pinConfirm: "Confirm PIN", pinMismatch: "PINs do not match. Try again.",
    pinSaved: "PIN saved securely.",
    fillAllFields: "Please fill all fields.",
    confirmEmailSent: "We've sent a confirmation link to your email. Please confirm it, then log in."
  },
  home: {
    morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening",
    streak: "Day Streak", hearts: "Hearts", level: "Level",
    emergency: "Emergency Help", emergencyDesc: "Get instant legal information",
    learn: "Learn the Law", learnDesc: "Build your legal knowledge",
    xpToNext: "XP to next level", dailyTip: "Daily Legal Tip"
  },
  emergency: {
    title: "Emergency Help", chooseInput: "How do you want to describe your situation?",
    describe: "Describe What Happened", photo: "Upload Photo / Video",
    preloaded: "Common Issues", panicRecord: "Emergency Recording",
    inputPlaceholder: "Describe your situation in simple words. What happened? Where? Who was involved?",
    getHelp: "Get Legal Information", searching: "Searching Indian law database...",
    situation: "Your Situation", lawSays: "What the Law Says",
    rights: "Your Rights", steps: "Steps You Can Take",
    sources: "Law Sources", disclaimer: "DISCLAIMER: This is legal information for awareness only. For case-specific advice, consult a qualified advocate registered with the Bar Council of India.",
    save: "Save", callLawyer: "Call Legal Aid (NALSA: 15100)", newQuery: "New Query",
    queriesLeft: "queries left today", upgradeForMore: "Upgrade to Pro for unlimited queries",
    preloadedIssues: {
      police: "Police Stop / Arrest",
      tenant: "Landlord / Tenant Problem",
      consumer: "Consumer Complaint",
      workplace: "Workplace Issue",
      rti: "RTI Filing",
      fraud: "Online Fraud",
      domestic: "Domestic Issue",
      labour: "Labour Rights"
    }
  },
  panic: {
    buttonLabel: "SOS",
    confirmTitle: "Start Emergency Recording?",
    confirmWarning: "⚠️ WARNING: This will immediately start recording video and audio on your phone.\n\n• Clips upload to secure cloud as they are captured, so footage saved before any interruption is preserved\n• Stopping the recording from inside the app requires your 4-digit KanoonAI PIN\n• Recording needs the app open and the screen on — force-quitting the app or powering off the phone will stop it\n• Recording may capture other people; use only in a genuine emergency and where it is lawful to record",
    confirmBtn: "Yes, Start Recording",
    cancelBtn: "Cancel",
    recording: "RECORDING IN PROGRESS",
    uploadingChunks: "Uploading to secure cloud...",
    enterPIN: "Enter your 4-digit KanoonAI PIN to stop recording",
    wrongPIN: "Wrong PIN. Recording continues.",
    lockedOut: "Too many wrong attempts. Try again in %{seconds}s. Recording continues.",
    stopRecording: "Stop Recording",
    recordingSaved: "Recording saved to your account.",
    timer: "Recording time",
    chunkUploaded: "Chunk saved to cloud",
    noPINSet: "Please set up your security PIN first in Profile settings."
  },
  learn: {
    title: "Learn the Law", topicsTitle: "Law Topics",
    locked: "Complete previous topic to unlock",
    lessons: "lessons", completed: "completed",
    startLesson: "Start Lesson", question: "Question",
    of: "of", submit: "Submit Answer",
    correct: "Correct!", wrong: "Not quite.",
    lawSource: "Law Source", explanation: "Explanation",
    nextQuestion: "Next Question", lessonComplete: "Lesson Complete!",
    xpEarned: "XP Earned", streakUpdated: "Streak Updated",
    nextLesson: "Next Lesson", backToTopics: "Back to Topics",
    heartsLeft: "hearts remaining", noHearts: "Out of Hearts!",
    noHeartsDesc: "You've used all 3 hearts. Hearts refill tomorrow at midnight.",
    restartLesson: "Restart Lesson",
    levels: {
      beginner: "Beginner", aware: "Aware",
      empowered: "Empowered", champion: "Rights Champion"
    },
    topics: {
      tenant: "Tenant Rights", police: "Police & Arrest",
      consumer: "Consumer Rights", women: "Women's Safety",
      rti: "RTI & Government", workplace: "Workplace Rights"
    }
  },
  profile: {
    title: "My Profile", xp: "Total XP", streak: "Day Streak",
    level: "Level", lessonsCompleted: "Lessons Done",
    plan: "Plan", free: "Free", proMonthly: "Pro Monthly", proAnnual: "Pro Annual",
    upgrade: "Upgrade to Pro", signOut: "Sign Out",
    settings: "Settings", language: "Language", theme: "Theme",
    light: "Light", dark: "Dark", changePIN: "Change Security PIN",
    english: "English", hindi: "Hindi"
  },
  common: {
    save: "Save", cancel: "Cancel", continue: "Continue", back: "Back",
    yes: "Yes", no: "No", ok: "OK", loading: "Loading...", error: "Error",
    retry: "Try Again", close: "Close"
  }
}
