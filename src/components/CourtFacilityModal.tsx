import React, { useState, useEffect } from 'react';
import { Check, Euro, MapPin, Sparkles, X } from 'lucide-react';
import { CourtFacility, SportCourtType } from '../types';
import { SPORT_INFO_MAP } from '../utils/helpers';

interface CourtFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityToEdit?: CourtFacility | null;
  onSave: (facilityData: Omit<CourtFacility, 'id'>, editId?: string) => void;
}

export const CourtFacilityModal: React.FC<CourtFacilityModalProps> = ({
  isOpen,
  onClose,
  facilityToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportCourtType>('padel');
  const [defaultPrice, setDefaultPrice] = useState<number>(8.0);
  const [surface, setSurface] = useState('');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (facilityToEdit) {
      setName(facilityToEdit.name);
      setSport(facilityToEdit.sport);
      setDefaultPrice(facilityToEdit.defaultPrice);
      setSurface(facilityToEdit.surface);
      setFeatures(facilityToEdit.features || '');
      setIsActive(facilityToEdit.isActive);
    } else {
      setName('Pista Pádel 3 (Panorámica)');
      setSport('padel');
      setDefaultPrice(8.0);
      setSurface('Césped sintético y cerramiento de cristal');
      setFeatures('Iluminación LED de alta eficiencia');
      setIsActive(true);
    }
  }, [facilityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSportChange = (newSport: SportCourtType) => {
    setSport(newSport);
    if (!facilityToEdit) {
      if (newSport === 'padel') {
        setName('Pista Pádel 3 (Cristal)');
        setDefaultPrice(8.0);
        setSurface('Césped sintético y cristal templado');
      } else if (newSport === 'futbol7') {
        setName('Campo Fútbol 7 Anexo');
        setDefaultPrice(25.0);
        setSurface('Césped artificial homologado 60mm');
      } else if (newSport === 'tenis') {
        setName('Pista Tenis 3 (Rápida)');
        setDefaultPrice(6.0);
        setSurface('Resina sintética o tenis quick');
      } else if (newSport === 'futbol11') {
        setName('Campo Fútbol 11 Secundario');
        setDefaultPrice(45.0);
        setSurface('Césped natural o sintético con graderío');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        sport,
        defaultPrice: Number(defaultPrice),
        surface: surface.trim() || 'Superficie reglamentaria',
        features: features.trim(),
        isActive,
      },
      facilityToEdit ? facilityToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
            <span>{facilityToEdit ? 'Modificar Instalación' : 'Nueva Instalación'}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {facilityToEdit ? 'Editar Pista y Tarifa Base' : 'Dar de Alta Nueva Pista Deportiva'}
          </h2>
          <p className="text-xs text-slate-500">
            Define el nombre, deporte, tipo de superficie y el precio por hora de la pista.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Sport selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Deporte de la Pista
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(SPORT_INFO_MAP) as SportCourtType[]).map((sp) => {
                const info = SPORT_INFO_MAP[sp];
                const isSelected = sport === sp;
                return (
                  <button
                    type="button"
                    key={sp}
                    onClick={() => handleSportChange(sp)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Court Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nombre de la Pista
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pista Pádel 3 (Panorámica)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Default Price */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tarifa / Precio por Hora (€)
            </label>
            <div className="relative">
              <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.5"
                min="0"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Precio que se aplicará por defecto al generar los horarios de esta pista.
            </p>
          </div>

          {/* Surface & Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipo de Superficie
              </label>
              <input
                type="text"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="Ej. Césped monofilamento"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Equipamiento / Detalles
              </label>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Ej. Iluminación LED, techada"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Active status */}
          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
              />
              <span>Pista activa y operativa para alquiler público</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{facilityToEdit ? 'Actualizar Pista y Precio' : 'Crear Pista'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
