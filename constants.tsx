
import { Exercise } from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Supino Reto',
    category: 'Peito / Empurrar',
    lastWeight: 80,
    lastDate: '12 Out',
    pbWeight: 95,
    pbDate: '01 Set',
    avgVolume: 2.4,
    progress: 85,
    history: [
      { weight: 75, date: '05 Out', type: 'LOAD' },
      { weight: 90, date: '20 Set', type: 'PR' },
      { weight: 70, date: '15 Set', type: 'LOAD' }
    ]
  },
  {
    id: '2',
    name: 'Levantamento Terra',
    category: 'Costas / Puxar',
    lastWeight: 120,
    lastDate: '10 Out',
    pbWeight: 140,
    pbDate: '25 Ago',
    avgVolume: 3.6,
    progress: 90,
    history: [
      { weight: 110, date: '01 Out', type: 'LOAD' },
      { weight: 100, date: '15 Set', type: 'LOAD' }
    ]
  },
  {
    id: '3',
    name: 'Agachamento Livre',
    category: 'Pernas / Empurrar',
    lastWeight: 100,
    lastDate: '08 Out',
    pbWeight: 115,
    pbDate: '15 Set',
    avgVolume: 3.0,
    progress: 75,
    history: [
      { weight: 90, date: '25 Set', type: 'LOAD' }
    ]
  },
];
