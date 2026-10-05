import AsyncStorage from '@react-native-async-storage/async-storage';

const HEARTS_KEY = 'kanoonai_hearts';
const HEARTS_DATE_KEY = 'kanoonai_hearts_date';
const MAX_HEARTS = 3;

export async function getHearts(): Promise<number> {
  const today = new Date().toDateString();
  const savedDate = await AsyncStorage.getItem(HEARTS_DATE_KEY);
  if (savedDate !== today) {
    await AsyncStorage.setItem(HEARTS_KEY, String(MAX_HEARTS));
    await AsyncStorage.setItem(HEARTS_DATE_KEY, today);
    return MAX_HEARTS;
  }
  const saved = await AsyncStorage.getItem(HEARTS_KEY);
  return saved !== null ? parseInt(saved, 10) : MAX_HEARTS;
}

export async function loseHeart(): Promise<number> {
  const current = await getHearts();
  const next = Math.max(0, current - 1);
  await AsyncStorage.setItem(HEARTS_KEY, String(next));
  return next;
}

export async function resetHearts(): Promise<void> {
  await AsyncStorage.setItem(HEARTS_KEY, String(MAX_HEARTS));
  await AsyncStorage.setItem(HEARTS_DATE_KEY, new Date().toDateString());
}
