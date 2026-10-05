export const LEVELS = [
  { name: 'Beginner', nameHi: 'शुरुआती', min: 0, max: 499 },
  { name: 'Aware', nameHi: 'जागरूक', min: 500, max: 1499 },
  { name: 'Empowered', nameHi: 'सशक्त', min: 1500, max: 2999 },
  { name: 'Rights Champion', nameHi: 'अधिकार चैंपियन', min: 3000, max: Infinity },
];

export function getLevelFromXP(xp: number) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) ?? LEVELS[0];
}

export function getProgressPercent(xp: number): number {
  const level = getLevelFromXP(xp);
  if (level.max === Infinity) return 100;
  // Level spans [min, max]; the next level starts at max + 1, so the band is
  // (max - min + 1) wide. This keeps getProgressPercent and getXPToNext consistent.
  const range = level.max - level.min + 1;
  const progress = xp - level.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

export function getXPToNext(xp: number): number {
  const level = getLevelFromXP(xp);
  if (level.max === Infinity) return 0;
  return level.max - xp + 1;
}
