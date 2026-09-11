import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Info,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle
} from 'lucide-react';
import { FitnessActivityType, FitnessClass, User } from '../types';
import { FITNESS_INFO_MAP, formatDayLabel } from '../utils/helpers';
import { getDateString } from '../mockData';
import { EditFitnessClassModal } from './EditFitnessClassModal';
import { AdminEnrollModal } from './AdminEnrollModal';

interface FitnessClassesViewProps {
  classes: FitnessClass[];
  currentUser: User | null;
  users?: User[];
  onEnroll: (fitClass: FitnessClass) => void;
  onCancelEnrollment: (classId: string) => void;
  onDeleteClass?: (classId: string) => void;
  onUpdateClass?: (classId: string, updates: Partial<FitnessClass>) => void;
  onAdminEnrollUser?: (
    classId: string,
    attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }
  ) => { success: boolean; status?: 'confirmed' | 'waitlist'; error?: string };
  onAdminRemoveUser?: (
    classId: string,
    userId: string
  ) => { success: boolean; promotedUser?: string; error?: string };
  onOpenCreateModal?: () => void;
  onRequireAuth: () => void;
}

export const FitnessClassesView: React.FC<FitnessClassesViewProps> = ({
  classes,
  currentUser,
  users = [],
  onEnroll,
  onCancelEnrollment,
  onDeleteClass,
  onUpdateClass,
  onAdminEnrollUser,
  onAdminRemoveUser,
  onOpenCreateModal,
  onRequireAuth,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<FitnessActivityType | 'all'>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // Admin modals
  const [editingFitClass, setEditingFitClass] = useState<FitnessClass | null>(null);
  const [enrollingFitClass, setEnrollingFitClass] = useState<FitnessClass | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  const filteredClasses = classes.filter((c) => {
    if (selectedActivity !== 'all' && c.activity !== selectedActivity) return false;
    if (selectedDateFilter === 'today' && c.date !== todayStr) return false;
    if (selectedDateFilter === 'tomorrow' && c.date !== tomorrowStr) return false;
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const isAdmin = currentUser?.role === 'admin';

  const handleAdminRemove = (classId: string, userId: string, userName: string, isWaitlist: boolean) => {
    if (!onAdminRemoveUser) return;
    const confirmMsg = isWaitlist
      ? `¿Eliminar a ${userName} de la lista de reserva?`
      : `¿Dar de baja a ${userName}? Si hay alguien en reserva, se promocionará de forma inmediata.`;
    
    if (!confirm(confirmMsg)) return;

    const res = onAdminRemoveUser(classId, userId);
    if (res.success) {
      let msg = `Se ha dado de baja a ${userName}.`;
      if (res.promotedUser) {
        msg += ` ¡${res.promotedUser} ha ascendido a plaza oficial!`;
      }
      setAdminFeedback(msg);
      setTimeout(() => setAdminFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <span>Actividades Dirigidas Municipales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Spinning, Zumba, CrossFit y Pilates
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            Aforo controlado por sesión. Si una clase alcanza su capacidad máxima, entrarás automáticamente en lista de reserva. En el momento en que alguien se dé de baja, la primera persona de la lista pasará a tener plaza confirmada.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Aforo oficial por clase (por defecto 15 plazas)</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Promoción automática de lista de reserva</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Avisos push automáticos a tu perfil</span>
            </span>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-[-20px] top-[-20px] w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {isAdmin && onOpenCreateModal && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="text-xs text-indigo-300 font-medium flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Modo Administrador Activo: Puedes cambiar aforos, inscribir o borrar alumnos en tiempo real.</span>
            </div>
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Gestionar en Panel de Administrador</span>
            </button>
          </div>
        )}
      </div>

      {adminFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminFeedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        
        {/* Activity Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="filter-fitness-all"
            onClick={() => setSelectedActivity('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedActivity === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Todas las disciplinas ({classes.length})
          </button>

          {(Object.keys(FITNESS_INFO_MAP) as FitnessActivityType[]).map((act) => {
            const isSelected = selectedActivity === act;
            const info = FITNESS_INFO_MAP[act];
            return (
              <button
                key={act}
                id={`filter-fitness-${act}`}
                onClick={() => setSelectedActivity(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {info.name}
              </button>
            );
          })}
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setSelectedDateFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedDateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Todos los días
          </button>
          <button
            onClick={() => setSelectedDateFilter('today')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedDateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setSelectedDateFilter('tomorrow')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedDateFilter === 'tomorrow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Mañana
          </button>
        </div>

      </div>

      {/* Grid of Fitness Classes */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Dumbbell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No hay clases programadas con estos filtros</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Selecciona otra disciplina o consulta los días siguientes en la programación del pabellón.
          </p>
          <button
            onClick={() => {
              setSelectedActivity('all');
              setSelectedDateFilter('all');
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Ver todas las clases disponibles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((fitClass) => {
            const info = FITNESS_INFO_MAP[fitClass.activity];
            const dateLabel = formatDayLabel(fitClass.date);

            const isParticipant = currentUser
              ? fitClass.participants.some((p) => p.userId === currentUser.id)
              : false;

            const waitingEntry = currentUser
              ? fitClass.waitingList.find((w) => w.userId === currentUser.id)
              : null;

            const isFull = fitClass.participants.length >= fitClass.maxCapacity;
            const availableSpots = Math.max(0, fitClass.maxCapacity - fitClass.participants.length);
            const percentFilled = (fitClass.participants.length / fitClass.maxCapacity) * 100;
            const isExpanded = expandedClassId === fitClass.id;

            return (
              <div
                key={fitClass.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isParticipant
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : waitingEntry
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${info.badgeBg}`}>
                      {info.name}
                    </span>

                    {/* User Status or Capacity Badge */}
                    {isParticipant ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Plaza Confirmada
                      </span>
                    ) : waitingEntry ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⏳ Reserva Puesto #{waitingEntry.position}
                      </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                        Completa ({fitClass.participants.length}/{fitClass.maxCapacity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {availableSpots} {availableSpots === 1 ? 'plaza libre' : 'plazas libres'}
                      </span>
                    )}
                  </div>

                  {/* Class Title & Instructor */}
                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {fitClass.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 flex items-center space-x-1">
                    <span>Monitor/a: <strong className="text-slate-700 font-semibold">{fitClass.instructor}</strong></span>
                  </p>

                  {/* Date, Time & Room */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dateLabel.dayName} {dateLabel.dayNumber} {dateLabel.monthName}</span>
                      </div>
                      <div className="flex items-center space-x-1 font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{fitClass.startTime} - {fitClass.endTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 pt-1 border-t border-slate-200/60">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fitClass.room}</span>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">
                        Aforo: <strong className="text-slate-900">{fitClass.participants.length} / {fitClass.maxCapacity} plazas</strong>
                      </span>
                      {fitClass.waitingList.length > 0 && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                          {fitClass.waitingList.length} en reserva
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : percentFilled >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentFilled)}%` }}
                      />
                    </div>
                  </div>

                  {/* Admin inline controls: Enroll, Edit Capacity */}
                  {isAdmin && (
                    <div className="mb-3 p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between gap-1 text-xs">
                      <button
                        onClick={() => setEnrollingFitClass(fitClass)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Inscribir</span>
                      </button>

                      <button
                        onClick={() => setEditingFitClass(fitClass)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Aforo ({fitClass.maxCapacity})</span>
                      </button>
                    </div>
                  )}

                  {/* Waiting list notice if full */}
                  {isFull && !isParticipant && !waitingEntry && !isAdmin && (
                    <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Clase al aforo máximo ({fitClass.maxCapacity} personas)</span>
                        Si te apuntas ahora, entrarás en el puesto #{fitClass.waitingList.length + 1} de la lista de reserva. En cuanto alguien se dé de baja, ocuparás su lugar automáticamente.
                      </div>
                    </div>
                  )}

                  {/* View attendees button toggle */}
                  <button
                    onClick={() => setExpandedClassId(isExpanded ? null : fitClass.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-3 flex items-center space-x-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Ocultar asistentes' : 'Ver lista de asistentes y reserva'}</span>
                  </button>

                  {/* Expanded attendees and waitlist list */}
                  {isExpanded && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 animate-in fade-in duration-150">
                      <div>
                        <p className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                          <span>Plazas confirmadas ({fitClass.participants.length}/{fitClass.maxCapacity}):</span>
                        </p>
                        {fitClass.participants.length === 0 ? (
                          <p className="text-slate-400 italic">No hay nadie apuntado aún</p>
                        ) : (
                          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                            {fitClass.participants.map((p, idx) => (
                              <div key={p.userId} className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200 text-slate-700">
                                <div>
                                  <span className="font-semibold">{idx + 1}. {p.userName}</span>
                                  {isAdmin && <span className="text-[10px] text-slate-500 block">Tel: {p.userPhone}</span>}
                                </div>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleAdminRemove(fitClass.id, p.userId, p.userName, false)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                    title="Dar de baja a este alumno"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {fitClass.waitingList.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="font-bold text-amber-800 mb-1">
                            Lista de espera / Reserva ({fitClass.waitingList.length}):
                          </p>
                          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                            {fitClass.waitingList.map((w) => (
                              <div key={w.userId} className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-amber-200 text-amber-950">
                                <div>
                                  <span className="font-semibold">Puesto #{w.position}: {w.userName}</span>
                                  {isAdmin && <span className="text-[10px] text-slate-500 block">Tel: {w.userPhone}</span>}
                                </div>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleAdminRemove(fitClass.id, w.userId, w.userName, true)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                    title="Quitar de la lista de espera"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Actions bottom bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isParticipant ? (
                    <button
                      id={`cancel-class-${fitClass.id}`}
                      onClick={() => onCancelEnrollment(fitClass.id)}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Darme de baja de la clase</span>
                    </button>
                  ) : waitingEntry ? (
                    <button
                      id={`cancel-waitlist-${fitClass.id}`}
                      onClick={() => onCancelEnrollment(fitClass.id)}
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Salir de la lista de espera (Puesto #{waitingEntry.position})</span>
                    </button>
                  ) : (
                    <button
                      id={`enroll-class-${fitClass.id}`}
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth();
                        } else {
                          onEnroll(fitClass);
                        }
                      }}
                      className={`w-full py-2 px-4 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 ${
                        isFull
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {isFull ? (
                        <span>Apuntarme en Reserva (Puesto #{fitClass.waitingList.length + 1})</span>
                      ) : (
                        <span>Apuntarme a esta clase</span>
                      )}
                    </button>
                  )}

                  {/* Admin delete class button */}
                  {isAdmin && onDeleteClass && (
                    <button
                      id={`delete-class-${fitClass.id}`}
                      onClick={() => onDeleteClass(fitClass.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
                      title="Eliminar clase como administrador"
                      aria-label="Eliminar clase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Info card regarding waiting list automation */}
      <div className="bg-indigo-50/70 rounded-2xl p-4 sm:p-5 border border-indigo-100 text-xs text-indigo-900 flex items-start space-x-3">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-indigo-950">
            Reglamento Oficial de Clases Dirigidas (Spinning, Zumba, CrossFit, Pilates)
          </p>
          <p>
            • Cada sesión tiene un aforo configurado por el administrador para garantizar la calidad y seguridad técnica de los vecinos.
          </p>
          <p>
            • Si una clase alcanza su capacidad, cualquier inscripción adicional pasa a la <strong>Lista de Reserva</strong> con su orden estricto de llegada.
          </p>
          <p>
            • <strong>Asignación y Promoción Automática:</strong> En el instante en que un participante se da de baja (o el administrador amplía el aforo), el sistema promociona de forma inmediata a la primera persona en lista de espera a plaza confirmada y le envía una notificación.
          </p>
          <p>
            • El administrador municipal puede gestionar en todo momento los alumnos inscritos, las listas de reserva y ajustar el aforo oficial.
          </p>
        </div>
      </div>

      {/* Modals for admin actions */}
      <EditFitnessClassModal
        isOpen={Boolean(editingFitClass)}
        fitClass={editingFitClass}
        onClose={() => setEditingFitClass(null)}
        onSave={(classId, updates) => {
          if (onUpdateClass) {
            onUpdateClass(classId, updates);
            setAdminFeedback('Clase y aforo actualizados correctamente');
            setTimeout(() => setAdminFeedback(null), 4000);
          }
        }}
        onDelete={onDeleteClass}
      />

      <AdminEnrollModal
        isOpen={Boolean(enrollingFitClass)}
        fitClass={enrollingFitClass}
        users={users}
        onClose={() => setEnrollingFitClass(null)}
        onEnrollUser={(classId, attendee) => {
          if (!onAdminEnrollUser) return { success: false, error: 'No autorizado' };
          const res = onAdminEnrollUser(classId, attendee);
          if (res.success) {
            setAdminFeedback(`¡${attendee.userName} inscrito con éxito en la clase!`);
            setTimeout(() => setAdminFeedback(null), 4000);
          }
          return res;
        }}
      />

    </div>
  );
};
