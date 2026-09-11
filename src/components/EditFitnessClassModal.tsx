import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Dumbbell,
  MapPin,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { FitnessActivityType, FitnessClass } from '../types';
import { FITNESS_INFO_MAP } from '../utils/helpers';

interface EditFitnessClassModalProps {
  isOpen: boolean;
  fitClass: FitnessClass | null;
  onClose: () => void;
  onSave: (classId: string, updates: Partial<FitnessClass>) => void;
  onDelete?: (classId: string) => void;
}

export const EditFitnessClassModal: React.FC<EditFitnessClassModalProps> = ({
  isOpen,
  fitClass,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !fitClass) return null;

  const [title, setTitle] = useState(fitClass.title);
  const [activity, setActivity] = useState<FitnessActivityType>(fitClass.activity);
  const [instructor, setInstructor] = useState(fitClass.instructor);
  const [room, setRoom] = useState(fitClass.room);
  const [date, setDate] = useState(fitClass.date);
  const [startTime, setStartTime] = useState(fitClass.startTime);
  const [endTime, setEndTime] = useState(fitClass.endTime);
  const [maxCapacity, setMaxCapacity] = useState(fitClass.maxCapacity || 15);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (fitClass) {
      setTitle(fitClass.title);
      setActivity(fitClass.activity);
      setInstructor(fitClass.instructor);
      setRoom(fitClass.room);
      setDate(fitClass.date);
      setStartTime(fitClass.startTime);
      setEndTime(fitClass.endTime);
      setMaxCapacity(fitClass.maxCapacity || 15);
      setShowDeleteConfirm(false);
    }
  }, [fitClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = Math.max(1, parseInt(String(maxCapacity), 10) || 15);
    onSave(fitClass.id, {
      title: title.trim(),
      activity,
      instructor: instructor.trim(),
      room: room.trim(),
      date,
      startTime,
      endTime,
      maxCapacity: capacityNum,
    });
    onClose();
  };

  const willPromoteCount = maxCapacity > fitClass.maxCapacity
    ? Math.min(maxCapacity - fitClass.participants.length, fitClass.waitingList.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Editar Clase y Aforo</h3>
              <p className="text-xs text-slate-500">Modifica el aforo, horarios y datos de la sesión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Activity selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Disciplina
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(FITNESS_INFO_MAP) as FitnessActivityType[]).map((act) => {
                const info = FITNESS_INFO_MAP[act];
                const isSelected = activity === act;
                return (
                  <button
                    type="button"
                    key={act}
                    onClick={() => setActivity(act)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-class-title" className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Clase
              </label>
              <input
                id="edit-class-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-class-instructor" className="block text-xs font-bold text-slate-700 mb-1">
                Monitor/a
              </label>
              <input
                id="edit-class-instructor"
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Room */}
          <div>
            <label htmlFor="edit-class-room" className="block text-xs font-bold text-slate-700 mb-1">
              Sala o Ubicación
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="edit-class-room"
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Date, Start, End */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="edit-class-date" className="block text-xs font-bold text-slate-700 mb-1">
                Fecha
              </label>
              <input
                id="edit-class-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-class-start" className="block text-xs font-bold text-slate-700 mb-1">
                Hora Inicio
              </label>
              <input
                id="edit-class-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-class-end" className="block text-xs font-bold text-slate-700 mb-1">
                Hora Fin
              </label>
              <input
                id="edit-class-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* CAPACITY CONTROL (AFORO) */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <label htmlFor="edit-class-capacity" className="text-xs font-extrabold text-indigo-950 block">
                    Aforo Máximo (Plazas Oficiales)
                  </label>
                  <p className="text-[11px] text-indigo-700">
                    Capacidad oficial permitida para esta clase
                  </p>
                </div>
              </div>
              <div className="w-24">
                <input
                  id="edit-class-capacity"
                  type="number"
                  min="1"
                  max="100"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-center px-3 py-2 bg-white border-2 border-indigo-400 rounded-xl text-base font-extrabold text-indigo-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Current status pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-indigo-100 text-slate-700 font-medium">
                Inscritos actuales: <strong>{fitClass.participants.length}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg border border-indigo-100 text-slate-700 font-medium">
                En lista de espera: <strong>{fitClass.waitingList.length}</strong>
              </span>
            </div>

            {willPromoteCount > 0 && (
              <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium">
                ✨ <strong>Ampliación de aforo:</strong> Al guardar, <strong>{willPromoteCount} persona(s)</strong> de la lista de espera pasarán automáticamente a plaza confirmada y recibirán una notificación push.
              </div>
            )}
          </div>

          {/* Delete confirmation section */}
          {showDeleteConfirm ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-2">
              <p className="font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>¿Estás seguro de que deseas eliminar esta clase?</span>
              </p>
              <p>Se cancelarán todas las inscripciones y la lista de reserva asociada.</p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onDelete) onDelete(fitClass.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Confirmar Eliminación
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            onDelete && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar esta clase del sistema</span>
                </button>
              </div>
            )
          )}

          {/* Bottom actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Guardar Cambios de Clase y Aforo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
