import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Dumbbell,
  Euro,
  Filter,
  Layers,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { CourtFacility, CourtSlot, FitnessActivityType, FitnessClass, SportCourtType, User as UserType } from '../types';
import { FITNESS_INFO_MAP, formatDayLabel, formatPrice, SPORT_INFO_MAP } from '../utils/helpers';
import { getDateString } from '../mockData';
import { CourtFacilityModal } from './CourtFacilityModal';
import { EditCourtSlotModal } from './EditCourtSlotModal';
import { EditFitnessClassModal } from './EditFitnessClassModal';
import { AdminEnrollModal } from './AdminEnrollModal';

interface AdminPortalProps {
  currentUser: UserType;
  courtSlots: CourtSlot[];
  courtFacilities: CourtFacility[];
  fitnessClasses: FitnessClass[];
  users?: UserType[];
  onAddCourtSlot: (slotData: Omit<CourtSlot, 'id' | 'isBooked' | 'bookedBy'>) => { success: boolean; error?: string };
  onUpdateCourtSlot: (slotId: string, updates: Partial<CourtSlot>) => { success: boolean; error?: string };
  onDeleteCourtSlot: (slotId: string) => void;
  onCancelCourtSlot: (slotId: string) => void;
  onAddCourtFacility: (facilityData: Omit<CourtFacility, 'id'>) => void;
  onUpdateCourtFacility: (facilityId: string, updates: Partial<CourtFacility>) => void;
  onDeleteCourtFacility: (facilityId: string) => void;
  onAddFitnessClass: (classData: Omit<FitnessClass, 'id' | 'participants' | 'waitingList'>) => { success: boolean; error?: string };
  onUpdateFitnessClass: (classId: string, updates: Partial<FitnessClass>) => { success: boolean; error?: string; promotedCount?: number };
  onDeleteFitnessClass: (classId: string) => void;
  onAdminEnrollUser?: (classId: string, attendee: { userId?: string; userName: string; userPhone: string; userEmail?: string }) => { success: boolean; status?: 'confirmed' | 'waitlist'; error?: string };
  onAdminRemoveUser?: (classId: string, userId: string) => { success: boolean; promotedUser?: string; removedName?: string; error?: string };
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  courtSlots,
  courtFacilities,
  fitnessClasses,
  users = [],
  onAddCourtSlot,
  onUpdateCourtSlot,
  onDeleteCourtSlot,
  onCancelCourtSlot,
  onAddCourtFacility,
  onUpdateCourtFacility,
  onDeleteCourtFacility,
  onAddFitnessClass,
  onUpdateFitnessClass,
  onDeleteFitnessClass,
  onAdminEnrollUser,
  onAdminRemoveUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'facilities' | 'overview' | 'create-court' | 'classes-roster' | 'create-class' | 'database'>('facilities');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<CourtFacility | null>(null);
  const [editingSlot, setEditingSlot] = useState<CourtSlot | null>(null);
  const [editingFitnessClass, setEditingFitnessClass] = useState<FitnessClass | null>(null);
  const [enrollingFitnessClass, setEnrollingFitnessClass] = useState<FitnessClass | null>(null);

  // Filter for overview
  const [overviewFilter, setOverviewFilter] = useState<'all' | 'booked' | 'free'>('all');
  const [overviewSport, setOverviewSport] = useState<SportCourtType | 'all'>('all');
  const [overviewSearch, setOverviewSearch] = useState('');

  // Filter for class roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterActivity, setRosterActivity] = useState<FitnessActivityType | 'all'>('all');

  // Form state: Court slot
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(courtFacilities[0]?.id || '');
  const [courtSport, setCourtSport] = useState<SportCourtType>(courtFacilities[0]?.sport || 'padel');
  const [courtName, setCourtName] = useState<string>(courtFacilities[0]?.name || 'Pista Pádel 1');
  const [courtDate, setCourtDate] = useState<string>(getDateString(0));
  const [courtStart, setCourtStart] = useState<string>('18:00');
  const [courtEnd, setCourtEnd] = useState<string>('19:30');
  const [courtPrice, setCourtPrice] = useState<number>(courtFacilities[0]?.defaultPrice || 8.0);

