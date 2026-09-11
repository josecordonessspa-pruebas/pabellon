import { CourtFacility, CourtSlot, FitnessClass, PushNotification, SportCourtType, User } from '../types';
import { INITIAL_COURT_FACILITIES, INITIAL_COURT_SLOTS, INITIAL_FITNESS_CLASSES, INITIAL_USERS } from '../mockData';
import { triggerSystemNotification } from '../utils/audio';
import { ApiService } from './api';

const STORAGE_KEYS = {
  USERS: 'pabellon_users_v2',
  CURRENT_USER: 'pabellon_current_user_v2',
  FACILITIES: 'pabellon_facilities_v2',
  COURTS: 'pabellon_courts_v2',
  CLASSES: 'pabellon_classes_v2',
  NOTIFICATIONS: 'pabellon_notifications_v2',
};

// Administrator credentials as specified in requirement 1 (never exposed in UI text)
const ADMIN_CREDENTIALS = {
  username: 'Cordones',
  password: 'J0502C',
};

export class StorageService {
  // Initialize storage with seeds if empty
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FACILITIES)) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_COURT_FACILITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURTS)) {
      localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(INITIAL_COURT_SLOTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_FITNESS_CLASSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
  }

  static saveUsers(users: User[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }

  static saveNotifications(notifications: PushNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }

  // --- Auth & Users ---
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  static loginAdmin(userAttempt: string, passAttempt: string): { success: boolean; user?: User; error?: string } {
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
      this.setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }
    return { success: false, error: 'Credenciales de administrador incorrectas' };
  }

  static loginClient(emailOrPhone: string, passwordAttempt: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanSearch = emailOrPhone.trim().toLowerCase();
    const found = users.find(u => 
      u.email.toLowerCase() === cleanSearch || 
      u.phone.replace(/\s+/g, '') === cleanSearch.replace(/\s+/g, '')
    );
    if (!found) {
      return { success: false, error: 'No se encontró ningún usuario con ese correo o teléfono. Regístrate primero.' };
    }

    if (!passwordAttempt.trim()) {
      return { success: false, error: 'Por favor introduce tu contraseña de cliente' };
    }

    // Check password
    if (found.password && found.password !== passwordAttempt.trim()) {
      return { success: false, error: 'Contraseña incorrecta. Por favor compruébala.' };
    }

    this.setCurrentUser(found);
    return { success: true, user: found };
  }

  static registerClient(name: string, email: string, phone: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const emailClean = email.trim().toLowerCase();
    const phoneClean = phone.trim().replace(/\s+/g, '');
    const passClean = password.trim();

    if (!name.trim() || !emailClean || !phoneClean || !passClean) {
      return { success: false, error: 'Todos los campos son obligatorios, incluida la contraseña' };
    }

    if (passClean.length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }

    if (users.some(u => u.email.toLowerCase() === emailClean)) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico' };
    }

    const avatarColors = [
      'bg-emerald-600', 'bg-blue-600', 'bg-teal-600', 'bg-amber-600',
      'bg-rose-600', 'bg-violet-600', 'bg-cyan-600', 'bg-indigo-600'
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

    const updated = [newUser, ...users];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  // --- Court Facilities (Pistas Físicas y Precios Base) ---
  static getCourtFacilities(): CourtFacility[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      return data ? JSON.parse(data) : INITIAL_COURT_FACILITIES;
    } catch {
      return INITIAL_COURT_FACILITIES;
    }
  }

  static saveCourtFacilities(facilities: CourtFacility[]): void {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
  }

  static addCourtFacility(facilityData: Omit<CourtFacility, 'id'>): CourtFacility {
    const facilities = this.getCourtFacilities();
    const newFacility: CourtFacility = {
      ...facilityData,
      id: `fac-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [...facilities, newFacility];
    this.saveCourtFacilities(updated);
    return newFacility;
  }

  static updateCourtFacility(id: string, updates: Partial<CourtFacility>): { success: boolean; facility?: CourtFacility } {
    const facilities = this.getCourtFacilities();
    const index = facilities.findIndex(f => f.id === id);
    if (index === -1) return { success: false };

    facilities[index] = { ...facilities[index], ...updates };
    this.saveCourtFacilities(facilities);

    // If court price or name changed, also optionally update unbooked slots for that court
    if (updates.name || updates.defaultPrice !== undefined) {
      const slots = this.getCourtSlots();
      const oldName = facilities[index].name;
      const updatedSlots = slots.map(slot => {
        if (slot.courtId === id || slot.courtName === oldName) {
          return {
            ...slot,
            courtName: updates.name || slot.courtName,
            price: (!slot.isBooked && updates.defaultPrice !== undefined) ? updates.defaultPrice : slot.price,
          };
        }
        return slot;
      });
      this.saveCourtSlots(updatedSlots);
    }

    return { success: true, facility: facilities[index] };
  }

  static deleteCourtFacility(id: string): { success: boolean } {
    const facilities = this.getCourtFacilities().filter(f => f.id !== id);
    this.saveCourtFacilities(facilities);
    return { success: true };
  }

  // --- Court Slots Management ---
  static getCourtSlots(): CourtSlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURTS);
      return data ? JSON.parse(data) : INITIAL_COURT_SLOTS;
    } catch {
      return INITIAL_COURT_SLOTS;
    }
  }

  static saveCourtSlots(slots: CourtSlot[]): void {
    localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(slots));
  }

  // Admin creates new court availability slot (Requirement 3 & 8)
  // "si una pista ya esta creada el mismo dia y a la misma hora, no se debe de poder volver a crear"
  static addCourtSlot(slotData: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>): { success: boolean; slot?: CourtSlot; error?: string } {
    const slots = this.getCourtSlots();

    // Check duplicate: same court, same date, same start time or overlapping time interval
    const duplicate = slots.find(s => {
      const sameCourt = (slotData.courtId && s.courtId && s.courtId === slotData.courtId) ||
        (s.courtName.trim().toLowerCase() === slotData.courtName.trim().toLowerCase());
      const sameDate = s.date === slotData.date;
      const timeConflict = s.startTime === slotData.startTime ||
        (slotData.startTime < s.endTime && slotData.endTime > s.startTime);
      return sameCourt && sameDate && timeConflict;
    });

    if (duplicate) {
      return {
        success: false,
        error: `Ya existe un horario para "${slotData.courtName}" el día ${slotData.date} a las ${duplicate.startTime} - ${duplicate.endTime}h. No se puede volver a crear.`
      };
    }

    const newSlot: CourtSlot = {
      ...slotData,
      id: `court-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isBooked: false,
    };
    const updated = [newSlot, ...slots];
    this.saveCourtSlots(updated);
    return { success: true, slot: newSlot };
  }

  // Admin updates/edits a court slot (change price, date, time, court, etc.)
  static updateCourtSlot(slotId: string, updates: Partial<CourtSlot>): { success: boolean; slot?: CourtSlot; error?: string } {
    const slots = this.getCourtSlots();
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return { success: false, error: 'Franja horaria no encontrada' };

    const target = { ...slots[index], ...updates };

    // Prevent collision if date, court or time changed
    if (updates.date || updates.startTime || updates.endTime || updates.courtName || updates.courtId) {
      const duplicate = slots.find(s => {
        if (s.id === slotId) return false;
        const sameCourt = (target.courtId && s.courtId && s.courtId === target.courtId) ||
          (s.courtName.trim().toLowerCase() === target.courtName.trim().toLowerCase());
        const sameDate = s.date === target.date;
        const timeConflict = s.startTime === target.startTime ||
          (target.startTime < s.endTime && target.endTime > s.startTime);
        return sameCourt && sameDate && timeConflict;
      });

      if (duplicate) {
        return {
          success: false,
          error: `Conflicto de horario: "${target.courtName}" ya tiene otra franja creada el ${target.date} de ${duplicate.startTime} a ${duplicate.endTime}h.`
        };
      }
    }

    slots[index] = target;
    this.saveCourtSlots(slots);
    return { success: true, slot: slots[index] };
  }

  // Admin deletes a court slot
  static deleteCourtSlot(slotId: string): void {
    const slots = this.getCourtSlots().filter(s => s.id !== slotId);
    this.saveCourtSlots(slots);
  }

  // Client books a court slot (Requirement 2)
  static bookCourtSlot(slotId: string, user: User): { success: boolean; slot?: CourtSlot; error?: string } {
    const slots = this.getCourtSlots();
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) {
      return { success: false, error: 'Pista no encontrada' };
    }
    if (slots[index].isBooked) {
      return { success: false, error: 'Esta pista ya ha sido reservada por otro usuario' };
    }

    const updatedSlot: CourtSlot = {
      ...slots[index],
      isBooked: true,
      bookedBy: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        bookedAt: new Date().toISOString(),
      },
    };

    slots[index] = updatedSlot;
    this.saveCourtSlots(slots);

    // Schedule / Generate Push Notification (Requirement 9)
    this.schedulePushNotification({
      userId: user.id,
      title: 'Pista Alquilada con Éxito',
      body: `Tu reserva para ${updatedSlot.courtName} el ${updatedSlot.date} a las ${updatedSlot.startTime}h está confirmada. Te notificaremos 1 hora antes del inicio.`,
      type: 'court_booking',
      targetTitle: updatedSlot.courtName,
      eventDate: updatedSlot.date,
      eventTime: updatedSlot.startTime,
    });

    return { success: true, slot: updatedSlot };
  }

  // Client cancels a court slot (Requirement 2 & 6) or Admin liberates/cancels it
  static cancelCourtSlot(slotId: string, userId: string, isAdmin: boolean = false): { success: boolean; error?: string } {
    const slots = this.getCourtSlots();
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) {
      return { success: false, error: 'Reserva no encontrada' };
    }

    const slot = slots[index];
    if (!isAdmin && slot.bookedBy?.userId !== userId) {
      return { success: false, error: 'No tienes permiso para cancelar esta reserva' };
    }

    const previousTenantId = slot.bookedBy?.userId;

    slots[index] = {
      ...slot,
      isBooked: false,
      bookedBy: undefined,
    };
    this.saveCourtSlots(slots);

    if (previousTenantId) {
      this.addNotification({
        id: `notif-${Date.now()}`,
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
      });
    }

    return { success: true };
  }

  // --- Fitness Classes Management ---
  static getFitnessClasses(): FitnessClass[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      return data ? JSON.parse(data) : INITIAL_FITNESS_CLASSES;
    } catch {
      return INITIAL_FITNESS_CLASSES;
    }
  }

  static saveFitnessClasses(classes: FitnessClass[]): void {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  // Admin creates new class (Requirement 7 & 8)
  // "No se puede repetir la creacion de clases si es la misma y a la misma hora y dia."
  static addFitnessClass(classData: Omit<FitnessClass, 'id' | 'participants' | 'waitingList'>): {
    success: boolean;
    fitClass?: FitnessClass;
    error?: string;
  } {
    const classes = this.getFitnessClasses();

    // Check duplicate: same activity or same title, on the same date and same start time (or overlapping in the same room)
    const duplicate = classes.find(c => {
      const sameActivityOrTitle = c.activity === classData.activity ||
        c.title.trim().toLowerCase() === classData.title.trim().toLowerCase();
      const sameDate = c.date === classData.date;
      const sameTime = c.startTime === classData.startTime ||
        (classData.startTime < c.endTime && classData.endTime > c.startTime);
      const sameRoom = c.room.trim().toLowerCase() === classData.room.trim().toLowerCase();

      return sameDate && ((sameActivityOrTitle && sameTime) || (sameRoom && sameTime));
    });

    if (duplicate) {
      return {
        success: false,
        error: `Ya existe la clase "${duplicate.title}" programada para el día ${classData.date} a las ${duplicate.startTime} - ${duplicate.endTime}h (${duplicate.room}). No se puede repetir la creación si es la misma a la misma hora y día.`
      };
    }

    const newClass: FitnessClass = {
      ...classData,
      maxCapacity: classData.maxCapacity || 15,
      id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      participants: [],
      waitingList: [],
    };
    const updated = [newClass, ...classes];
    this.saveFitnessClasses(updated);
    return { success: true, fitClass: newClass };
  }

  // Admin updates fitness class (including changing aforo / maxCapacity)
  // "el administrador puede cambiar el aforo."
  static updateFitnessClass(classId: string, updates: Partial<FitnessClass>): {
    success: boolean;
    fitClass?: FitnessClass;
    promotedCount?: number;
    error?: string;
  } {
    const classes = this.getFitnessClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const currentClass = classes[index];
    const target = { ...currentClass, ...updates };

    // Check collision if date/time/activity changed
    if (updates.date || updates.startTime || updates.endTime || updates.activity || updates.room) {
      const duplicate = classes.find(c => {
        if (c.id === classId) return false;
        const sameActivityOrTitle = c.activity === target.activity ||
          c.title.trim().toLowerCase() === target.title.trim().toLowerCase();
        const sameDate = c.date === target.date;
        const sameTime = c.startTime === target.startTime ||
          (target.startTime < c.endTime && target.endTime > c.startTime);
        const sameRoom = c.room.trim().toLowerCase() === target.room.trim().toLowerCase();
        return sameDate && ((sameActivityOrTitle && sameTime) || (sameRoom && sameTime));
      });

      if (duplicate) {
        return {
          success: false,
          error: `Conflicto de horario: Ya existe "${duplicate.title}" el ${target.date} a las ${duplicate.startTime} - ${duplicate.endTime}h.`
        };
      }
    }

    let promotedCount = 0;
    // If maxCapacity increased, automatically promote waiting list attendees into confirmed spots!
    if (updates.maxCapacity !== undefined && updates.maxCapacity > currentClass.maxCapacity) {
      const newCapacity = updates.maxCapacity;
      while (target.participants.length < newCapacity && target.waitingList.length > 0) {
        const nextInLine = target.waitingList.shift()!;
        target.participants.push({
          userId: nextInLine.userId,
          userName: nextInLine.userName,
          userPhone: nextInLine.userPhone,
          registeredAt: new Date().toISOString(),
        });
        promotedCount++;

        this.addNotification({
          id: `notif-promoted-aforo-${Date.now()}-${nextInLine.userId}`,
          userId: nextInLine.userId,
          title: '¡Plaza confirmada por ampliación de aforo!',
          body: `El aforo de la clase ${target.title} ha sido ampliado a ${newCapacity} plazas. Has pasado automáticamente de reserva a tener plaza oficial (${target.date} a las ${target.startTime}h).`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'waitlist_promoted',
          targetTitle: target.title,
        });
      }

      // Re-index remaining waiting list
      target.waitingList.forEach((w, idx) => {
        w.position = idx + 1;
      });
    }

    classes[index] = target;
    this.saveFitnessClasses(classes);
    return { success: true, fitClass: target, promotedCount };
  }

  // Admin manually enrolls / inscribes a client into a class (Requirement: admin can enroll clients)
  static adminEnrollUserInClass(
    classId: string,
    attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }
  ): {
    success: boolean;
    status: 'confirmed' | 'waitlist';
    position?: number;
    error?: string;
  } {
    const classes = this.getFitnessClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      return { success: false, status: 'confirmed', error: 'Clase no encontrada' };
    }

    const fitClass = classes[index];
    const cleanName = attendee.userName.trim();
    const cleanPhone = attendee.userPhone.trim().replace(/\s+/g, '');
    const userId = attendee.userId || `user-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (!cleanName) {
      return { success: false, status: 'confirmed', error: 'El nombre del cliente es obligatorio' };
    }

    // Check if user is already enrolled by userId or phone/name
    const alreadyParticipant = fitClass.participants.some(
      p => (attendee.userId && p.userId === attendee.userId) ||
           (p.userName.toLowerCase() === cleanName.toLowerCase() && p.userPhone.replace(/\s+/g, '') === cleanPhone)
    );
    const alreadyWaiting = fitClass.waitingList.some(
      w => (attendee.userId && w.userId === attendee.userId) ||
           (w.userName.toLowerCase() === cleanName.toLowerCase() && w.userPhone.replace(/\s+/g, '') === cleanPhone)
    );

    if (alreadyParticipant || alreadyWaiting) {
      return {
        success: false,
        status: alreadyParticipant ? 'confirmed' : 'waitlist',
        error: alreadyParticipant
          ? `El cliente ${cleanName} ya tiene plaza confirmada en esta clase`
          : `El cliente ${cleanName} ya está en la lista de espera de esta clase`
      };
    }

    const nowIso = new Date().toISOString();

    if (fitClass.participants.length < fitClass.maxCapacity) {
      fitClass.participants.push({
        userId,
        userName: cleanName,
        userPhone: cleanPhone || 'Sin teléfono',
        registeredAt: nowIso,
      });

      classes[index] = { ...fitClass };
      this.saveFitnessClasses(classes);

      // Notification
      this.addNotification({
        id: `notif-admin-enrolled-${Date.now()}`,
        userId,
        title: `Inscripción confirmada: ${fitClass.title}`,
        body: `El administrador te ha inscrito en ${fitClass.title} (${fitClass.date} a las ${fitClass.startTime}h en ${fitClass.room}).`,
        timestamp: nowIso,
        scheduledFor: 'immediate',
        isRead: false,
        type: 'class_booking',
        targetTitle: fitClass.title,
      });

      return { success: true, status: 'confirmed' };
    } else {
      const position = fitClass.waitingList.length + 1;
      fitClass.waitingList.push({
        userId,
        userName: cleanName,
        userPhone: cleanPhone || 'Sin teléfono',
        registeredAt: nowIso,
        position,
      });

      classes[index] = { ...fitClass };
      this.saveFitnessClasses(classes);

      this.addNotification({
        id: `notif-admin-waitlist-${Date.now()}`,
        userId,
        title: `Inscripción en lista de espera (#${position}): ${fitClass.title}`,
        body: `El administrador te ha inscrito en lista de reserva (#${position}) para ${fitClass.title}.`,
        timestamp: nowIso,
        scheduledFor: 'immediate',
        isRead: false,
        type: 'class_booking',
        targetTitle: fitClass.title,
      });

      return { success: true, status: 'waitlist', position };
    }
  }

  // Admin removes an attendee (participant or waitlist) from a class (Requirement: admin can remove clients)
  static adminRemoveUserFromClass(
    classId: string,
    targetUserId: string
  ): {
    success: boolean;
    promotedUser?: string;
    removedName?: string;
    error?: string;
  } {
    const classes = this.getFitnessClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const fitClass = classes[index];
    const participantIndex = fitClass.participants.findIndex(p => p.userId === targetUserId);
    const waitlistIndex = fitClass.waitingList.findIndex(w => w.userId === targetUserId);

    if (participantIndex === -1 && waitlistIndex === -1) {
      return { success: false, error: 'El alumno no se encuentra en esta clase' };
    }

    let promotedUserName: string | undefined;
    let removedUserName: string | undefined;

    if (participantIndex !== -1) {
      removedUserName = fitClass.participants[participantIndex].userName;
      fitClass.participants.splice(participantIndex, 1);

      // Automatic promotion: 1st in waitlist gets promoted!
      if (fitClass.waitingList.length > 0) {
        const nextInLine = fitClass.waitingList.shift()!;
        fitClass.participants.push({
          userId: nextInLine.userId,
          userName: nextInLine.userName,
          userPhone: nextInLine.userPhone,
          registeredAt: new Date().toISOString(),
        });

        // Re-index remaining waiting list
        fitClass.waitingList.forEach((item, idx) => {
          item.position = idx + 1;
        });

        promotedUserName = nextInLine.userName;

        this.addNotification({
          id: `notif-promoted-${Date.now()}`,
          userId: nextInLine.userId,
          title: '¡Tienes plaza confirmada en tu clase!',
          body: `Se ha liberado un hueco en ${fitClass.title} (${fitClass.date} a las ${fitClass.startTime}h). Has pasado automáticamente de la lista de espera a tener plaza confirmada.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'waitlist_promoted',
          targetTitle: fitClass.title,
        });

        triggerSystemNotification(
          '¡Plaza confirmada en tu clase!',
          `Se ha liberado un hueco en ${fitClass.title}. ¡Ya tienes plaza oficial!`
        );
      }
    } else if (waitlistIndex !== -1) {
      removedUserName = fitClass.waitingList[waitlistIndex].userName;
      fitClass.waitingList.splice(waitlistIndex, 1);
      fitClass.waitingList.forEach((item, idx) => {
        item.position = idx + 1;
      });
    }

    classes[index] = { ...fitClass };
    this.saveFitnessClasses(classes);

    this.addNotification({
      id: `notif-admin-del-${Date.now()}`,
      userId: targetUserId,
      title: 'Baja gestionada por Administración',
      body: `El administrador ha tramitado tu baja de la clase de ${fitClass.title} (${fitClass.date} a las ${fitClass.startTime}h).`,
      timestamp: new Date().toISOString(),
      scheduledFor: 'immediate',
      isRead: false,
      type: 'class_cancelled',
      targetTitle: fitClass.title,
    });

    return { success: true, promotedUser: promotedUserName, removedName: removedUserName };
  }

  // Admin deletes a class
  static deleteFitnessClass(classId: string): void {
    const classes = this.getFitnessClasses().filter(c => c.id !== classId);
    this.saveFitnessClasses(classes);
  }

  // Client enrolls in class (Requirement 7: max 15 capacity, >15 placed in waiting list)
  static enrollInClass(classId: string, user: User): {
    success: boolean;
    status: 'confirmed' | 'waitlist';
    position?: number;
    error?: string;
  } {
    const classes = this.getFitnessClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      return { success: false, status: 'confirmed', error: 'Clase no encontrada' };
    }

    const fitClass = classes[index];

    // Check if user is already enrolled
    const alreadyParticipant = fitClass.participants.some(p => p.userId === user.id);
    const alreadyWaiting = fitClass.waitingList.some(w => w.userId === user.id);
    if (alreadyParticipant || alreadyWaiting) {
      return {
        success: false,
        status: alreadyParticipant ? 'confirmed' : 'waitlist',
        error: alreadyParticipant ? 'Ya tienes plaza confirmada en esta clase' : 'Ya estás en la lista de espera de esta clase'
      };
    }

    const nowIso = new Date().toISOString();

    if (fitClass.participants.length < fitClass.maxCapacity) {
      // Spot available!
      fitClass.participants.push({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        registeredAt: nowIso,
      });

      classes[index] = { ...fitClass };
      this.saveFitnessClasses(classes);

      // Schedule push notification for 1 hour before (Requirement 9)
      this.schedulePushNotification({
        userId: user.id,
        title: `¡Plaza confirmada en ${fitClass.title}!`,
        body: `Te has apuntado a la clase de ${fitClass.title} el ${fitClass.date} a las ${fitClass.startTime}h en ${fitClass.room}. Te avisaremos 1h antes con notificación push.`,
        type: 'class_booking',
        targetTitle: fitClass.title,
        eventDate: fitClass.date,
        eventTime: fitClass.startTime,
      });

      return { success: true, status: 'confirmed' };
    } else {
      // Capacity exceeded (15+): Place in waiting list ("en reserva")
      const position = fitClass.waitingList.length + 1;
      fitClass.waitingList.push({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        registeredAt: nowIso,
        position,
      });

      classes[index] = { ...fitClass };
      this.saveFitnessClasses(classes);

      this.addNotification({
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: `En lista de espera (#${position})`,
        body: `La clase de ${fitClass.title} está completa (máx. 15). Estás en el puesto #${position} de reserva. Si alguien se da de baja, entrarás automáticamente.`,
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'class_booking',
        targetTitle: fitClass.title,
      });

      return { success: true, status: 'waitlist', position };
    }
  }

  // Client leaves class (Requirement 7: automatic promotion of 1st person in waiting list!)
  static cancelClassEnrollment(classId: string, userId: string): {
    success: boolean;
    promotedUser?: string;
    error?: string;
  } {
    const classes = this.getFitnessClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) {
      return { success: false, error: 'Clase no encontrada' };
    }

    const fitClass = classes[index];
    const isParticipant = fitClass.participants.some(p => p.userId === userId);
    const isWaiting = fitClass.waitingList.some(w => w.userId === userId);

    if (!isParticipant && !isWaiting) {
      return { success: false, error: 'No estás apuntado a esta clase' };
    }

    let promotedUserName: string | undefined;

    if (isParticipant) {
      // Remove from participants
      fitClass.participants = fitClass.participants.filter(p => p.userId !== userId);

      // AUTOMATIC PROMOTION: First person in waiting list takes the vacant spot!
      if (fitClass.waitingList.length > 0) {
        const nextInLine = fitClass.waitingList.shift()!;
        fitClass.participants.push({
          userId: nextInLine.userId,
          userName: nextInLine.userName,
          userPhone: nextInLine.userPhone,
          registeredAt: new Date().toISOString(),
        });

        // Re-index remaining waiting list
        fitClass.waitingList.forEach((item, idx) => {
          item.position = idx + 1;
        });

        promotedUserName = nextInLine.userName;

        // Trigger urgent Push Notification for promoted user (Requirement 7 & 9)
        this.addNotification({
          id: `notif-promoted-${Date.now()}`,
          userId: nextInLine.userId,
          title: '¡Tienes plaza confirmada en tu clase!',
          body: `Se ha liberado un hueco en ${fitClass.title} (${fitClass.date} a las ${fitClass.startTime}h). Has pasado automáticamente de la lista de espera a tener plaza confirmada.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'waitlist_promoted',
          targetTitle: fitClass.title,
        });

        // Also trigger system push / chime if user is current
        triggerSystemNotification(
          '¡Plaza confirmada en tu clase!',
          `Se ha liberado un hueco en ${fitClass.title}. ¡Ya tienes plaza oficial!`
        );
      }
    } else if (isWaiting) {
      // Remove from waiting list and re-index
      fitClass.waitingList = fitClass.waitingList.filter(w => w.userId !== userId);
      fitClass.waitingList.forEach((item, idx) => {
        item.position = idx + 1;
      });
    }

    classes[index] = { ...fitClass };
    this.saveFitnessClasses(classes);

    // Notify user of cancellation
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: 'Baja confirmada de clase',
      body: `Te has dado de baja de la clase ${fitClass.title} (${fitClass.date} a las ${fitClass.startTime}h).`,
      timestamp: new Date().toISOString(),
      scheduledFor: 'immediate',
      isRead: false,
      type: 'class_cancelled',
      targetTitle: fitClass.title,
    });

    return { success: true, promotedUser: promotedUserName };
  }

  // --- Notifications System ---
  static getNotifications(userId?: string): PushNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list: PushNotification[] = data ? JSON.parse(data) : [];
      if (userId) {
        return list.filter(n => n.userId === userId || n.userId === 'all');
      }
      return list;
    } catch {
      return [];
    }
  }

  static addNotification(notif: PushNotification): void {
    const list = this.getNotifications();
    const updated = [notif, ...list];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    // Play chime and show system notification
    triggerSystemNotification(notif.title, notif.body);
  }

  static markNotificationRead(notifId: string): void {
    const list = this.getNotifications();
    const updated = list.map(n => n.id === notifId ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  static markAllNotificationsRead(userId: string): void {
    const list = this.getNotifications();
    const updated = list.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  // Requirement 9: Automatic push notification 1 hour before
  static schedulePushNotification(params: {
    userId: string;
    title: string;
    body: string;
    type: 'court_booking' | 'class_booking';
    targetTitle: string;
    eventDate: string; // YYYY-MM-DD
    eventTime: string; // HH:mm
  }): void {
    // 1. Immediate confirmation notification
    const immediateNotif: PushNotification = {
      id: `notif-imm-${Date.now()}`,
      userId: params.userId,
      title: params.title,
      body: params.body,
      timestamp: new Date().toISOString(),
      scheduledFor: 'immediate',
      isRead: false,
      type: params.type,
      targetTitle: params.targetTitle,
    };
    this.addNotification(immediateNotif);

    // 2. Automated 1-hour before notification record
    const eventDateTime = new Date(`${params.eventDate}T${params.eventTime}:00`);
    const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);

    const reminderNotif: PushNotification = {
      id: `notif-remind-${Date.now()}`,
      userId: params.userId,
      title: `⏰ Recordatorio (1 hora antes): ${params.targetTitle}`,
      body: `Tu actividad en ${params.targetTitle} comienza en 1 hora (${params.eventTime}h). ¡Recuerda llevar ropa adecuada y estar 5 minutos antes!`,
      timestamp: new Date().toISOString(),
      scheduledFor: oneHourBefore.toISOString(),
      isRead: false,
      type: 'one_hour_reminder',
      targetTitle: params.targetTitle,
    };

    const currentList = this.getNotifications();
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([reminderNotif, ...currentList]));
  }
}
