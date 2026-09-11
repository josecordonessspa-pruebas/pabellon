import { FitnessActivityType, SportCourtType } from '../types';

export interface SportInfo {
  type: SportCourtType;
  name: string;
  shortName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName: string;
  standardDuration: string;
  courtTypes: string[];
}

export const SPORT_INFO_MAP: Record<SportCourtType, SportInfo> = {
  padel: {
    type: 'padel',
    name: 'Pádel',
    shortName: 'Pádel',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-300',
    iconName: 'Activity',
    standardDuration: '90 min',
    courtTypes: ['Pista 1 (Panorámica Cristal)', 'Pista 2 (Cubierta)', 'Pista 3 (Muro)'],
  },
  futbol7: {
    type: 'futbol7',
    name: 'Fútbol 7',
    shortName: 'Fútbol 7',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
    iconName: 'Trophy',
    standardDuration: '90 min',
    courtTypes: ['Campo Fútbol 7 (Césped Artificial)', 'Campo Fútbol 7 B (Norte)'],
  },
  tenis: {
    type: 'tenis',
    name: 'Tenis',
    shortName: 'Tenis',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    iconName: 'CircleDot',
    standardDuration: '90 min',
    courtTypes: ['Pista Tenis 1 (Tierra Batida)', 'Pista Tenis 2 (Rápida GreenSet)'],
  },
  futbol11: {
    type: 'futbol11',
    name: 'Fútbol 11',
    shortName: 'Fútbol 11',
    badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300',
    iconName: 'Shield',
    standardDuration: '90 min',
    courtTypes: ['Campo Municipal Fútbol 11 Principal'],
  },
};

export interface FitnessActivityInfo {
  type: FitnessActivityType;
  name: string;
  tagline: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentGradient: string;
  colorName: string;
  iconName: string;
}

export const FITNESS_INFO_MAP: Record<FitnessActivityType, FitnessActivityInfo> = {
  spinning: {
    type: 'spinning',
    name: 'Spinning',
    tagline: 'Ciclismo indoor con vatios y música enérgica',
    description: 'Sesión cardiovascular sobre bicicleta estática con intervalos de cadencia, fuerza y resistencia.',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-300',
    accentGradient: 'from-orange-500 to-amber-500',
    colorName: 'orange',
    iconName: 'Bike',
  },
  zumba: {
    type: 'zumba',
    name: 'Clases de Zumba',
    tagline: 'Baile fitness con ritmos latinos y fusión musical',
    description: 'Entrenamiento dinámico y divertido combinando salsa, merengue, reggaetón y tonificación.',
    badgeBg: 'bg-pink-50 text-pink-800 border-pink-200',
    badgeText: 'text-pink-700',
    badgeBorder: 'border-pink-300',
    accentGradient: 'from-pink-500 to-rose-500',
    colorName: 'pink',
    iconName: 'Sparkles',
  },
  crossfit: {
    type: 'crossfit',
    name: 'CrossFit',
    tagline: 'WOD funcional de fuerza y acondicionamiento metabólico',
    description: 'Ejercicios funcionales ejecutados a alta intensidad: levantamientos, kettlebells y peso corporal.',
    badgeBg: 'bg-red-50 text-red-800 border-red-200',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-300',
    accentGradient: 'from-red-600 to-amber-600',
    colorName: 'red',
    iconName: 'Dumbbell',
  },
  pilates: {
    type: 'pilates',
    name: 'Pilates',
    tagline: 'Control postural, flexibilidad y estabilidad del core',
    description: 'Método de acondicionamiento físico enfocado en respiración, alineación corporal y musculatura profunda.',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-300',
    accentGradient: 'from-teal-600 to-emerald-600',
    colorName: 'teal',
    iconName: 'HeartPulse',
  },
};

export function formatDayLabel(dateStr: string): { dayName: string; dayNumber: string; monthName: string; relative: string } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((compareDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let relative = '';
    if (diffDays === 0) relative = 'Hoy';
    else if (diffDays === 1) relative = 'Mañana';
    else if (diffDays === 2) relative = 'Pasado mañana';

    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNumber = String(date.getDate());
    const monthName = date.toLocaleDateString('es-ES', { month: 'short' });

    return {
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      dayNumber,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      relative,
    };
  } catch {
    return { dayName: '', dayNumber: '', monthName: '', relative: '' };
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return `${price.toFixed(2).replace('.', ',')} €`;
}
