import { CourtFacility, CourtSlot, FitnessClass, User } from './types';

export function getDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial physical/configured sports courts in the pavilion
export const INITIAL_COURT_FACILITIES: CourtFacility[] = [
  {
    id: 'fac-padel-1',
    name: 'Pista Pádel 1 (Panorámica Cristal)',
    sport: 'padel',
    defaultPrice: 8.0,
    surface: 'Césped monofilamento y cristal panorámico',
    features: 'Iluminación LED, cerramiento de cristal templado',
    isActive: true,
  },
  {
    id: 'fac-padel-2',
    name: 'Pista Pádel 2 (Cubierta)',
    sport: 'padel',
    defaultPrice: 10.0,
    surface: 'Césped texturizado con cubierta aislante',
    features: 'Protección contra lluvia y viento, luz cenital',
    isActive: true,
  },
  {
    id: 'fac-futbol7-1',
    name: 'Campo Fútbol 7 (Césped Artificial)',
    sport: 'futbol7',
    defaultPrice: 25.0,
    surface: 'Césped artificial 60mm con caucho homologado',
    features: 'Porterías reglamentarias, banquillos techados',
    isActive: true,
  },
  {
    id: 'fac-tenis-1',
    name: 'Pista Tenis 1 (Tierra Batida)',
    sport: 'tenis',
    defaultPrice: 6.0,
    surface: 'Tierra batida natural prensada',
    features: 'Regadío automático, red profesional',
    isActive: true,
  },
  {
    id: 'fac-tenis-2',
    name: 'Pista Tenis 2 (Rápida GreenSet)',
    sport: 'tenis',
    defaultPrice: 6.0,
    surface: 'Resina sintética porosa GreenSet',
    features: 'Bote regular, alta resistencia',
    isActive: true,
  },
  {
    id: 'fac-futbol11-1',
    name: 'Campo Fútbol 11 Principal',
    sport: 'futbol11',
    defaultPrice: 45.0,
    surface: 'Césped de última generación con graderío',
    features: 'Marcador electrónico, vestuarios directos',
    isActive: true,
  },
];

