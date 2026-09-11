import fs from 'fs';
import path from 'path';
import { CourtFacility, CourtSlot, FitnessClass, PushNotification, User } from '../src/types';
import { INITIAL_COURT_FACILITIES, INITIAL_COURT_SLOTS, INITIAL_FITNESS_CLASSES, INITIAL_USERS } from '../src/mockData';

export interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  facilities: CourtFacility[];
  courtSlots: CourtSlot[];
  fitnessClasses: FitnessClass[];
  users: User[];
  notifications: PushNotification[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'pabellon_database.json');

const ADMIN_CREDENTIALS = {
  username: 'Cordones',
  password: 'J0502C',
};

type SseClient = {
  id: string;
  res: any;
};

class DatabaseManager {
  private db: DatabaseSchema | null = null;
  private sseClients: SseClient[] = [];

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        console.log(`[DB] Base de datos cargada correctamente desde ${DB_FILE}`);
      } else {
        this.db = {
          version: 1,
          lastUpdated: new Date().toISOString(),
          facilities: INITIAL_COURT_FACILITIES,
          courtSlots: INITIAL_COURT_SLOTS,
          fitnessClasses: INITIAL_FITNESS_CLASSES,
          users: INITIAL_USERS,
          notifications: [],
        };
        this.persist();
        console.log(`[DB] Base de datos inicializada en ${DB_FILE}`);
      }
    } catch (err) {
      console.error('[DB] Error leyendo base de datos, usando fallback en memoria:', err);
      this.db = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        facilities: INITIAL_COURT_FACILITIES,
        courtSlots: INITIAL_COURT_SLOTS,
        fitnessClasses: INITIAL_FITNESS_CLASSES,
        users: INITIAL_USERS,
        notifications: [],
      };
    }
  }

  private persist(): void {
    if (!this.db) return;
    this.db.lastUpdated = new Date().toISOString();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error al guardar en fichero JSON:', err);
    }
  }

  // --- Real-time SSE Clients Management ---
  public addSseClient(id: string, res: any): void {
    this.sseClients.push({ id, res });
    console.log(`[SSE] Cliente conectado: ${id}. Total activos: ${this.sseClients.length}`);
  }

  public removeSseClient(id: string): void {
    this.sseClients = this.sseClients.filter((c) => c.id !== id);
    console.log(`[SSE] Cliente desconectado: ${id}. Total activos: ${this.sseClients.length}`);
  }

  public broadcast(type: string, payload?: any): void {
    this.persist();
    const eventData = JSON.stringify({
      type,
      timestamp: new Date().toISOString(),
      payload,
    });

    for (const client of this.sseClients) {
      try {
        client.res.write(`data: ${eventData}\n\n`);
      } catch (err) {
        console.error(`[SSE] Error enviando a cliente ${client.id}:`, err);
      }
    }
  }

  // --- Read Operations ---
  public getState(): DatabaseSchema {
    if (!this.db) this.ensureDataFile();
    return this.db!;
  }

  public getRawFile(): string {
    if (!fs.existsSync(DB_FILE)) {
      this.persist();
    }
    return fs.readFileSync(DB_FILE, 'utf-8');
  }

  public resetDatabase(): DatabaseSchema {
    this.db = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      facilities: INITIAL_COURT_FACILITIES,
      courtSlots: INITIAL_COURT_SLOTS,
      fitnessClasses: INITIAL_FITNESS_CLASSES,
      users: INITIAL_USERS,
      notifications: [],
    };
    this.broadcast('DATABASE_RESET');
    return this.db;
  }

  // --- Auth Operations ---
  public loginAdmin(userAttempt: string, passAttempt: string): { success: boolean; user?: User; error?: string } {
    if (userAttempt.trim() === ADMIN_CREDENTIALS.username && passAttempt.trim() === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: 'admin-cordones',
        name: 'Administrador (Cordones)',
        email: 'cordones.plex@gmail.com',
        phone: '600000000',
        role: 'admin',
        avatarColor: 'bg-indigo-700',
        createdAt: new Date().toISOString(),
      };
      return { success: true, user: adminUser };
    }
    return { success: false, error: 'Credenciales de administrador incorrectas' };
  }

  public loginClient(emailOrPhone: string, passwordAttempt: string): { success: boolean; user?: User; error?: string } {
    const users = this.getState().users;
    const cleanSearch = emailOrPhone.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanSearch ||
        u.phone.replace(/\s+/g, '') === cleanSearch.replace(/\s+/g, '')
    );
    if (!found) {
      return { success: false, error: 'No se encontró ningún usuario con ese correo o teléfono. Regístrate primero.' };
    }

    if (!passwordAttempt.trim()) {
      return { success: false, error: 'Por favor introduce tu contraseña de cliente' };
    }

    if (found.password && found.password !== passwordAttempt.trim()) {
      return { success: false, error: 'Contraseña incorrecta. Por favor compruébala.' };
    }

    return { success: true, user: found };
  }

  public registerClient(name: string, email: string, phone: string, password: string): { success: boolean; user?: User; error?: string } {
    const state = this.getState();
    const emailClean = email.trim().toLowerCase();
    const phoneClean = phone.trim().replace(/\s+/g, '');
    const passClean = password.trim();

    if (!name.trim() || !emailClean || !phoneClean || !passClean) {
      return { success: false, error: 'Todos los campos son obligatorios, incluida la contraseña' };
    }

    if (passClean.length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }

    if (state.users.some((u) => u.email.toLowerCase() === emailClean)) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico' };
    }

    const avatarColors = [
      'bg-emerald-600', 'bg-blue-600', 'bg-teal-600', 'bg-amber-600',
      'bg-rose-600', 'bg-violet-600', 'bg-cyan-600', 'bg-indigo-600',
    ];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: emailClean,
      phone: phoneClean,
      password: passClean,
      role: 'user',
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
    };

    state.users.unshift(newUser);
    this.broadcast('USER_REGISTERED', { userId: newUser.id, name: newUser.name });
    return { success: true, user: newUser };
  }

  // --- Court Slots ---
  public addCourtSlot(slotData: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>): { success: boolean; slot?: CourtSlot; error?: string } {
    const state = this.getState();

    const duplicate = state.courtSlots.find((s) => {
      const sameCourt =
        (slotData.courtId && s.courtId && s.courtId === slotData.courtId) ||
        s.courtName.trim().toLowerCase() === slotData.courtName.trim().toLowerCase();
      const sameDate = s.date === slotData.date;
      const timeConflict =
        s.startTime === slotData.startTime ||
        (slotData.startTime < s.endTime && slotData.endTime > s.startTime);
      return sameCourt && sameDate && timeConflict;
    });

    if (duplicate) {
      return {
        success: false,
        error: `Ya existe un horario para "${slotData.courtName}" el día ${slotData.date} a las ${duplicate.startTime} - ${duplicate.endTime}h. No se puede volver a crear.`,
      };
    }

    const newSlot: CourtSlot = {
      ...slotData,
      id: `court-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isBooked: false,
    };

    state.courtSlots.unshift(newSlot);
    this.broadcast('COURT_SLOT_ADDED', { slotId: newSlot.id });
    return { success: true, slot: newSlot };
  }

  public batchAddCourtSlots(slotsData: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>[]): {
    createdCount: number;
    skippedCount: number;
    createdSlots: CourtSlot[];
  } {
    const state = this.getState();
    const createdSlots: CourtSlot[] = [];
    let skippedCount = 0;

    for (const slotData of slotsData) {
      const duplicate = state.courtSlots.find((s) => {
        const sameCourt =
          (slotData.courtId && s.courtId && s.courtId === slotData.courtId) ||
          s.courtName.trim().toLowerCase() === slotData.courtName.trim().toLowerCase();
        const sameDate = s.date === slotData.date;
        const timeConflict =
          s.startTime === slotData.startTime ||
          (slotData.startTime < s.endTime && slotData.endTime > s.startTime);
        return sameCourt && sameDate && timeConflict;
      });

      if (duplicate) {
        skippedCount++;
      } else {
        const newSlot: CourtSlot = {
          ...slotData,
          id: `court-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          isBooked: false,
        };
        state.courtSlots.unshift(newSlot);
        createdSlots.push(newSlot);
      }
    }

    if (createdSlots.length > 0) {
      this.broadcast('COURT_SLOTS_BATCH_ADDED', { count: createdSlots.length });
    }

    return { createdCount: createdSlots.length, skippedCount, createdSlots };
  }

  public updateCourtSlot(slotId: string, updates: Partial<CourtSlot>): { success: boolean; slot?: CourtSlot; error?: string } {
    const state = this.getState();
    const index = state.courtSlots.findIndex((s) => s.id === slotId);
    if (index === -1) return { success: false, error: 'Franja horaria no encontrada' };

    const target = { ...state.courtSlots[index], ...updates };

    if (updates.date || updates.startTime || updates.endTime || updates.courtName || updates.courtId) {
      const duplicate = state.courtSlots.find((s) => {
        if (s.id === slotId) return false;
        const sameCourt =
          (target.courtId && s.courtId && s.courtId === target.courtId) ||
          s.courtName.trim().toLowerCase() === target.courtName.trim().toLowerCase();
        const sameDate = s.date === target.date;
        const timeConflict =
          s.startTime === target.startTime ||
          (target.startTime < s.endTime && target.endTime > s.startTime);
        return sameCourt && sameDate && timeConflict;
      });

      if (duplicate) {
        return {
          success: false,
          error: `Conflicto de horario: "${target.courtName}" ya tiene otra franja creada el ${target.date} de ${duplicate.startTime} a ${duplicate.endTime}h.`,
        };
      }
    }

    state.courtSlots[index] = target;
    this.broadcast('COURT_SLOT_UPDATED', { slotId });
    return { success: true, slot: target };
  }

  public deleteCourtSlot(slotId: string): { success: boolean } {
    const state = this.getState();
    state.courtSlots = state.courtSlots.filter((s) => s.id !== slotId);
    this.broadcast('COURT_SLOT_DELETED', { slotId });
    return { success: true };
  }

  public bookCourtSlot(slotId: string, user: User): { success: boolean; slot?: CourtSlot; error?: string } {
    const state = this.getState();
    const index = state.courtSlots.findIndex((s) => s.id === slotId);
    if (index === -1) {
      return { success: false, error: 'Pista no encontrada' };
    }
    if (state.courtSlots[index].isBooked) {
      return { success: false, error: 'Esta pista ya ha sido reservada por otro usuario' };
    }

    const updatedSlot: CourtSlot = {
      ...state.courtSlots[index],
      isBooked: true,
      bookedBy: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        bookedAt: new Date().toISOString(),
      },
    };

    state.courtSlots[index] = updatedSlot;

    // Push notification record
    const notif: PushNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      title: 'Pista Alquilada con Éxito',
      body: `Tu reserva para ${updatedSlot.courtName} el ${updatedSlot.date} a las ${updatedSlot.startTime}h está confirmada. Te notificaremos 1 hora antes del inicio.`,
      timestamp: new Date().toISOString(),
      scheduledFor: 'immediate',
      isRead: false,
      type: 'court_booking',
      targetTitle: updatedSlot.courtName,
      eventDate: updatedSlot.date,
      eventTime: updatedSlot.startTime,
    };
    state.notifications.unshift(notif);

    this.broadcast('COURT_BOOKED', { slotId, courtName: updatedSlot.courtName, userName: user.name });
    return { success: true, slot: updatedSlot };
  }

  public cancelCourtSlot(slotId: string, userId: string, isAdmin: boolean = false): { success: boolean; error?: string } {
    const state = this.getState();
    const index = state.courtSlots.findIndex((s) => s.id === slotId);
    if (index === -1) {
      return { success: false, error: 'Reserva no encontrada' };
    }

    const slot = state.courtSlots[index];
    if (!isAdmin && slot.bookedBy?.userId !== userId) {
      return { success: false, error: 'No tienes permiso para cancelar esta reserva' };
    }

    const previousTenantId = slot.bookedBy?.userId;

    state.courtSlots[index] = {
      ...slot,
      isBooked: false,
      bookedBy: undefined,
    };

    if (previousTenantId) {
      const notif: PushNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: previousTenantId,
        title: 'Reserva de Pista Cancelada',
        body: isAdmin
          ? `El administrador ha cancelado/liberado la reserva de ${slot.courtName} (${slot.date} a las ${slot.startTime}h).`
          : `Has cancelado tu reserva para ${slot.courtName} (${slot.date} a las ${slot.startTime}h). La pista vuelve a estar libre.`,
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'court_cancelled',
        targetTitle: slot.courtName,
      };
      state.notifications.unshift(notif);
    }

    this.broadcast('COURT_CANCELLED', { slotId, courtName: slot.courtName });
    return { success: true };
  }

  // --- Facilities ---
  public addCourtFacility(facilityData: Omit<CourtFacility, 'id'>): CourtFacility {
    const state = this.getState();
    const newFacility: CourtFacility = {
      ...facilityData,
      id: `fac-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    state.facilities.push(newFacility);
    this.broadcast('FACILITY_ADDED', { facilityId: newFacility.id });
    return newFacility;
  }

  public updateCourtFacility(id: string, updates: Partial<CourtFacility>): { success: boolean; facility?: CourtFacility } {
    const state = this.getState();
    const index = state.facilities.findIndex((f) => f.id === id);
    if (index === -1) return { success: false };

    const oldName = state.facilities[index].name;
    state.facilities[index] = { ...state.facilities[index], ...updates };

    if (updates.name || updates.defaultPrice !== undefined) {
      state.courtSlots = state.courtSlots.map((slot) => {
        if (slot.courtId === id || slot.courtName === oldName) {
          return {
            ...slot,
            courtName: updates.name || slot.courtName,
            price: !slot.isBooked && updates.defaultPrice !== undefined ? updates.defaultPrice : slot.price,
          };
        }
        return slot;
      });
    }

    this.broadcast('FACILITY_UPDATED', { facilityId: id });
    return { success: true, facility: state.facilities[index] };
  }

  public deleteCourtFacility(id: string): { success: boolean } {
    const state = this.getState();
    state.facilities = state.facilities.filter((f) => f.id !== id);
    this.broadcast('FACILITY_DELETED', { facilityId: id });
    return { success: true };
  }

  // --- Fitness Classes ---
  public addFitnessClass(classData: Omit<FitnessClass, 'id' | 'participants' | 'waitingList'>): {
    success: boolean;
    fitClass?: FitnessClass;
    error?: string;
  } {
    const state = this.getState();

    const duplicate = state.fitnessClasses.find((c) => {
      const sameActivityOrTitle =
        c.activity === classData.activity ||
        c.title.trim().toLowerCase() === classData.title.trim().toLowerCase();
      const sameDate = c.date === classData.date;
      const sameTime =
        c.startTime === classData.startTime ||
        (classData.startTime < c.endTime && classData.endTime > c.startTime);
      const sameRoom = c.room.trim().toLowerCase() === classData.room.trim().toLowerCase();

      return sameDate && ((sameActivityOrTitle && sameTime) || (sameRoom && sameTime));
    });

    if (duplicate) {
      return {
        success: false,
        error: `Ya existe la clase "${duplicate.title}" programada para el día ${classData.date} a las ${duplicate.startTime} - ${duplicate.endTime}h (${duplicate.room}). No se puede repetir la creación si es la misma a la misma hora y día.`,
      };
    }

    const newClass: FitnessClass = {
      ...classData,
      maxCapacity: classData.maxCapacity || 15,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      participants: [],
      waitingList: [],
    };

    state.fitnessClasses.unshift(newClass);
    this.broadcast('CLASS_ADDED', { classId: newClass.id });
    return { success: true, fitClass: newClass };
  }

  public updateFitnessClass(classId: string, updates: Partial<FitnessClass>): {
    success: boolean;
    fitClass?: FitnessClass;
    promotedCount?: number;
    error?: string;
  } {
    const state = this.getState();
    const index = state.fitnessClasses.findIndex((c) => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const currentClass = state.fitnessClasses[index];
    const target = { ...currentClass, ...updates };

    if (updates.date || updates.startTime || updates.endTime || updates.activity || updates.room) {
      const duplicate = state.fitnessClasses.find((c) => {
        if (c.id === classId) return false;
        const sameActivityOrTitle =
          c.activity === target.activity ||
          c.title.trim().toLowerCase() === target.title.trim().toLowerCase();
        const sameDate = c.date === target.date;
        const sameTime =
          c.startTime === target.startTime ||
          (target.startTime < c.endTime && target.endTime > c.startTime);
        const sameRoom = c.room.trim().toLowerCase() === target.room.trim().toLowerCase();
        return sameDate && ((sameActivityOrTitle && sameTime) || (sameRoom && sameTime));
      });

      if (duplicate) {
        return {
          success: false,
          error: `Conflicto de programación: Ya existe la clase "${duplicate.title}" el ${target.date} de ${duplicate.startTime} a ${duplicate.endTime}h.`,
        };
      }
    }

    // Auto-promote from waitlist if capacity increased
    let promotedCount = 0;
    if (updates.maxCapacity && updates.maxCapacity > currentClass.participants.length && target.waitingList.length > 0) {
      const slotsToFill = updates.maxCapacity - target.participants.length;
      const promoted = target.waitingList.splice(0, slotsToFill);
      promotedCount = promoted.length;

      for (const p of promoted) {
        target.participants.push({
          userId: p.userId,
          userName: p.userName,
          userPhone: p.userPhone,
          registeredAt: new Date().toISOString(),
        });

        // Push notification
        state.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: p.userId,
          title: `¡Plaza Asignada por Ampliación de Aforo en ${target.title}!`,
          body: `El administrador ha ampliado el aforo oficial y has pasado de la lista de reserva a tener plaza confirmada oficial.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'waitlist_promoted',
          targetTitle: target.title,
        });
      }

      // Re-index remaining waiting list
      target.waitingList = target.waitingList.map((item, idx) => ({
        ...item,
        position: idx + 1,
      }));
    }

    state.fitnessClasses[index] = target;
    this.broadcast('CLASS_UPDATED', { classId, promotedCount });
    return { success: true, fitClass: target, promotedCount };
  }

  public deleteFitnessClass(classId: string): { success: boolean } {
    const state = this.getState();
    state.fitnessClasses = state.fitnessClasses.filter((c) => c.id !== classId);
    this.broadcast('CLASS_DELETED', { classId });
    return { success: true };
  }

  public enrollFitnessClass(classId: string, user: User): {
    success: boolean;
    status?: 'confirmed' | 'waitlist';
    position?: number;
    error?: string;
  } {
    const state = this.getState();
    const index = state.fitnessClasses.findIndex((c) => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const fitClass = state.fitnessClasses[index];

    if (fitClass.participants.some((p) => p.userId === user.id)) {
      return { success: false, error: 'Ya estás inscrito con plaza confirmada en esta clase' };
    }
    if (fitClass.waitingList.some((w) => w.userId === user.id)) {
      return { success: false, error: 'Ya estás en la lista de espera de esta clase' };
    }

    const maxCap = fitClass.maxCapacity || 15;
    let status: 'confirmed' | 'waitlist';
    let position: number | undefined;

    if (fitClass.participants.length < maxCap) {
      fitClass.participants.push({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        registeredAt: new Date().toISOString(),
      });
      status = 'confirmed';

      state.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: user.id,
        title: `¡Plaza Confirmada en ${fitClass.title}!`,
        body: `Tienes plaza oficial (${fitClass.date} a las ${fitClass.startTime}h). Recibirás aviso automático 1 hora antes.`,
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'class_booking',
        targetTitle: fitClass.title,
        eventDate: fitClass.date,
        eventTime: fitClass.startTime,
      });
    } else {
      position = fitClass.waitingList.length + 1;
      fitClass.waitingList.push({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        registeredAt: new Date().toISOString(),
        position,
      });
      status = 'waitlist';

      state.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: user.id,
        title: `En Lista de Espera (#${position})`,
        body: `Clase al aforo máximo (${maxCap}). Estás en el puesto #${position} de reserva. Si alguien se da de baja, entrarás automáticamente.`,
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'class_booking',
        targetTitle: fitClass.title,
      });
    }

    state.fitnessClasses[index] = fitClass;
    this.broadcast('CLASS_ENROLLMENT_CHANGED', { classId, status, position });
    return { success: true, status, position };
  }

  public cancelFitnessClassEnrollment(classId: string, userId: string): {
    success: boolean;
    promotedUser?: string;
    error?: string;
  } {
    const state = this.getState();
    const index = state.fitnessClasses.findIndex((c) => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const fitClass = state.fitnessClasses[index];
    const isParticipant = fitClass.participants.some((p) => p.userId === userId);
    const isWaiting = fitClass.waitingList.some((w) => w.userId === userId);

    if (!isParticipant && !isWaiting) {
      return { success: false, error: 'No estás registrado en esta clase' };
    }

    let promotedUser: string | undefined;

    if (isWaiting) {
      fitClass.waitingList = fitClass.waitingList
        .filter((w) => w.userId !== userId)
        .map((w, idx) => ({ ...w, position: idx + 1 }));
    } else {
      fitClass.participants = fitClass.participants.filter((p) => p.userId !== userId);

      if (fitClass.waitingList.length > 0) {
        const nextPerson = fitClass.waitingList.shift()!;
        fitClass.participants.push({
          userId: nextPerson.userId,
          userName: nextPerson.userName,
          userPhone: nextPerson.userPhone,
          registeredAt: new Date().toISOString(),
        });
        promotedUser = nextPerson.userName;

        fitClass.waitingList = fitClass.waitingList.map((w, idx) => ({
          ...w,
          position: idx + 1,
        }));

        state.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: nextPerson.userId,
          title: `¡Plaza Asignada en ${fitClass.title}!`,
          body: `Se ha liberado una plaza y has pasado de la lista de reserva a plaza confirmada para el ${fitClass.date} a las ${fitClass.startTime}h.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'waitlist_promoted',
          targetTitle: fitClass.title,
          eventDate: fitClass.date,
          eventTime: fitClass.startTime,
        });
      }
    }

    state.fitnessClasses[index] = fitClass;
    this.broadcast('CLASS_ENROLLMENT_CANCELLED', { classId, promotedUser });
    return { success: true, promotedUser };
  }

  public adminEnrollUserInClass(
    classId: string,
    attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }
  ): { success: boolean; status?: 'confirmed' | 'waitlist'; error?: string } {
    const state = this.getState();
    const index = state.fitnessClasses.findIndex((c) => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const fitClass = state.fitnessClasses[index];
    const targetUserId = attendee.userId || `manual-attendee-${Date.now()}`;

    if (fitClass.participants.some((p) => p.userId === targetUserId)) {
      return { success: false, error: 'El usuario ya está inscrito con plaza confirmada' };
    }

    const maxCap = fitClass.maxCapacity || 15;
    let status: 'confirmed' | 'waitlist';

    if (fitClass.participants.length < maxCap) {
      fitClass.participants.push({
        userId: targetUserId,
        userName: attendee.userName,
        userPhone: attendee.userPhone,
        registeredAt: new Date().toISOString(),
      });
      status = 'confirmed';
    } else {
      const position = fitClass.waitingList.length + 1;
      fitClass.waitingList.push({
        userId: targetUserId,
        userName: attendee.userName,
        userPhone: attendee.userPhone,
        registeredAt: new Date().toISOString(),
        position,
      });
      status = 'waitlist';
    }

    state.fitnessClasses[index] = fitClass;
    this.broadcast('CLASS_ADMIN_ENROLLED', { classId, userName: attendee.userName, status });
    return { success: true, status };
  }

  public adminRemoveUserFromClass(
    classId: string,
    targetUserId: string
  ): { success: boolean; promotedUser?: string; error?: string } {
    const state = this.getState();
    const index = state.fitnessClasses.findIndex((c) => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const fitClass = state.fitnessClasses[index];
    const isParticipant = fitClass.participants.some((p) => p.userId === targetUserId);
    const isWaiting = fitClass.waitingList.some((w) => w.userId === targetUserId);

    if (!isParticipant && !isWaiting) {
      return { success: false, error: 'El alumno no se encuentra en esta clase' };
    }

    let promotedUser: string | undefined;

    if (isWaiting) {
      fitClass.waitingList = fitClass.waitingList
        .filter((w) => w.userId !== targetUserId)
        .map((w, idx) => ({ ...w, position: idx + 1 }));
    } else {
      fitClass.participants = fitClass.participants.filter((p) => p.userId !== targetUserId);

      if (fitClass.waitingList.length > 0) {
        const nextPerson = fitClass.waitingList.shift()!;
        fitClass.participants.push({
          userId: nextPerson.userId,
          userName: nextPerson.userName,
          userPhone: nextPerson.userPhone,
          registeredAt: new Date().toISOString(),
        });
        promotedUser = nextPerson.userName;

        fitClass.waitingList = fitClass.waitingList.map((w, idx) => ({
          ...w,
          position: idx + 1,
        }));

        state.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: nextPerson.userId,
          title: `¡Plaza Asignada en ${fitClass.title}!`,
          body: `El administrador ha actualizado la clase y has obtenido plaza confirmada oficial.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'waitlist_promoted',
          targetTitle: fitClass.title,
        });
      }
    }

    state.fitnessClasses[index] = fitClass;
    this.broadcast('CLASS_ADMIN_REMOVED', { classId, targetUserId, promotedUser });
    return { success: true, promotedUser };
  }

  // --- Notifications ---
  public addNotification(notif: PushNotification): void {
    const state = this.getState();
    state.notifications.unshift(notif);
    this.broadcast('NOTIFICATION_ADDED', { userId: notif.userId });
  }

  public markNotificationAsRead(notifId: string): void {
    const state = this.getState();
    const target = state.notifications.find((n) => n.id === notifId);
    if (target) {
      target.isRead = true;
      this.persist();
    }
  }

  public clearAllNotifications(userId?: string): void {
    const state = this.getState();
    if (userId) {
      state.notifications = state.notifications.filter((n) => n.userId !== userId);
    } else {
      state.notifications = [];
    }
    this.persist();
  }
}

export const dbManager = new DatabaseManager();
