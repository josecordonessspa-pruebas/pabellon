import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { CourtScheduleView } from './components/CourtScheduleView';
import { FitnessClassesView } from './components/FitnessClassesView';
import { UserProfileView } from './components/UserProfileView';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { NotificationDrawer } from './components/NotificationDrawer';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import { CourtFacility, CourtSlot, FitnessClass, PushNotification, User } from './types';
import { triggerSystemNotification } from './utils/audio';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courtSlots, setCourtSlots] = useState<CourtSlot[]>([]);
  const [courtFacilities, setCourtFacilities] = useState<CourtFacility[]>([]);
  const [fitnessClasses, setFitnessClasses] = useState<FitnessClass[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);
  
  const [activeTab, setActiveTab] = useState<'courts' | 'classes' | 'profile' | 'admin'>('courts');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'admin'>('login');
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  // Initialize storage & state on mount + setup real-time SSE
  useEffect(() => {
    StorageService.init();
    loadAllData();

    // Real-time Server-Sent Events (SSE) listener
    const unsubscribe = ApiService.subscribeToEvents(
      (event) => {
        // Any real-time broadcast from the backend refreshes the view immediately
        loadAllData();
      },
      (connected) => {
        setIsRealtimeConnected(connected);
      }
    );

    // Resilient periodic sync every 4 seconds as background fallback
    const pollInterval = setInterval(() => {
      loadAllData();
    }, 4000);

    const handleVisibility = () => {
      if (!document.hidden) {
        loadAllData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const loadAllData = async () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);

    // Initial instant paint from cached local storage
    setCourtSlots(StorageService.getCourtSlots());
    setCourtFacilities(StorageService.getCourtFacilities());
    setFitnessClasses(StorageService.getFitnessClasses());
    setNotifications(StorageService.getNotifications(user?.id));
    setUsers(StorageService.getUsers());

    // Live sync from server JSON database
    try {
      const res = await ApiService.getState();
      if (res.success && res.data) {
        setCourtSlots(res.data.courtSlots);
        setCourtFacilities(res.data.facilities);
        setFitnessClasses(res.data.fitnessClasses);
        setUsers(res.data.users);
        const filteredNotifs = user ? res.data.notifications.filter(n => n.userId === user.id) : [];
        setNotifications(filteredNotifs);

        // Update local cache
        StorageService.saveCourtSlots(res.data.courtSlots);
        StorageService.saveCourtFacilities(res.data.facilities);
        StorageService.saveFitnessClasses(res.data.fitnessClasses);
        StorageService.saveUsers(res.data.users);
        setIsRealtimeConnected(true);
      }
    } catch {
      // Offline or starting
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setNotifications(StorageService.getNotifications(user.id));
    loadAllData();
    // If admin logged in, redirect to admin tab
    if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setNotifications([]);
    if (activeTab === 'admin' || activeTab === 'profile') {
      setActiveTab('courts');
    }
  };

  // --- Court Bookings (Real-time synced) ---
  const handleBookSlot = async (slot: CourtSlot) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }

    const apiRes = await ApiService.bookCourtSlot(slot.id, currentUser);
    if (apiRes.success && apiRes.slot) {
      await loadAllData();
      const notif: PushNotification = {
        id: `toast-${Date.now()}`,
        userId: currentUser.id,
        title: '¡Pista Alquilada con Éxito!',
        body: `Has reservado ${slot.courtName} para el ${slot.date} (${slot.startTime} - ${slot.endTime}). Sincronizado en tiempo real.`,
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'court_booking',
        targetTitle: slot.courtName,
      };
      setActiveToast(notif);
    } else {
      const res = StorageService.bookCourtSlot(slot.id, currentUser);
      if (res.success && res.slot) {
        loadAllData();
      }
    }
  };

  const handleCancelSlot = async (slotId: string) => {
    if (!currentUser) return;
    const isAdmin = currentUser.role === 'admin';
    const apiRes = await ApiService.cancelCourtSlot(slotId, currentUser.id, isAdmin);
    if (apiRes.success) {
      await loadAllData();
      const notif: PushNotification = {
        id: `toast-${Date.now()}`,
        userId: currentUser.id,
        title: 'Reserva de Pista Cancelada',
        body: 'La pista ha sido liberada y actualizada para todos los usuarios en tiempo real.',
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'court_cancelled',
        targetTitle: 'Pista deportiva',
      };
      setActiveToast(notif);
    } else {
      StorageService.cancelCourtSlot(slotId, currentUser.id, isAdmin);
      loadAllData();
    }
  };

  // --- Fitness Classes (Real-time synced) ---
  const handleEnrollClass = async (fitClass: FitnessClass) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }

    const apiRes = await ApiService.enrollFitnessClass(fitClass.id, currentUser);
    if (apiRes.success) {
      await loadAllData();
      if (apiRes.status === 'confirmed') {
        const notif: PushNotification = {
          id: `toast-${Date.now()}`,
          userId: currentUser.id,
          title: `¡Plaza Confirmada en ${fitClass.title}!`,
          body: `Tienes plaza oficial (${fitClass.date} a las ${fitClass.startTime}h). Sincronizado en tiempo real.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'class_booking',
          targetTitle: fitClass.title,
        };
        setActiveToast(notif);
      } else {
        const notif: PushNotification = {
          id: `toast-${Date.now()}`,
          userId: currentUser.id,
          title: `En Lista de Espera (#${apiRes.position})`,
          body: `Clase al aforo máximo. Estás en el puesto #${apiRes.position} de reserva. Si alguien se da de baja, entrarás automáticamente.`,
          timestamp: new Date().toISOString(),
          scheduledFor: 'immediate',
          isRead: false,
          type: 'class_booking',
          targetTitle: fitClass.title,
        };
        setActiveToast(notif);
      }
    } else {
      const res = StorageService.enrollInClass(fitClass.id, currentUser);
      if (res.success) {
        loadAllData();
      }
    }
  };

  const handleCancelEnrollment = async (classId: string) => {
    if (!currentUser) return;
    const apiRes = await ApiService.cancelFitnessClass(classId, currentUser.id);
    if (apiRes.success) {
      await loadAllData();
      let msg = 'Te has dado de baja de la clase correctamente.';
      if (apiRes.promotedUser) {
        msg += ` ${apiRes.promotedUser} ocupó automáticamente tu plaza libre desde la lista de espera.`;
      }
      const notif: PushNotification = {
        id: `toast-${Date.now()}`,
        userId: currentUser.id,
        title: 'Baja de Clase Confirmada',
        body: msg,
        timestamp: new Date().toISOString(),
        scheduledFor: 'immediate',
        isRead: false,
        type: 'class_cancelled',
        targetTitle: 'Clase dirigida',
      };
      setActiveToast(notif);
    } else {
      StorageService.cancelClassEnrollment(classId, currentUser.id);
      loadAllData();
    }
  };

  // --- Admin Slot/Class Creation, Editing & Deletion (Real-time synced) ---
  const handleAddCourtSlot = async (slotData: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>) => {
    const apiRes = await ApiService.addCourtSlot(slotData);
    if (apiRes.success) {
      await loadAllData();
      return apiRes;
    }
    const localRes = StorageService.addCourtSlot(slotData);
    if (localRes.success) loadAllData();
    return apiRes.error ? apiRes : localRes;
  };

  const handleUpdateCourtSlot = async (slotId: string, updates: Partial<CourtSlot>) => {
    const apiRes = await ApiService.updateCourtSlot(slotId, updates);
    if (apiRes.success) {
      await loadAllData();
      return apiRes;
    }
    const localRes = StorageService.updateCourtSlot(slotId, updates);
    if (localRes.success) loadAllData();
    return apiRes.error ? apiRes : localRes;
  };

  const handleDeleteCourtSlot = async (slotId: string) => {
    await ApiService.deleteCourtSlot(slotId);
    StorageService.deleteCourtSlot(slotId);
    await loadAllData();
  };

  // --- Admin Facilities & Price Management ---
  const handleAddCourtFacility = async (facilityData: Omit<CourtFacility, 'id'>) => {
    await ApiService.addFacility(facilityData);
    StorageService.addCourtFacility(facilityData);
    await loadAllData();
  };

  const handleUpdateCourtFacility = async (facilityId: string, updates: Partial<CourtFacility>) => {
    await ApiService.updateFacility(facilityId, updates);
    StorageService.updateCourtFacility(facilityId, updates);
    await loadAllData();
  };

  const handleDeleteCourtFacility = async (facilityId: string) => {
    await ApiService.deleteFacility(facilityId);
    StorageService.deleteCourtFacility(facilityId);
    await loadAllData();
  };

  const handleAddFitnessClass = async (classData: Omit<FitnessClass, 'id' | 'participants' | 'waitingList'>) => {
    const apiRes = await ApiService.addFitnessClass(classData);
    if (apiRes.success) {
      await loadAllData();
      return apiRes;
    }
    const localRes = StorageService.addFitnessClass(classData);
    if (localRes.success) loadAllData();
    return apiRes.error ? apiRes : localRes;
  };

  const handleUpdateFitnessClass = async (classId: string, updates: Partial<FitnessClass>) => {
    const apiRes = await ApiService.updateFitnessClass(classId, updates);
    if (apiRes.success) {
      await loadAllData();
      return apiRes;
    }
    const localRes = StorageService.updateFitnessClass(classId, updates);
    if (localRes.success) loadAllData();
    return apiRes.error ? apiRes : localRes;
  };

  const handleDeleteFitnessClass = async (classId: string) => {
    await ApiService.deleteFitnessClass(classId);
    StorageService.deleteFitnessClass(classId);
    await loadAllData();
  };

  const handleAdminEnrollInClass = async (
    classId: string,
    attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }
  ) => {
    const apiRes = await ApiService.adminEnrollUser(classId, attendee);
    if (apiRes.success) {
      await loadAllData();
      return apiRes;
    }
    const localRes = StorageService.adminEnrollUserInClass(classId, attendee);
    if (localRes.success) loadAllData();
    return apiRes.error ? apiRes : localRes;
  };

  const handleAdminRemoveFromClass = async (classId: string, targetUserId: string) => {
    const apiRes = await ApiService.adminRemoveUser(classId, targetUserId);
    if (apiRes.success) {
      await loadAllData();
      return apiRes;
    }
    const localRes = StorageService.adminRemoveUserFromClass(classId, targetUserId);
    if (localRes.success) loadAllData();
    return apiRes.error ? apiRes : localRes;
  };

  // --- Push Notification Testing (Requirement 9) ---
  const handleTriggerTestNotification = () => {
    const title = '⏰ Recordatorio (1 hora antes): Pista Pádel 1';
    const body = 'Tu reserva en Pista Pádel 1 comienza en 1 hora (a las 19:00h). ¡Recuerda llevar tu pala y calzado deportivo!';
    
    triggerSystemNotification(title, body);

    const testNotif: PushNotification = {
      id: `test-${Date.now()}`,
      userId: currentUser?.id || 'demo',
      title,
      body,
      timestamp: new Date().toISOString(),
      scheduledFor: 'test',
      isRead: false,
      type: 'one_hour_reminder',
      targetTitle: 'Pista Pádel 1',
    };

    setActiveToast(testNotif);

    if (currentUser) {
      StorageService.addNotification(testNotif);
      setNotifications(StorageService.getNotifications(currentUser.id));
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    if (currentUser) {
      StorageService.markAllNotificationsRead(currentUser.id);
      setNotifications(StorageService.getNotifications(currentUser.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Floating Push Notification Toast */}
      <PushNotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onTriggerTestNotification={handleTriggerTestNotification}
      />

      {/* Auth Modal (Login / Register / Admin Login) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW 1: COURTS & CALENDAR */}
        {activeTab === 'courts' && (
          <CourtScheduleView
            slots={courtSlots}
            currentUser={currentUser}
            onBookSlot={handleBookSlot}
            onCancelSlot={handleCancelSlot}
            onDeleteSlot={currentUser?.role === 'admin' ? handleDeleteCourtSlot : undefined}
            onEditSlot={currentUser?.role === 'admin' ? handleUpdateCourtSlot : undefined}
            onOpenCreateModal={currentUser?.role === 'admin' ? () => setActiveTab('admin') : undefined}
            onRequireAuth={() => handleOpenAuth('register')}
          />
        )}

        {/* VIEW 2: DIRECTED CLASSES (SPINNING, ZUMBA, CROSSFIT, PILATES) */}
        {activeTab === 'classes' && (
          <FitnessClassesView
            classes={fitnessClasses}
            currentUser={currentUser}
            users={users}
            onEnroll={handleEnrollClass}
            onCancelEnrollment={handleCancelEnrollment}
            onDeleteClass={currentUser?.role === 'admin' ? handleDeleteFitnessClass : undefined}
            onUpdateClass={currentUser?.role === 'admin' ? handleUpdateFitnessClass : undefined}
            onAdminEnrollUser={currentUser?.role === 'admin' ? handleAdminEnrollInClass : undefined}
            onAdminRemoveUser={currentUser?.role === 'admin' ? handleAdminRemoveFromClass : undefined}
            onOpenCreateModal={currentUser?.role === 'admin' ? () => setActiveTab('admin') : undefined}
            onRequireAuth={() => handleOpenAuth('register')}
          />
        )}

        {/* VIEW 3: USER PROFILE & BOOKINGS MANAGEMENT */}
        {activeTab === 'profile' && currentUser && (
          <UserProfileView
            currentUser={currentUser}
            courtSlots={courtSlots}
            fitnessClasses={fitnessClasses}
            notifications={notifications}
            onCancelCourt={handleCancelSlot}
            onCancelClass={handleCancelEnrollment}
            onTriggerTestNotification={handleTriggerTestNotification}
          />
        )}

        {/* VIEW 4: ADMIN MANAGEMENT PORTAL */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            courtSlots={courtSlots}
            courtFacilities={courtFacilities}
            fitnessClasses={fitnessClasses}
            users={users}
            onAddCourtSlot={handleAddCourtSlot}
            onUpdateCourtSlot={handleUpdateCourtSlot}
            onDeleteCourtSlot={handleDeleteCourtSlot}
            onCancelCourtSlot={handleCancelSlot}
            onAddCourtFacility={handleAddCourtFacility}
            onUpdateCourtFacility={handleUpdateCourtFacility}
            onDeleteCourtFacility={handleDeleteCourtFacility}
            onAddFitnessClass={handleAddFitnessClass}
            onUpdateFitnessClass={handleUpdateFitnessClass}
            onDeleteFitnessClass={handleDeleteFitnessClass}
            onAdminEnrollUser={handleAdminEnrollInClass}
            onAdminRemoveUser={handleAdminRemoveFromClass}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
              PM
            </div>
            <span className="font-semibold text-slate-700">Pabellón Polideportivo Municipal</span>
            <span>·</span>
            <span>Gestión integral de pistas y clases</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Pádel · Fútbol 7 · Tenis · Fútbol 11</span>
            <span>·</span>
            <span>Spinning · Zumba · CrossFit · Pilates</span>
            <span>·</span>
            <button
              onClick={() => handleOpenAuth('admin')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Acceso Administrador
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
