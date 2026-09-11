import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Info,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCheck,
  XCircle
} from 'lucide-react';
import { CourtSlot, SportCourtType, User } from '../types';
import { formatDayLabel, formatPrice, SPORT_INFO_MAP } from '../utils/helpers';
import { getDateString } from '../mockData';
import { EditCourtSlotModal } from './EditCourtSlotModal';

interface CourtScheduleViewProps {
  slots: CourtSlot[];
  currentUser: User | null;
  onBookSlot: (slot: CourtSlot) => void;
  onCancelSlot: (slotId: string) => void;
  onDeleteSlot?: (slotId: string) => void;
  onEditSlot?: (slotId: string, updates: Partial<CourtSlot>) => void;
  onOpenCreateModal?: () => void;
  onRequireAuth: () => void;
}

export const CourtScheduleView: React.FC<CourtScheduleViewProps> = ({
  slots,
  currentUser,
  onBookSlot,
  onCancelSlot,
  onDeleteSlot,
  onEditSlot,
  onOpenCreateModal,
  onRequireAuth,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getDateString(0));
  const [selectedSport, setSelectedSport] = useState<SportCourtType | 'all'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<CourtSlot | null>(null);

  // Generate 7-day strip for quick selection
  const daysStrip = Array.from({ length: 7 }, (_, i) => {
    const dStr = getDateString(i);
    const label = formatDayLabel(dStr);
    return { dateStr: dStr, ...label };
  });

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    const year = prev.getFullYear();
    const month = String(prev.getMonth() + 1).padStart(2, '0');
    const day = String(prev.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, '0');
    const day = String(next.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    if (slot.date !== selectedDate) return false;
    if (selectedSport !== 'all' && slot.sport !== selectedSport) return false;
    if (onlyAvailable && slot.isBooked) return false;
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const currentDateLabel = formatDayLabel(selectedDate);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
            <span>Disponibilidad Oficial en Tiempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Reserva de Pistas Deportivas
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            Consulta los horarios dados de alta por la administración municipal para Pádel, Fútbol 7, Tenis y Fútbol 11. Reserva tu pista al instante.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Notificación push automática 1h antes</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Gestión y cancelación desde tu perfil</span>
            </span>
          </div>
        </div>

        {/* Decorative badge in background */}
        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {isAdmin && onOpenCreateModal && (
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-emerald-300 font-medium flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Modo Administrador activado: Control total de pistas, tarifas, edición y horarios</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="admin-add-court-slot-btn"
                onClick={onOpenCreateModal}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Dar de alta horario / Crear pista</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Calendar Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {currentDateLabel.dayName}, {currentDateLabel.dayNumber} {currentDateLabel.monthName}
                {currentDateLabel.relative && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {currentDateLabel.relative}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona el día para ver la ocupación y alquilar tu pista
              </p>
            </div>
          </div>

          {/* Quick date picker & arrows */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-Day Quick Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
          {daysStrip.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`py-2 px-1 sm:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80">
                  {item.dayName.slice(0, 3)}
                </span>
                <span className="text-sm sm:text-base font-extrabold">
                  {item.dayNumber}
                </span>
                {item.relative && (
                  <span className={`text-[9px] px-1 rounded-sm mt-0.5 ${isSelected ? 'bg-emerald-700 text-white' : 'text-emerald-700 font-semibold'}`}>
                    {item.relative}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sport Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSport('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedSport === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas las Pistas
          </button>

          {(Object.keys(SPORT_INFO_MAP) as SportCourtType[]).map((sp) => {
            const info = SPORT_INFO_MAP[sp];
            const isSelected = selectedSport === sp;
            return (
              <button
                key={sp}
                onClick={() => setSelectedSport(sp)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{info.name}</span>
              </button>
            );
          })}
        </div>

        {/* Toggle Only Available */}
        <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 cursor-pointer select-none self-end sm:self-auto">
          <input
            id="toggle-only-available"
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
          />
          <span>Mostrar solo disponibles</span>
        </label>
      </div>

      {/* Slots Grid */}
      {filteredSlots.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/80">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No hay horarios registrados para esta selección</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            {isAdmin
              ? 'Como administrador, puedes dar de alta nuevos horarios disponibles para que los vecinos puedan alquilar las pistas.'
              : 'El administrador aún no ha habilitado horarios para esta fecha o deporte. Prueba a seleccionar otro día.'}
          </p>
          {isAdmin && onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear horario para este día</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const sportInfo = SPORT_INFO_MAP[slot.sport];
            const isUserBooking = currentUser && slot.bookedBy?.userId === currentUser.id;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                  isUserBooking
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : slot.isBooked
                    ? 'border-slate-200 opacity-95 bg-slate-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar: Sport and Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${sportInfo.badgeBg}`}>
                      {sportInfo.name}
                    </span>

                    {isUserBooking ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Tu Reserva
                      </span>
                    ) : slot.isBooked ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Ocupada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Disponible
                      </span>
                    )}
                  </div>

                  {/* Court Name */}
                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                    {slot.courtName}
                  </h3>

                  {/* Time & Duration */}
                  <div className="flex items-center space-x-3 text-xs text-slate-600 mb-4">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <span className="text-slate-400">·</span>
                    <span className="font-bold text-emerald-700 text-sm">{formatPrice(slot.price)}</span>
                  </div>

                  {/* Booking details for Admin or User */}
                  {slot.isBooked && (
                    <div className="mb-4 p-3 bg-slate-100/90 rounded-xl text-xs border border-slate-200/80 space-y-1">
                      {isUserBooking ? (
                        <p className="text-emerald-800 font-medium">
                          Reservada a tu nombre. Notificación programada 1h antes.
                        </p>
                      ) : isAdmin ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Datos del Alquiler:</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(slot.bookedBy?.bookedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-800 font-semibold">{slot.bookedBy?.userName}</p>
                          <p className="text-slate-600 flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{slot.bookedBy?.userPhone}</span>
                          </p>
                          {slot.bookedBy?.userEmail && (
                            <p className="text-slate-500 flex items-center space-x-1 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{slot.bookedBy.userEmail}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">Pista alquilada por otro usuario</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isUserBooking ? (
                    <button
                      id={`cancel-slot-${slot.id}`}
                      onClick={() => onCancelSlot(slot.id)}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar Mi Alquiler</span>
                    </button>
                  ) : slot.isBooked ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 font-medium">Alquilada</span>
                      {isAdmin && (
                        <button
                          onClick={() => onCancelSlot(slot.id)}
                          className="text-xs text-rose-700 font-bold px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                          title="Liberar pista como administrador"
                        >
                          Liberar Pista
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      id={`book-slot-${slot.id}`}
                      onClick={() => {
                        if (!currentUser) {
                          onRequireAuth();
                        } else {
                          onBookSlot(slot);
                        }
                      }}
                      className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Alquilar Pista ({formatPrice(slot.price)})</span>
                    </button>
                  )}

                  {/* Admin Edit & Delete Buttons */}
                  {isAdmin && (
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        id={`edit-slot-${slot.id}`}
                        onClick={() => setEditingSlot(slot)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 rounded-xl hover:bg-indigo-50 transition-colors"
                        title="Editar horario o precio de la pista"
                        aria-label="Editar franja y precio"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {onDeleteSlot && (
                        <button
                          id={`delete-slot-${slot.id}`}
                          onClick={() => {
                            if (confirm(`¿Eliminar la franja de ${slot.courtName} (${slot.startTime} - ${slot.endTime})?`)) {
                              onDeleteSlot(slot.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Eliminar este horario"
                          aria-label="Eliminar horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Municipal Court Rules & Information banner */}
      <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Condiciones de Uso de Pistas Municipales</p>
          <p>
            • Las reservas se confirman al instante. Solo clientes registrados con contraseña pueden alquilar y borrar sus pistas alquiladas.
          </p>
          <p>
            • Se enviará una notificación push automática 1 hora antes a tu dispositivo móvil para recordarte tu turno.
          </p>
          <p>
            • La administración municipal supervisa la totalidad de las pistas, tarifas, horarios y altas de instalaciones.
          </p>
        </div>
      </div>

      {/* Edit Slot Modal */}
      <EditCourtSlotModal
        isOpen={Boolean(editingSlot)}
        slot={editingSlot}
        onClose={() => setEditingSlot(null)}
        onSave={(slotId, updates) => {
          if (onEditSlot) {
            onEditSlot(slotId, updates);
          }
        }}
        onDelete={onDeleteSlot}
        onLiberate={onCancelSlot}
      />

    </div>
  );
};
