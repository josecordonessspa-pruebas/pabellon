import React from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  XCircle
} from 'lucide-react';
import { CourtSlot, FitnessClass, PushNotification, User } from '../types';
import { FITNESS_INFO_MAP, formatDayLabel, formatPrice, SPORT_INFO_MAP } from '../utils/helpers';
import { requestBrowserNotificationPermission, triggerSystemNotification } from '../utils/audio';

interface UserProfileViewProps {
  currentUser: User;
  courtSlots: CourtSlot[];
  fitnessClasses: FitnessClass[];
  notifications: PushNotification[];
  onCancelCourt: (slotId: string) => void;
  onCancelClass: (classId: string) => void;
  onTriggerTestNotification: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  courtSlots,
  fitnessClasses,
  notifications,
  onCancelCourt,
  onCancelClass,
  onTriggerTestNotification,
}) => {
  // Find current user's booked courts
  const myBookedCourts = courtSlots.filter(
    (s) => s.isBooked && s.bookedBy?.userId === currentUser.id
  ).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  // Find current user's enrolled classes (confirmed or waitlist)
  const myClasses = fitnessClasses.map((fc) => {
    const isParticipant = fc.participants.some((p) => p.userId === currentUser.id);
    const waitingEntry = fc.waitingList.find((w) => w.userId === currentUser.id);
    return {
      classData: fc,
      isParticipant,
      waitingEntry,
    };
  }).filter((item) => item.isParticipant || item.waitingEntry).sort((a, b) => {
    if (a.classData.date !== b.classData.date) return a.classData.date.localeCompare(b.classData.date);
    return a.classData.startTime.localeCompare(b.classData.startTime);
  });

  const handleRequestPushPerm = async () => {
    const res = await requestBrowserNotificationPermission();
    if (res === 'granted') {
      triggerSystemNotification(
        'Notificaciones Push Activadas',
        'Recibirás un aviso automático en este dispositivo 1 hora antes de tus pistas y clases.'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl ${currentUser.avatarColor || 'bg-emerald-600'} text-white flex items-center justify-center text-2xl font-bold shadow-md`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentUser.role === 'admin'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentUser.role === 'admin' ? 'Administrador' : 'Usuario Registrado'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>{currentUser.email}</span>
              <span>·</span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.phone}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
            <span className="text-xl font-black text-slate-900">{myBookedCourts.length}</span>
            <p className="text-[11px] font-medium text-slate-500">Pistas</p>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-xl text-center border border-emerald-100">
            <span className="text-xl font-black text-emerald-700">
              {myClasses.filter((c) => c.isParticipant).length}
            </span>
            <p className="text-[11px] font-medium text-emerald-800">Clases</p>
          </div>
          <div className="bg-amber-50/70 p-3 rounded-xl text-center border border-amber-100">
            <span className="text-xl font-black text-amber-700">
              {myClasses.filter((c) => c.waitingEntry).length}
            </span>
            <p className="text-[11px] font-medium text-amber-800">En Reserva</p>
          </div>
        </div>
      </div>

      {/* Push Notification Controls Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-xs">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Sistema de Notificaciones Push Automáticas</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold">
            Avisos en el Móvil 1 Hora Antes de Cada Actividad
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Cada vez que alquilas una pista o te apuntas a una clase, el sistema programa automáticamente una notificación push para avisarte 60 minutos antes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="enable-browser-push-btn"
            onClick={handleRequestPushPerm}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Activar Push en Dispositivo
          </button>
          <button
            id="simulate-one-hour-push-btn"
            onClick={onTriggerTestNotification}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all"
          >
            🔔 Probar Notificación Push (1h antes)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: MIS PISTAS ALQUILADAS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Mis Pistas Alquiladas</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {myBookedCourts.length} activas
            </span>
          </div>

          {myBookedCourts.length === 0 ? (
            <div className="bg-white rounded-2xl p-7 text-center border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">No tienes ninguna pista alquilada actualmente.</p>
              <p className="text-xs text-slate-400">
                Consulta los horarios en la sección de Pistas para alquilar Pádel, Fútbol 7, Tenis o Fútbol 11.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookedCourts.map((slot) => {
                const sportInfo = SPORT_INFO_MAP[slot.sport];
                const dateLabel = formatDayLabel(slot.date);
                return (
                  <div
                    key={slot.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${sportInfo.badgeBg}`}>
                          {sportInfo.name}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Confirmada · {formatPrice(slot.price)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-1">{slot.courtName}</h3>

                      <div className="flex items-center space-x-3 text-xs text-slate-600 mb-3">
                        <div className="flex items-center space-x-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateLabel.dayName} {dateLabel.dayNumber} {dateLabel.monthName}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center space-x-1 font-semibold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                      </div>

                      <div className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/80 text-[11px] text-emerald-900 flex items-center space-x-1.5 mb-3">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Aviso automático programado 1 hora antes de la reserva.</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        id={`profile-cancel-court-${slot.id}`}
                        onClick={() => onCancelCourt(slot.id)}
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors border border-rose-200 flex items-center space-x-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar Reserva</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: MIS CLASES DIRIGIDAS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Mis Clases Dirigidas</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {myClasses.length} inscritas
            </span>
          </div>

          {myClasses.length === 0 ? (
            <div className="bg-white rounded-2xl p-7 text-center border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">No estás apuntado a ninguna clase actualmente.</p>
              <p className="text-xs text-slate-400">
                Apúntate a Spinning, Zumba, CrossFit o Pilates con aforo limitado a 15 personas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClasses.map(({ classData, isParticipant, waitingEntry }) => {
                const info = FITNESS_INFO_MAP[classData.activity];
                const dateLabel = formatDayLabel(classData.date);
                return (
                  <div
                    key={classData.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs transition-all flex flex-col justify-between ${
                      isParticipant ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${info.badgeBg}`}>
                          {info.name}
                        </span>

                        {isParticipant ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            ✓ Plaza Confirmada
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                            ⏳ En Reserva (Puesto #{waitingEntry?.position})
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-1">{classData.title}</h3>
                      <p className="text-xs text-slate-500 mb-2">Monitor/a: {classData.instructor}</p>

                      <div className="flex items-center space-x-3 text-xs text-slate-600 mb-3">
                        <div className="flex items-center space-x-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateLabel.dayName} {dateLabel.dayNumber}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center space-x-1 font-semibold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{classData.startTime} - {classData.endTime}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center space-x-1 text-slate-500 truncate max-w-[130px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{classData.room}</span>
                        </div>
                      </div>

                      {/* Promotion automation note */}
                      {waitingEntry ? (
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 mb-3">
                          <strong>En lista de espera:</strong> Si algún asistente confirmado se da de baja, el sistema te promocionará de inmediato a plaza confirmada y recibirás una notificación push instantánea.
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 mb-3">
                          ✓ Plaza reglamentaria asignada (máx 15). Notificación push 1 hora antes.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        id={`profile-cancel-class-${classData.id}`}
                        onClick={() => onCancelClass(classData.id)}
                        className={`py-1.5 px-3 font-semibold text-xs rounded-xl transition-colors border flex items-center space-x-1.5 ${
                          waitingEntry
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{waitingEntry ? 'Salir de Lista de Espera' : 'Darme de baja de la clase'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Real-time Notifications Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Historial de Notificaciones Push Recibidas</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {notifications.length} notificaciones
          </span>
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No tienes notificaciones registradas todavía.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {notifications.map((notif) => (
              <div key={notif.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600">{notif.body}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded-full shrink-0">
                  Push Entregada
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