// Initial registered users for realistic demo
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Administrador Municipal',
    email: 'admin@pabellonmunicipal.es',
    phone: '611000000',
    password: '',
    role: 'admin',
    avatarColor: 'bg-indigo-600',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-demo-1',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@gmail.com',
    phone: '654123456',
    password: 'password123',
    role: 'user',
    avatarColor: 'bg-emerald-600',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-demo-2',
    name: 'Elena Morales',
    email: 'elena.morales@gmail.com',
    phone: '622889900',
    password: 'password123',
    role: 'user',
    avatarColor: 'bg-amber-600',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_COURT_SLOTS: CourtSlot[] = [
  // Today's slots
  {
    id: 'court-1',
    sport: 'padel',
    courtName: 'Pista Pádel 1 (Panorámica Cristal)',
    date: getDateString(0),
    startTime: '09:30',
    endTime: '11:00',
    price: 8.0,
    isBooked: false,
  },
  {
    id: 'court-2',
    sport: 'padel',
    courtName: 'Pista Pádel 2 (Cubierta)',
    date: getDateString(0),
    startTime: '11:00',
    endTime: '12:30',
    price: 8.0,
    isBooked: true,
    bookedBy: {
      userId: 'user-demo-1',
      userName: 'Carlos Ruiz',
      userPhone: '654123456',
      bookedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  {
    id: 'court-3',
    sport: 'padel',
    courtName: 'Pista Pádel 1 (Panorámica Cristal)',
    date: getDateString(0),
    startTime: '18:00',
    endTime: '19:30',
    price: 10.0,
    isBooked: false,
  },
  {
    id: 'court-4',
    sport: 'tenis',
    courtName: 'Pista Tenis 1 (Tierra Batida)',
    date: getDateString(0),
    startTime: '10:00',
    endTime: '11:30',
    price: 6.0,
    isBooked: false,
  },
  {
    id: 'court-5',
    sport: 'tenis',
    courtName: 'Pista Tenis 2 (Rápida)',
    date: getDateString(0),
    startTime: '17:30',
    endTime: '19:00',
    price: 6.0,
    isBooked: false,
  },
  {
    id: 'court-6',
    sport: 'futbol7',
    courtName: 'Campo Fútbol 7 (Césped Artificial)',
    date: getDateString(0),
    startTime: '19:00',
    endTime: '20:30',
    price: 25.0,
    isBooked: false,
  },
  {
    id: 'court-7',
    sport: 'futbol11',
    courtName: 'Campo Fútbol 11 Principal',
    date: getDateString(0),
    startTime: '20:30',
    endTime: '22:00',
    price: 45.0,
    isBooked: false,
  },

  // Tomorrow's slots
  {
    id: 'court-8',
    sport: 'padel',
    courtName: 'Pista Pádel 1 (Panorámica Cristal)',
    date: getDateString(1),
    startTime: '10:00',
    endTime: '11:30',
    price: 8.0,
    isBooked: false,
  },
  {
    id: 'court-9',
    sport: 'padel',
    courtName: 'Pista Pádel 2 (Cubierta)',
    date: getDateString(1),
    startTime: '17:30',
    endTime: '19:00',
    price: 10.0,
    isBooked: false,
  },
  {
    id: 'court-10',
    sport: 'tenis',
    courtName: 'Pista Tenis 1 (Tierra Batida)',
    date: getDateString(1),
    startTime: '18:00',
    endTime: '19:30',
    price: 6.0,
    isBooked: false,
  },
  {
    id: 'court-11',
    sport: 'futbol7',
    courtName: 'Campo Fútbol 7 (Césped Artificial)',
    date: getDateString(1),
    startTime: '18:30',
    endTime: '20:00',
    price: 25.0,
    isBooked: false,
  },
  {
    id: 'court-12',
    sport: 'futbol11',
    courtName: 'Campo Fútbol 11 Principal',
    date: getDateString(1),
    startTime: '20:00',
    endTime: '21:30',
    price: 45.0,
    isBooked: false,
  },

  // Day after tomorrow
  {
    id: 'court-13',
    sport: 'padel',
    courtName: 'Pista Pádel 1 (Panorámica Cristal)',
    date: getDateString(2),
    startTime: '17:00',
    endTime: '18:30',
    price: 10.0,
    isBooked: false,
  },
  {
    id: 'court-14',
    sport: 'futbol7',
    courtName: 'Campo Fútbol 7 (Césped Artificial)',
    date: getDateString(2),
    startTime: '19:30',
    endTime: '21:00',
    price: 25.0,
    isBooked: false,
  },
];

export const INITIAL_FITNESS_CLASSES: FitnessClass[] = [
  // Class 1: Spinning Today - 14 attendees (1 spot available before waitlist!)
  {
    id: 'class-spinning-1',
    activity: 'spinning',
    title: 'Spinning Power & Beats',
    instructor: 'Laura Serrano',
    room: 'Sala Ciclo Indoor (2ª Planta)',
    date: getDateString(0),
    startTime: '19:00',
    endTime: '20:00',
    maxCapacity: 15,
    participants: Array.from({ length: 14 }, (_, i) => ({
      userId: `attendee-spin-${i + 1}`,
      userName: [
        'Marcos V.', 'Silvia G.', 'David T.', 'Carmen M.', 'Javier L.',
        'Sara B.', 'Manuel P.', 'Lucía R.', 'Iván H.', 'Patricia F.',
        'Álvaro D.', 'Nuria C.', 'Pablo S.', 'Raquel O.'
      ][i],
      userPhone: `6001122${String(i).padStart(2, '0')}`,
      registeredAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    })),
    waitingList: [],
  },

  // Class 2: CrossFit Today - 15/15 Full (Already has 1 person in waiting list!)
  {
    id: 'class-crossfit-1',
    activity: 'crossfit',
    title: 'CrossFit WOD Fuerza y Agilidad',
    instructor: 'Marcos Benítez',
    room: 'Box Municipal Exterior',
    date: getDateString(0),
    startTime: '20:15',
    endTime: '21:15',
    maxCapacity: 15,
    participants: Array.from({ length: 15 }, (_, i) => ({
      userId: `attendee-cross-${i + 1}`,
      userName: [
        'Alejandro N.', 'Beatriz P.', 'Héctor G.', 'Marta R.', 'Cristian V.',
        'Sonia M.', 'Rubén T.', 'Andrea S.', 'Guillermo F.', 'Lorena B.',
        'Daniel C.', 'Natalia H.', 'Sergio P.', 'Clara J.', 'Jorge M.'
      ][i],
      userPhone: `6552233${String(i).padStart(2, '0')}`,
      registeredAt: new Date(Date.now() - (i + 1) * 5000000).toISOString(),
    })),
    waitingList: [
      {
        userId: 'attendee-wait-1',
        userName: 'Víctor Romero',
        userPhone: '677998811',
        registeredAt: new Date(Date.now() - 1200000).toISOString(),
        position: 1,
      }
    ],
  },

  // Class 3: Pilates Tomorrow - 8 attendees
  {
    id: 'class-pilates-1',
    activity: 'pilates',
    title: 'Pilates Core & Postural',
    instructor: 'Carmen Delgado',
    room: 'Sala Polivalente 1',
    date: getDateString(1),
    startTime: '10:30',
    endTime: '11:30',
    maxCapacity: 15,
    participants: Array.from({ length: 8 }, (_, i) => ({
      userId: `attendee-pilates-${i + 1}`,
      userName: [
        'Rosa M.', 'Antonio B.', 'Teresa S.', 'Miguel Á.',
        'Isabel L.', 'Jesús R.', 'Marina V.', 'Fernando D.'
      ][i],
      userPhone: `6334455${String(i).padStart(2, '0')}`,
      registeredAt: new Date(Date.now() - (i + 1) * 7200000).toISOString(),
    })),
    waitingList: [],
  },

  // Class 4: Zumba Tomorrow - 11 attendees
  {
    id: 'class-zumba-1',
    activity: 'zumba',
    title: 'Zumba Fitness Party Ritmos Latinos',
    instructor: 'Sofía Valdés',
    room: 'Pabellón Cubierto Pista Central',
    date: getDateString(1),
    startTime: '18:30',
    endTime: '19:30',
    maxCapacity: 15,
    participants: Array.from({ length: 11 }, (_, i) => ({
      userId: `attendee-zumba-${i + 1}`,
      userName: [
        'Verónica S.', 'Gonzalo P.', 'Alicia R.', 'Adrián F.', 'Rocío N.',
        'Diego H.', 'Miriam T.', 'Hugo C.', 'Yolanda G.', 'Emilio K.', 'Pilar M.'
      ][i],
      userPhone: `6881122${String(i).padStart(2, '0')}`,
      registeredAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    })),
    waitingList: [],
  },

  // Class 5: Spinning Day after tomorrow
  {
    id: 'class-spinning-2',
    activity: 'spinning',
    title: 'Spinning Endurance Mountain',
    instructor: 'Laura Serrano',
    room: 'Sala Ciclo Indoor (2ª Planta)',
    date: getDateString(2),
    startTime: '19:00',
    endTime: '20:00',
    maxCapacity: 15,
    participants: [
      {
        userId: 'user-demo-2',
        userName: 'Elena Morales',
        userPhone: '622889900',
        registeredAt: new Date().toISOString(),
      }
    ],
    waitingList: [],
  },

  // Class 6: Pilates Day after tomorrow
  {
    id: 'class-pilates-2',
    activity: 'pilates',
    title: 'Pilates Suelo y Respiración',
    instructor: 'Carmen Delgado',
    room: 'Sala Polivalente 1',
    date: getDateString(2),
    startTime: '17:30',
    endTime: '18:30',
    maxCapacity: 15,
    participants: [],
    waitingList: [],
  },
];
