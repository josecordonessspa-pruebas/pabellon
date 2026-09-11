import { CourtFacility, CourtSlot, FitnessClass, PushNotification, User } from '../types';

export interface ServerState {
  version: number;
  lastUpdated: string;
  facilities: CourtFacility[];
  courtSlots: CourtSlot[];
  fitnessClasses: FitnessClass[];
  users: User[];
  notifications: PushNotification[];
}

export class ApiService {
  private static async request<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      const data = await res.json();
      return data as T;
    } catch (err: any) {
      console.error(`API Error on ${url}:`, err);
      return { success: false, error: err.message || 'Error de conexión con el servidor' } as unknown as T;
    }
  }

  // --- State & Initial Load ---
  static async getState(): Promise<{ success: boolean; data?: ServerState; error?: string }> {
    return this.request<{ success: boolean; data?: ServerState; error?: string }>('/api/state');
  }

  // --- Auth ---
  static async loginAdmin(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.request('/api/auth/login-admin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static async loginClient(emailOrPhone: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.request('/api/auth/login-client', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
  }

  static async registerClient(name: string, email: string, phone: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
  }

  // --- Court Facilities ---
  static async addFacility(facilityData: Omit<CourtFacility, 'id'>): Promise<{ success: boolean; facility?: CourtFacility; error?: string }> {
    return this.request('/api/facilities/add', {
      method: 'POST',
      body: JSON.stringify(facilityData),
    });
  }

  static async updateFacility(id: string, updates: Partial<CourtFacility>): Promise<{ success: boolean; facility?: CourtFacility; error?: string }> {
    return this.request(`/api/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteFacility(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/facilities/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Court Slots ---
  static async addCourtSlot(slotData: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>): Promise<{ success: boolean; slot?: CourtSlot; error?: string }> {
    return this.request('/api/courts/add', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  }

  static async batchAddCourtSlots(slots: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>[]): Promise<{
    success: boolean;
    createdCount?: number;
    skippedCount?: number;
    createdSlots?: CourtSlot[];
    error?: string;
  }> {
    return this.request('/api/courts/batch-add', {
      method: 'POST',
      body: JSON.stringify({ slots }),
    });
  }

  static async updateCourtSlot(id: string, updates: Partial<CourtSlot>): Promise<{ success: boolean; slot?: CourtSlot; error?: string }> {
    return this.request(`/api/courts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteCourtSlot(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/courts/${id}`, {
      method: 'DELETE',
    });
  }

  static async bookCourtSlot(slotId: string, user: User): Promise<{ success: boolean; slot?: CourtSlot; error?: string }> {
    return this.request('/api/courts/book', {
      method: 'POST',
      body: JSON.stringify({ slotId, user }),
    });
  }

  static async cancelCourtSlot(slotId: string, userId: string, isAdmin: boolean = false): Promise<{ success: boolean; error?: string }> {
    return this.request('/api/courts/cancel', {
      method: 'POST',
      body: JSON.stringify({ slotId, userId, isAdmin }),
    });
  }

  // --- Fitness Classes ---
  static async addFitnessClass(classData: Omit<FitnessClass, 'id' | 'participants' | 'waitingList'>): Promise<{
    success: boolean;
    fitClass?: FitnessClass;
    error?: string;
  }> {
    return this.request('/api/classes/add', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  static async updateFitnessClass(id: string, updates: Partial<FitnessClass>): Promise<{
    success: boolean;
    fitClass?: FitnessClass;
    promotedCount?: number;
    error?: string;
  }> {
    return this.request(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteFitnessClass(id: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/api/classes/${id}`, {
      method: 'DELETE',
    });
  }

  static async enrollFitnessClass(classId: string, user: User): Promise<{
    success: boolean;
    status?: 'confirmed' | 'waitlist';
    position?: number;
    error?: string;
  }> {
    return this.request('/api/classes/enroll', {
      method: 'POST',
      body: JSON.stringify({ classId, user }),
    });
  }

  static async cancelFitnessClass(classId: string, userId: string): Promise<{
    success: boolean;
    promotedUser?: string;
    error?: string;
  }> {
    return this.request('/api/classes/cancel', {
      method: 'POST',
      body: JSON.stringify({ classId, userId }),
    });
  }

  static async adminEnrollUser(
    classId: string,
    attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }
  ): Promise<{ success: boolean; status?: 'confirmed' | 'waitlist'; error?: string }> {
    return this.request(`/api/classes/${classId}/admin-enroll`, {
      method: 'POST',
      body: JSON.stringify({ attendee }),
    });
  }

  static async adminRemoveUser(
    classId: string,
    targetUserId: string
  ): Promise<{ success: boolean; promotedUser?: string; error?: string }> {
    return this.request(`/api/classes/${classId}/admin-remove`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }

  // --- Database Admin Actions ---
  static async resetDatabase(): Promise<{ success: boolean; message?: string }> {
    return this.request('/api/database/reset', { method: 'POST' });
  }

  // --- Real-time SSE Connection ---
  static subscribeToEvents(
    onMessage: (event: any) => void,
    onStatusChange?: (connected: boolean) => void
  ): () => void {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          if (onStatusChange) onStatusChange(true);
        };

        eventSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            onMessage(parsed);
          } catch (err) {
            console.warn('[SSE] Parse error:', err);
          }
        };

        eventSource.onerror = () => {
          if (onStatusChange) onStatusChange(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!isDisposed) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        console.error('[SSE] Connection error:', err);
        if (onStatusChange) onStatusChange(false);
        if (!isDisposed) {
          reconnectTimeout = setTimeout(connect, 4000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
      if (onStatusChange) onStatusChange(false);
    };
  }
}
