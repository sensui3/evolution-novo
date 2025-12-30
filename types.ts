
export interface WeightLog {
  weight: number;
  date: string;
  type: 'LOAD' | 'PR';
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  lastWeight: number;
  lastDate: string;
  pbWeight: number;
  pbDate: string;
  avgVolume: number;
  progress: number; // 0 to 100
  history?: WeightLog[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
}

export interface UserProfile {
  name: string;
  weight: number;
  level: string;
  photo: string | null;
}

export type ModalType = 'ADD_EXERCISE' | 'EDIT_EXERCISE' | 'ADD_GOAL' | 'COACH_TIPS' | 'PROFILE' | null;
