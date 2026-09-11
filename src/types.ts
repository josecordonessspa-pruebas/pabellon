export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatarColor?: string;
  createdAt: string;
}

export type SportCourtType = 'padel' | 'futbol7' | 'tenis' | 'futbol11';

export interface CourtFacility {
  id: string;
  name: string;
  sport: SportCourtType;
  defaultPrice: number;
  surface: string;
  features?: string;
  isActive: boolean;
}

export type FitnessActivityType = 'spinning' | 'zumba' | 'crossfit' | 'pilates';

export interface CourtSlot {
  id: string;
  courtId?: string;
  sport: SportCourtType;
  courtName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: number; // in Euros
  isBooked: boolean;
  bookedBy?: {
    userId: string;
    userName: string;
    userEmail?: string;
    userPhone: string;
    bookedAt: string;
  };
}

export interface ClassAttendee {
  userId: string;
  userName: string;
  userPhone: string;
  registeredAt: string;
}

export interface WaitingListAttendee extends ClassAttendee {
  position: number;
}

export interface FitnessClass {
  id: string;
  activity: FitnessActivityType;
  title: string;
  instructor: string;
  room: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxCapacity: number; // 15 max
  participants: ClassAttendee[]; // Up to 15
  waitingList: WaitingListAttendee[]; // 16th and above
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  timestamp: string;
  scheduledFor: string;
  isRead: boolean;
  type: 'court_booking' | 'class_booking' | 'waitlist_promoted' | 'court_cancelled' | 'class_cancelled' | 'one_hour_reminder';
  targetTitle: string;
  eventDate?: string;
  eventTime?: string;
}
