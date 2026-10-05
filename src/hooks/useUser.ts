import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getLevelFromXP } from '../utils/xp';
import { getHearts } from '../utils/hearts';

interface UserData {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  plan: 'free' | 'pro_monthly' | 'pro_annual';
  hearts: number;
  level: { name: string; nameHi: string };
  loading: boolean;
}

export function useUser(userId?: string) {
  const [data, setData] = useState<UserData>({
    id: '', name: '', email: '', xp: 0, streak: 0,
    plan: 'free', hearts: 3, level: { name: 'Beginner', nameHi: 'शुरुआती' },
    loading: true,
  });

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [{ data: row }, hearts] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        getHearts(),
      ]);
      if (row) {
        setData({
          id: row.id,
          name: row.name ?? '',
          email: row.email ?? '',
          xp: row.xp ?? 0,
          streak: row.streak ?? 0,
          plan: row.plan ?? 'free',
          hearts,
          level: getLevelFromXP(row.xp ?? 0),
          loading: false,
        });
      } else {
        setData(d => ({ ...d, hearts, loading: false }));
      }
    };
    load();
  }, [userId]);

  return data;
}
