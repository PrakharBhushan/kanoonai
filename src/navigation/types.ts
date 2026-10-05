export type RootStackParamList = {
  Auth: undefined;
  PINSetup: undefined;
  App: undefined;
  PanicRecording: { sessionId: string; userId: string };
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  PINSetup: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  EmergencyTab: undefined;
  LearnTab: undefined;
  ProfileTab: undefined;
};

export type EmergencyStackParamList = {
  EmergencyHome: undefined;
  EmergencyInput: { mode: 'describe' | 'photo' | 'preloaded'; category?: string };
  EmergencyResult: { response: string; query: string; category: string };
};

export type LearnStackParamList = {
  LearnHome: undefined;
  Topic: { topicId: string; topicTitle: string };
  Lesson: { lessonId: string; topicId: string; lessonTitle: string; lessonNumber: number };
  LessonComplete: { xpEarned: number; lessonTitle: string; topicId: string; nextLessonId?: string };
};
