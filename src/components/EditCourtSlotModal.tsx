import React, { useState, useEffect } from 'react';
import { Clock, Euro, MapPin, X, Check, Trash2, User, Phone, Mail } from 'lucide-react';
import { CourtSlot, SportCourtType } from '../types';
import { SPORT_INFO_MAP } from '../utils/helpers';

interface EditCourtSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: CourtSlot | null;
  onSave: (slotId: string, updates: Partial<CourtSlot>) => void;
  onDelete?: (slotId: string) => void;
  onLiberate?: (slotId: string) => void;
}

export const EditCourtSlotModal: React.FC<EditCourtSlotModalProps> = ({
  isOpen,
  onClose,
  slot,
  onSave,
  onDelete,
  onLiberate,
}) => {
  const [courtName, setCourtName] = useState('');
  const [sport, setSport] = useState<SportCourtType>('padel');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState<number>(8);

  useEffect(() => {
    if (slot) {
      setCourtName(slot.courtName);
      setSport(slot.sport);
      setDate(slot.date);
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setPrice(slot.price);
    }
  }, [slot]);

  if (!isOpen || !slot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(slot.id, {
      courtName,
      sport,
      date,
      startTime,
      endTime,
      price: Number(price),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-1">
            <span>Edición de Administrador</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Editar Franja Horaria y Tarifa
          </h2>
          <p className="text-xs text-slate-500">
            Modifica el precio, horario o pista de esta franja.
          </p>
        </div>

        {/* If slot is booked, show tenant information */}
        {slot.isBooked && (
          <div className="mb-5 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-amber-700" />
                <span>Pista Alquilada Actualmente</span>
              </span>
              {onLiberate && (
                <button
                  type="button"
                  onClick={() => {
                    onLiberate(slot.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-[11px] transition-colors"
                >
                  Liberar Pista (Borrar Alquiler)
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1 border-t border-amber-200/60">
              <div>
                <span className="text-slate-500">Inquilino:</span>{' '}
                <strong>{slot.bookedBy?.userName}</strong>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{slot.bookedBy?.userPhone}</span>
              </div>
              <div className="flex items-center space-x-1 col-span-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{slot.bookedBy?.userEmail || 'Email no especificado'}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Court Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nombre de la Pista
            </label>
            <input
              type="text"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Sport Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Deporte
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as SportCourtType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {(Object.keys(SPORT_INFO_MAP) as SportCourtType[]).map((sp) => (
                <option key={sp} value={sp}>
                  {SPORT_INFO_MAP[sp].name}
                </option>
              ))}
            </select>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hora Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hora Fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Precio / Tarifa de Alquiler (€)
            </label>
            <div className="relative">
              <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.5"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Puedes ajustar el precio de esta pista a cualquier tarifa.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Seguro que deseas eliminar esta franja horaria definitivamente?')) {
                    onDelete(slot.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Horario</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