  // Form state: Fitness Class
  const [classActivity, setClassActivity] = useState<FitnessActivityType>('spinning');
  const [classTitle, setClassTitle] = useState<string>('Spinning Power Beats');
  const [classInstructor, setClassInstructor] = useState<string>('Laura Serrano');
  const [classRoom, setClassRoom] = useState<string>('Sala Ciclo Indoor (2ª Planta)');
  const [classDate, setClassDate] = useState<string>(getDateString(0));
  const [classStart, setClassStart] = useState<string>('19:00');
  const [classEnd, setClassEnd] = useState<string>('20:00');
  const [classCapacity, setClassCapacity] = useState<number>(15);

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Facility selection change
  const handleFacilitySelect = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    const fac = courtFacilities.find((f) => f.id === facilityId);
    if (fac) {
      setCourtName(fac.name);
      setCourtSport(fac.sport);
      setCourtPrice(fac.defaultPrice);
    }
  };

  // Quick activity presets
  const handleActivityChange = (act: FitnessActivityType) => {
    setClassActivity(act);
    if (act === 'spinning') {
      setClassTitle('Spinning Power Beats');
      setClassInstructor('Laura Serrano');
      setClassRoom('Sala Ciclo Indoor (2ª Planta)');
    } else if (act === 'zumba') {
      setClassTitle('Zumba Ritmos Latinos');
      setClassInstructor('Sofía Valdés');
      setClassRoom('Pabellón Cubierto Pista Central');
    } else if (act === 'crossfit') {
      setClassTitle('CrossFit WOD Fuerza & Cardio');
      setClassInstructor('Marcos Benítez');
      setClassRoom('Box Municipal Exterior');
    } else if (act === 'pilates') {
      setClassTitle('Pilates Core & Respiración');
      setClassInstructor('Carmen Delgado');
      setClassRoom('Sala Polivalente 1');
    }
  };

  // Requirement: "si una pista ya esta creada el mismo dia y a la misma hora, no se debe de poder volver a crear"
  const handleCreateCourtSlot = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const res = onAddCourtSlot({
      sport: courtSport,
      courtName,
      date: courtDate,
      startTime: courtStart,
      endTime: courtEnd,
      price: Number(courtPrice),
      courtId: selectedFacilityId || undefined,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'No se puede crear el horario');
      return;
    }

    setSuccessMessage(`Horario publicado con éxito: ${courtName} para el ${courtDate} (${courtStart} - ${courtEnd}) por ${formatPrice(courtPrice)}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Requirement: "No se puede repetir la creacion de clases si es la misma y a la misma hora y dia." & "el administrador puede cambiar el aforo."
  const handleCreateFitnessClass = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const aforo = Math.max(1, parseInt(String(classCapacity), 10) || 15);

    const res = onAddFitnessClass({
      activity: classActivity,
      title: classTitle,
      instructor: classInstructor,
      room: classRoom,
      date: classDate,
      startTime: classStart,
      endTime: classEnd,
      maxCapacity: aforo,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'No se puede crear la clase');
      return;
    }

    setSuccessMessage(`Clase creada con éxito: "${classTitle}" para el ${classDate} a las ${classStart}h (Aforo fijado en ${aforo} plazas).`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Batch generator with duplicate checking
  const handleGenerateStandardSlots = () => {
    clearMessages();
    const franjas = [
      { start: '09:30', end: '11:00' },
      { start: '11:00', end: '12:30' },
      { start: '17:00', end: '18:30' },
      { start: '18:30', end: '20:00' },
      { start: '20:00', end: '21:30' },
    ];

    let createdCount = 0;
    let duplicateCount = 0;

    franjas.forEach((franja) => {
      const res = onAddCourtSlot({
        sport: courtSport,
        courtName,
        date: courtDate,
        startTime: franja.start,
        endTime: franja.end,
        price: Number(courtPrice),
        courtId: selectedFacilityId || undefined,
      });

      if (res.success) {
        createdCount++;
      } else {
        duplicateCount++;
      }
    });

    if (createdCount > 0 && duplicateCount === 0) {
      setSuccessMessage(`Se han generado las 5 franjas horarias automáticas para ${courtName} el ${courtDate}.`);
    } else if (createdCount > 0 && duplicateCount > 0) {
      setSuccessMessage(`Se crearon ${createdCount} franjas. ${duplicateCount} franja(s) no se crearon porque ya estaban dadas de alta a esa misma hora.`);
    } else {
      setErrorMessage(`No se pudo generar ninguna franja: todas las horas seleccionadas ya estaban creadas para esta pista en esta fecha.`);
    }

    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  // Facility save handler
  const handleSaveFacility = (facilityData: Omit<CourtFacility, 'id'>, editId?: string) => {
    if (editId) {
      onUpdateCourtFacility(editId, facilityData);
      setSuccessMessage(`Pista actualizada: ${facilityData.name} con tarifa ${formatPrice(facilityData.defaultPrice)}`);
    } else {
      onAddCourtFacility(facilityData);
      setSuccessMessage(`Nueva pista creada: ${facilityData.name} (${formatPrice(facilityData.defaultPrice)})`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Admin removes attendee from class
  const handleAdminRemoveAttendee = (classId: string, userId: string, userName: string, isWaitlist: boolean) => {
    if (!onAdminRemoveUser) return;
    const confirmMsg = isWaitlist
      ? `¿Eliminar a ${userName} de la lista de reserva?`
      : `¿Dar de baja a ${userName} de la clase? Si hay personas en lista de espera, la primera ocupará automáticamente su lugar.`;
    
    if (!confirm(confirmMsg)) return;

    clearMessages();
    const res = onAdminRemoveUser(classId, userId);
    if (res.success) {
      let msg = `Se ha dado de baja a ${userName} de la clase.`;
      if (res.promotedUser) {
        msg += ` ¡${res.promotedUser} ha pasado automáticamente de reserva a tener plaza oficial!`;
      }
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 6000);
    } else {
      setErrorMessage(res.error || 'Error al tramitar la baja');
    }
  };

  // Filtered slots for overview
  const filteredOverviewSlots = courtSlots.filter((slot) => {
    if (overviewFilter === 'booked' && !slot.isBooked) return false;
    if (overviewFilter === 'free' && slot.isBooked) return false;
    if (overviewSport !== 'all' && slot.sport !== overviewSport) return false;
    if (overviewSearch.trim()) {
      const q = overviewSearch.toLowerCase();
      const matchCourt = slot.courtName.toLowerCase().includes(q);
      const matchUser = slot.bookedBy?.userName.toLowerCase().includes(q);
      const matchPhone = slot.bookedBy?.userPhone?.includes(q);
      if (!matchCourt && !matchUser && !matchPhone) return false;
    }
    return true;
  });

  // Filtered fitness classes for roster
  const filteredFitnessClasses = fitnessClasses.filter((c) => {
    if (rosterActivity !== 'all' && c.activity !== rosterActivity) return false;
    if (rosterSearch.trim()) {
      const q = rosterSearch.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchInstructor = c.instructor.toLowerCase().includes(q);
      const matchRoom = c.room.toLowerCase().includes(q);
      const matchParticipant = c.participants.some(
        (p) => p.userName.toLowerCase().includes(q) || p.userPhone.includes(q)
      );
      const matchWaitlist = c.waitingList.some(
        (w) => w.userName.toLowerCase().includes(q) || w.userPhone.includes(q)
      );
      if (!matchTitle && !matchInstructor && !matchRoom && !matchParticipant && !matchWaitlist) return false;
    }
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gestión Municipal Privada (Usuario: Cordones)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Panel de Control del Administrador
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Control integral del pabellón: gestión de pistas, tarifas, horarios sin solapamientos, supervisión de alumnos de clases dirigidas y aforos.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 bg-indigo-950/80 p-3 rounded-2xl border border-indigo-800/40 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <p className="text-indigo-100 font-bold">{currentUser.name}</p>
              <p className="text-[11px] text-emerald-400 font-semibold">Administrador Oficial</p>
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-indigo-800/40 relative z-10">
          <button
            id="admin-tab-facilities"
            onClick={() => {
              setActiveSubTab('facilities');
              clearMessages();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'facilities'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Pistas y Tarifas ({courtFacilities.length})</span>
          </button>

          <button
            id="admin-tab-overview"
            onClick={() => {
              setActiveSubTab('overview');
              clearMessages();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Supervisión Pistas ({courtSlots.filter(s => s.isBooked).length} alquiladas)</span>
          </button>

          <button
            id="admin-tab-create-court"
            onClick={() => {
              setActiveSubTab('create-court');
              clearMessages();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'create-court'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Alta de Horarios Disponibles</span>
          </button>

          <button
            id="admin-tab-classes-roster"
            onClick={() => {
              setActiveSubTab('classes-roster');
              clearMessages();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'classes-roster'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión Clases y Alumnos ({fitnessClasses.length})</span>
          </button>

          <button
            id="admin-tab-create-class"
            onClick={() => {
              setActiveSubTab('create-class');
              clearMessages();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'create-class'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Programar Nueva Clase</span>
          </button>

          <button
            id="admin-tab-database"
            onClick={() => {
              setActiveSubTab('database');
              clearMessages();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'database'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Base de Datos Online & Fichero</span>
          </button>
        </div>
      </div>

      {/* Global Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs font-bold text-rose-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUBTAB 1: FACILITIES & BASE PRICES */}
      {activeSubTab === 'facilities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pistas Deportivas Municipales y Precios
              </h2>
              <p className="text-xs text-slate-500">
                Crea nuevas pistas, ajusta los precios por hora y define el deporte correspondiente.
              </p>
            </div>
            <button
              id="admin-create-facility-btn"
              onClick={() => {
                setEditingFacility(null);
                setIsFacilityModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Pista Disponible</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courtFacilities.map((fac) => {
              const sportInfo = SPORT_INFO_MAP[fac.sport];
              const slotCount = courtSlots.filter((s) => s.courtId === fac.id || s.courtName === fac.name).length;
              const bookedCount = courtSlots.filter((s) => (s.courtId === fac.id || s.courtName === fac.name) && s.isBooked).length;

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${sportInfo.badgeBg}`}>
                        <span>{sportInfo.name}</span>
                      </span>
                      <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                        {formatPrice(fac.defaultPrice)}/h
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fac.location}</span>
                    </p>

                    <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-4">
                      <span>Horarios publicados: <strong>{slotCount}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">Alquiladas: {bookedCount}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingFacility(fac);
                        setIsFacilityModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 py-1 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar Pista y Precio</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Seguro que deseas eliminar la pista "${fac.name}"?`)) {
                          onDeleteCourtFacility(fac.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Eliminar pista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: OVERVIEW & BOOKINGS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setOverviewFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    overviewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Todas ({courtSlots.length})
                </button>
                <button
                  onClick={() => setOverviewFilter('booked')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    overviewFilter === 'booked' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Alquiladas ({courtSlots.filter((s) => s.isBooked).length})
                </button>
                <button
                  onClick={() => setOverviewFilter('free')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    overviewFilter === 'free' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Libres ({courtSlots.filter((s) => !s.isBooked).length})
                </button>
              </div>

              <select
                value={overviewSport}
                onChange={(e) => setOverviewSport(e.target.value as SportCourtType | 'all')}
                className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700"
              >
                <option value="all">Todos los deportes</option>
                <option value="padel">Pádel</option>
                <option value="futbol7">Fútbol 7</option>
                <option value="futbol11">Fútbol 11</option>
                <option value="tenis">Tenis</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por pista, cliente o teléfono..."
                value={overviewSearch}
                onChange={(e) => setOverviewSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {filteredOverviewSlots.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No hay franjas horarias que coincidan con estos filtros
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredOverviewSlots.map((slot) => {
                  const dateLabel = formatDayLabel(slot.date);
                  return (
                    <div
                      key={slot.id}
                      className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${SPORT_INFO_MAP[slot.sport].badgeBg}`}>
                            {SPORT_INFO_MAP[slot.sport].name}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{slot.courtName}</span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {formatPrice(slot.price)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateLabel.dayName} {dateLabel.dayNumber} {dateLabel.monthName}</span>
                          </span>
                          <span className="flex items-center space-x-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </span>
                        </div>
                        {slot.isBooked && slot.bookedBy ? (
                          <div className="mt-1 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-wrap items-center gap-3">
                            <span className="font-bold">Alquilada por: {slot.bookedBy.userName}</span>
                            <span className="text-emerald-700">Tel: {slot.bookedBy.userPhone || 'N/A'}</span>
                            <span className="text-emerald-600 text-[11px]">{slot.bookedBy.userEmail}</span>
                          </div>
                        ) : (
                          <span className="inline-block text-[11px] text-slate-400 italic">Pista libre para alquiler</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                        {slot.isBooked && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Liberar la reserva de ${slot.courtName}? El cliente recibirá una notificación.`)) {
                                onCancelCourtSlot(slot.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            Liberar Pista
                          </button>
                        )}
                        <button
                          onClick={() => setEditingSlot(slot)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar definitivamente este horario de ${slot.courtName}?`)) {
                              onDeleteCourtSlot(slot.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Eliminar horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CREATE COURT AVAILABILITY SLOTS */}
      {activeSubTab === 'create-court' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Dar de Alta Horarios Disponibles de Pistas
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Selecciona una pista registrada o personalízala. <strong>Nota:</strong> Si una pista ya está creada el mismo día y a la misma hora, el sistema impedirá duplicarla para evitar solapamientos.
            </p>

            <form onSubmit={handleCreateCourtSlot} className="space-y-4">
              
              {courtFacilities.length > 0 && (
                <div>
                  <label htmlFor="facility-selector" className="block text-xs font-bold text-slate-700 mb-1">
                    Seleccionar Pista Registrada
                  </label>
                  <select
                    id="facility-selector"
                    value={selectedFacilityId}
                    onChange={(e) => handleFacilitySelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {courtFacilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({SPORT_INFO_MAP[fac.sport].name} - {formatPrice(fac.defaultPrice)}/h)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="court-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Pista
                </label>
                <input
                  id="court-name"
                  type="text"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="court-date" className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    id="court-date"
                    type="date"
                    value={courtDate}
                    onChange={(e) => setCourtDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="court-start" className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    id="court-start"
                    type="time"
                    value={courtStart}
                    onChange={(e) => setCourtStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="court-end" className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    id="court-end"
                    type="time"
                    value={courtEnd}
                    onChange={(e) => setCourtEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="court-price" className="block text-xs font-bold text-slate-700 mb-1">
                  Precio de la Reserva (€)
                </label>
                <input
                  id="court-price"
                  type="number"
                  step="0.5"
                  min="0"
                  value={courtPrice}
                  onChange={(e) => setCourtPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Control anti-duplicados activo:</strong> No se permite crear dos franjas para la misma pista en el mismo día y hora.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  id="admin-submit-court-slot"
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Horario Disponible</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateStandardSlots}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  + Generar 5 Franjas Automáticas para este día
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CLASSES & ATTENDEES ROSTER MANAGEMENT (Requirements 2, 4, 7) */}
      {activeSubTab === 'classes-roster' && (
        <div className="space-y-5">
          
          {/* Header Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setRosterActivity('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  rosterActivity === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas las disciplinas ({fitnessClasses.length})
              </button>

              {(Object.keys(FITNESS_INFO_MAP) as FitnessActivityType[]).map((act) => (
                <button
                  key={act}
                  onClick={() => setRosterActivity(act)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    rosterActivity === act
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {FITNESS_INFO_MAP[act].name}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar alumno, teléfono o clase..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => setActiveSubTab('create-class')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Clase</span>
              </button>
            </div>
          </div>

          {/* Classes Cards with Attendees Lists */}
          {filteredFitnessClasses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Dumbbell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No se encontraron clases con este filtro</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Puedes programar una nueva sesión de Spinning, Zumba, CrossFit o Pilates con aforo ajustable.
              </p>
              <button
                onClick={() => setActiveSubTab('create-class')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
              >
                Programar Nueva Clase
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFitnessClasses.map((fitClass) => {
                const info = FITNESS_INFO_MAP[fitClass.activity];
                const dateLabel = formatDayLabel(fitClass.date);
                const isFull = fitClass.participants.length >= fitClass.maxCapacity;

                return (
                  <div
                    key={fitClass.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
                  >
                    {/* Class Card Header */}
                    <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${info.badgeBg}`}>
                            {info.name}
                          </span>
                          <span className="flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateLabel.dayName} {dateLabel.dayNumber} {dateLabel.monthName}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{fitClass.startTime} - {fitClass.endTime}</span>
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                          {fitClass.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Monitor/a: <strong>{fitClass.instructor}</strong> • Sala: {fitClass.room}
                        </p>
                      </div>

                      {/* Right Action buttons: Enroll, Edit Capacity, Delete */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setEnrollingFitnessClass(fitClass)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Inscribir Cliente</span>
                        </button>

                        <button
                          onClick={() => setEditingFitnessClass(fitClass)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-colors"
                        >
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>Cambiar Aforo / Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar definitivamente la clase "${fitClass.title}"?`)) {
                              onDeleteFitnessClass(fitClass.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Eliminar clase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Capacity and Stats Bar */}
                    <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-slate-700">
                          Aforo oficial: <strong className="text-slate-900">{fitClass.maxCapacity} plazas</strong>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">
                          Inscritos con plaza: <strong>{fitClass.participants.length}</strong>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-amber-700">
                          En reserva / espera: <strong>{fitClass.waitingList.length}</strong>
                        </span>
                      </div>

                      {isFull && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Aforo Completo ({fitClass.participants.length}/{fitClass.maxCapacity})
                        </span>
                      )}
                    </div>

                    {/* Two-Column Attendees Section: Confirmed vs Waiting List */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* COLUMN 1: CONFIRMED PARTICIPANTS */}
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                            <span>Alumnos con Plaza Confirmada ({fitClass.participants.length}/{fitClass.maxCapacity})</span>
                          </h4>
                        </div>

                        {fitClass.participants.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 italic">
                            No hay alumnos con plaza confirmada todavía.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {fitClass.participants.map((participant, idx) => (
                              <div
                                key={participant.userId}
                                className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-slate-900">{participant.userName}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 pl-7 flex items-center space-x-2">
                                    <span>Tel: <strong>{participant.userPhone}</strong></span>
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    handleAdminRemoveAttendee(fitClass.id, participant.userId, participant.userName, false)
                                  }
                                  className="px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1 shrink-0"
                                  title="Dar de baja alumno"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  <span>Borrar</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* COLUMN 2: WAITING LIST / RESERVA */}
                      <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Lista de Reserva / Espera ({fitClass.waitingList.length})</span>
                          </h4>
                          <span className="text-[10px] text-amber-700 font-medium">
                            Promoción automática al liberar plaza
                          </span>
                        </div>

                        {fitClass.waitingList.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 italic">
                            No hay nadie en lista de espera para esta clase.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {fitClass.waitingList.map((waitEntry) => (
                              <div
                                key={waitEntry.userId}
                                className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs hover:border-amber-300 transition-colors"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-2">
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-extrabold text-[10px] shrink-0">
                                      #{waitEntry.position}
                                    </span>
                                    <span className="font-bold text-slate-900">{waitEntry.userName}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 pl-7">
                                    Tel: <strong>{waitEntry.userPhone}</strong>
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    handleAdminRemoveAttendee(fitClass.id, waitEntry.userId, waitEntry.userName, true)
                                  }
                                  className="px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1 shrink-0"
                                  title="Quitar de lista de espera"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  <span>Borrar</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 5: CREATE FITNESS CLASS */}
      {activeSubTab === 'create-class' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Programar Clase Dirigida (Aforo Ajustable)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Spinning, Zumba, CrossFit y Pilates. Configura el aforo oficial permitido. <strong>Nota:</strong> No se permite repetir la creación de clases si es la misma a la misma hora y día.
            </p>

            <form onSubmit={handleCreateFitnessClass} className="space-y-4">
              
              {/* Activity selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Disciplina Dirigida
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(FITNESS_INFO_MAP) as FitnessActivityType[]).map((act) => {
                    const info = FITNESS_INFO_MAP[act];
                    const isSelected = classActivity === act;
                    return (
                      <button
                        type="button"
                        key={act}
                        onClick={() => handleActivityChange(act)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span>{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="class-title" className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sesión
                  </label>
                  <input
                    id="class-title"
                    type="text"
                    value={classTitle}
                    onChange={(e) => setClassTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="class-instructor" className="block text-xs font-bold text-slate-700 mb-1">
                    Monitor/a Especializado
                  </label>
                  <input
                    id="class-instructor"
                    type="text"
                    value={classInstructor}
                    onChange={(e) => setClassInstructor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Room */}
              <div>
                <label htmlFor="class-room" className="block text-xs font-bold text-slate-700 mb-1">
                  Sala o Espacio del Pabellón
                </label>
                <input
                  id="class-room"
                  type="text"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="class-date" className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    id="class-date"
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="class-start" className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    id="class-start"
                    type="time"
                    value={classStart}
                    onChange={(e) => setClassStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="class-end" className="block text-xs font-bold text-slate-700 mb-1">
                    Hora Fin
                  </label>
                  <input
                    id="class-end"
                    type="time"
                    value={classEnd}
                    onChange={(e) => setClassEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Requirement: "el administrador puede cambiar el aforo." */}
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <Users className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <label htmlFor="class-capacity-input" className="text-xs font-extrabold text-indigo-950 block">
                      Aforo Máximo de la Clase (Nº de Plazas)
                    </label>
                    <span className="text-[11px] text-indigo-700 block">
                      A partir de este número, las personas que se apunten quedarán en lista de reserva.
                    </span>
                  </div>
                </div>

                <div className="w-28 self-end sm:self-auto">
                  <input
                    id="class-capacity-input"
                    type="number"
                    min="1"
                    max="100"
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-center px-3 py-2 bg-white border-2 border-indigo-400 rounded-xl text-base font-extrabold text-indigo-950"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="admin-submit-class"
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programar Clase Dirigida</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 6: BASE DE DATOS ONLINE & FICHERO EN TIEMPO REAL */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold">
                  <Database className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Sincronización en Tiempo Real Activa</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Base de Datos Centralizada y Fichero Persistente
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
                  Todos los cambios realizados por el administrador (altas, bajas, precios, aforos) o por los clientes (reservas, cancelaciones) se guardan automáticamente en el servidor y se reflejan al instante en todos los dispositivos conectados vía Server-Sent Events (SSE).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  id="admin-download-db-btn"
                  href="/api/database/file"
                  download="pabellon_database.json"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center space-x-2 shadow-xs"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Descargar Fichero JSON</span>
                </a>
              </div>
            </div>

            {/* Architecture Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Fichero en Servidor</span>
                </div>
                <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-semibold break-all">
                  /data/pabellon_database.json
                </p>
                <p className="text-[11px] text-slate-500">
                  Archivo JSON persistente que almacena todas las colecciones con escritura atómica garantizada.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Difusión en Tiempo Real</span>
                </div>
                <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-emerald-700 font-semibold">
                  SSE Broadcast (/api/events)
                </p>
                <p className="text-[11px] text-slate-500">
                  Notifica inmediatamente a todas las sesiones abiertas de usuarios ante cualquier cambio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Seguridad de Acceso</span>
                </div>
                <p className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-amber-800 font-semibold">
                  Validación de Credenciales
                </p>
                <p className="text-[11px] text-slate-500">
                  Acceso exclusivo de administración para <span className="font-bold">Cordones</span> y cuentas registradas con contraseña para clientes.
                </p>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
                <span className="block text-2xl font-black text-emerald-900">{courtFacilities.length}</span>
                <span className="text-xs font-bold text-emerald-700">Pistas Físicas</span>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center">
                <span className="block text-2xl font-black text-indigo-900">{courtSlots.length}</span>
                <span className="text-xs font-bold text-indigo-700">
                  Horarios ({courtSlots.filter(s => s.isBooked).length} alquilados)
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                <span className="block text-2xl font-black text-amber-900">{fitnessClasses.length}</span>
                <span className="text-xs font-bold text-amber-700">Clases Dirigidas</span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center">
                <span className="block text-2xl font-black text-purple-900">{users.length}</span>
                <span className="text-xs font-bold text-purple-700">Usuarios en Sistema</span>
              </div>
            </div>

            {/* Registered Users Roster Table */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Cuentas de Usuarios Registrados en la Base de Datos ({users.length})</span>
                </h3>
                <span className="text-xs text-slate-500">Almacenados en tiempo real</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Nombre Completo</th>
                      <th className="px-4 py-3">Teléfono</th>
                      <th className="px-4 py-3">Email / Usuario</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Acceso y Alquileres</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-black ${
                            u.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {u.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              ADMINISTRADOR
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              CLIENTE
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {u.role === 'admin'
                            ? 'Gestión total de pistas, precios y aforos'
                            : 'Acceso con contraseña para alquilar pistas y apuntarse a clases'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Facility Create/Edit Modal */}
      <CourtFacilityModal
        isOpen={isFacilityModalOpen}
        facilityToEdit={editingFacility}
        onClose={() => {
          setIsFacilityModalOpen(false);
          setEditingFacility(null);
        }}
        onSave={handleSaveFacility}
      />

      {/* Slot Edit Modal */}
      <EditCourtSlotModal
        isOpen={Boolean(editingSlot)}
        slot={editingSlot}
        onClose={() => setEditingSlot(null)}
        onSave={(slotId, updates) => {
          const res = onUpdateCourtSlot(slotId, updates);
          if (!res.success) {
            setErrorMessage(res.error || 'Conflicto al actualizar franja horaria');
          } else {
            setSuccessMessage('Franja horaria y tarifa actualizadas correctamente');
            setTimeout(() => setSuccessMessage(null), 4000);
          }
        }}
        onDelete={onDeleteCourtSlot}
        onLiberate={onCancelCourtSlot}
      />

      {/* Fitness Class Edit & Capacity Modal */}
      <EditFitnessClassModal
        isOpen={Boolean(editingFitnessClass)}
        fitClass={editingFitnessClass}
        onClose={() => setEditingFitnessClass(null)}
        onSave={(classId, updates) => {
          const res = onUpdateFitnessClass(classId, updates);
          if (!res.success) {
            setErrorMessage(res.error || 'Conflicto al actualizar la clase');
          } else {
            let msg = 'Clase y aforo actualizados con éxito.';
            if (res.promotedCount && res.promotedCount > 0) {
              msg += ` Se promocionaron automáticamente ${res.promotedCount} alumno(s) de la lista de reserva a plaza confirmada.`;
            }
            setSuccessMessage(msg);
            setTimeout(() => setSuccessMessage(null), 6000);
          }
        }}
        onDelete={onDeleteFitnessClass}
      />

      {/* Admin Enroll User Modal */}
      <AdminEnrollModal
        isOpen={Boolean(enrollingFitnessClass)}
        fitClass={enrollingFitnessClass}
        users={users}
        onClose={() => setEnrollingFitnessClass(null)}
        onEnrollUser={(classId, attendee) => {
          if (!onAdminEnrollUser) return { success: false, error: 'Función no disponible' };
          const res = onAdminEnrollUser(classId, attendee);
          if (res.success) {
            setSuccessMessage(
              res.status === 'confirmed'
                ? `¡${attendee.userName} ha sido inscrito con plaza confirmada!`
                : `¡${attendee.userName} ha sido inscrito en lista de reserva (#${res.position})!`
            );
            setTimeout(() => setSuccessMessage(null), 5000);
          }
          return res;
        }}
      />

    </div>
  );
};
