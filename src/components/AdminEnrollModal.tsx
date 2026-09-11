import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Phone,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { FitnessClass, User } from '../types';

interface AdminEnrollModalProps {
  isOpen: boolean;
  fitClass: FitnessClass | null;
  users: User[];
  onClose: () => void;
  onEnrollUser: (
    classId: string,
    attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }
  ) => { success: boolean; status?: 'confirmed' | 'waitlist'; error?: string };
}

export const AdminEnrollModal: React.FC<AdminEnrollModalProps> = ({
  isOpen,
  fitClass,
  users,
  onClose,
  onEnrollUser,
}) => {
  if (!isOpen || !fitClass) return null;

  const [mode, setMode] = useState<'registered' | 'manual'>('registered');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter client users (role === 'user')
  const clientUsers = users.filter((u) => u.role !== 'admin');
  const filteredUsers = clientUsers.filter((u) => {
    const q = searchFilter.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q);
  });

  const isFull = fitClass.participants.length >= fitClass.maxCapacity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let attendeeData: { userId?: string; userName: string; userPhone: string; userEmail?: string };

    if (mode === 'registered') {
      const selected = clientUsers.find((u) => u.id === selectedUserId);
      if (!selected) {
        setErrorMessage('Por favor selecciona un cliente de la lista');
        return;
      }
      attendeeData = {
        userId: selected.id,
        userName: selected.name,
        userPhone: selected.phone,
        userEmail: selected.email,
      };
    } else {
      if (!manualName.trim()) {
        setErrorMessage('El nombre del cliente es obligatorio');
        return;
      }
      attendeeData = {
        userName: manualName.trim(),
        userPhone: manualPhone.trim() || 'Sin teléfono',
        userEmail: manualEmail.trim() || undefined,
      };
    }

    const result = onEnrollUser(fitClass.id, attendeeData);
    if (!result.success) {
      setErrorMessage(result.error || 'Error al inscribir al cliente');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Inscribir Alumno en Clase</h3>
              <p className="text-xs text-slate-500">
                {fitClass.title} • {fitClass.date} a las {fitClass.startTime}h
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity banner */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Ocupación actual: <strong>{fitClass.participants.length} / {fitClass.maxCapacity}</strong>
          </span>
          {isFull ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Aforo completo: Se inscribirá en Reserva (#{fitClass.waitingList.length + 1})
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Plaza oficial disponible
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('registered');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'registered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clientes Registrados ({clientUsers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('manual');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nuevo o Manual
            </button>
          </div>

          {mode === 'registered' ? (
            <div className="space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* User Selection List */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No se encontraron clientes registrados con ese criterio
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserId === user.id;
                    const isAlreadyIn = fitClass.participants.some((p) => p.userId === user.id);
                    const isAlreadyWaiting = fitClass.waitingList.some((w) => w.userId === user.id);

                    return (
                      <button
                        type="button"
                        key={user.id}
                        disabled={isAlreadyIn || isAlreadyWaiting}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                          isAlreadyIn || isAlreadyWaiting
                            ? 'opacity-50 cursor-not-allowed bg-slate-50'
                            : isSelected
                            ? 'bg-indigo-50 text-indigo-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.phone} • {user.email}</p>
                        </div>
                        {isAlreadyIn ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Ya inscrito
                          </span>
                        ) : isAlreadyWaiting ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            En reserva
                          </span>
                        ) : isSelected ? (
                          <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Manual User Form */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre y Apellidos del Cliente *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ej. Roberto Sánchez Gómez"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono Móvil
                  </label>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="Ej. 611 223 344"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscribir en la Clase</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
