import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail, Phone, Shield, User as UserIcon, X } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin';
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [error, setError] = useState<string | null>(null);

  // Client login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Client register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Admin login state (strictly private, credentials never displayed)
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  if (!isOpen) return null;

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginIdentifier.trim()) {
      setError('Por favor introduce tu correo electrónico o teléfono');
      return;
    }
    if (!loginPassword.trim()) {
      setError('Por favor introduce tu contraseña de cliente');
      return;
    }

    // Try backend API first
    const res = await ApiService.loginClient(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      StorageService.setCurrentUser(res.user);
      onSuccess(res.user);
      onClose();
    } else {
      // Local fallback
      const localRes = StorageService.loginClient(loginIdentifier, loginPassword);
      if (localRes.success && localRes.user) {
        onSuccess(localRes.user);
        onClose();
      } else {
        setError(res.error || localRes.error || 'Error al iniciar sesión');
      }
    }
  };

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError('Todos los campos son obligatorios para darse de alta');
      return;
    }
    if (regPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    const res = await ApiService.registerClient(regName, regEmail, regPhone, regPassword);
    if (res.success && res.user) {
      StorageService.setCurrentUser(res.user);
      onSuccess(res.user);
      onClose();
    } else {
      // Local fallback
      const localRes = StorageService.registerClient(regName, regEmail, regPhone, regPassword);
      if (localRes.success && localRes.user) {
        onSuccess(localRes.user);
        onClose();
      } else {
        setError(res.error || localRes.error || 'Error al registrar usuario');
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminUser.trim() || !adminPass.trim()) {
      setError('Introduce el usuario y contraseña del administrador');
      return;
    }

    const res = await ApiService.loginAdmin(adminUser, adminPass);
    if (res.success && res.user) {
      StorageService.setCurrentUser(res.user);
      onSuccess(res.user);
      onClose();
    } else {
      const localRes = StorageService.loginAdmin(adminUser, adminPass);
      if (localRes.success && localRes.user) {
        onSuccess(localRes.user);
        onClose();
      } else {
        setError(res.error || localRes.error || 'Credenciales incorrectas');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 pb-3 mb-5">
          <button
            id="tab-mode-login"
            onClick={() => { setMode('login'); setError(null); }}
            className={`pb-2 text-sm font-semibold mr-4 border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            id="tab-mode-register"
            onClick={() => { setMode('register'); setError(null); }}
            className={`pb-2 text-sm font-semibold mr-4 border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Crear Cuenta
          </button>
          <button
            id="tab-mode-admin"
            onClick={() => { setMode('admin'); setError(null); }}
            className={`pb-2 text-sm font-semibold flex items-center space-x-1 border-b-2 transition-colors ml-auto ${
              mode === 'admin'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Administración</span>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode: Client Login */}
        {mode === 'login' && (
          <form onSubmit={handleClientLogin} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico o Teléfono
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="login-identifier"
                  type="text"
                  placeholder="ejemplo@correo.com o 654123456"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Tu contraseña de cliente"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Introduce la contraseña que indicaste al registrarte.
              </p>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
            >
              Acceder a mi Cuenta
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              ¿No tienes cuenta todavía?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Regístrate gratis
              </button>
            </div>
          </form>
        )}

        {/* Mode: Client Register */}
        {mode === 'register' && (
          <form onSubmit={handleClientRegister} className="space-y-3.5">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellidos
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Ej. Juan Pérez García"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="juan.perez@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono Móvil (para notificaciones push)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="654 987 321"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="Mín. 4 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="reg-confirm-password"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Esta contraseña es la que usarás siempre para iniciar sesión y alquilar tus pistas.
            </p>

            <button
              id="register-submit-btn"
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
            >
              Completar Registro y Guardar Contraseña
            </button>
          </form>
        )}

        {/* Mode: Admin Login (Private credentials, no visible passwords) */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Acceso Restringido</span>
                Portal reservado para el administrador del pabellón municipal para crear horarios y gestionar pistas.
              </div>
            </div>

            <div>
              <label htmlFor="admin-username" className="block text-xs font-semibold text-slate-700 mb-1">
                Usuario Administrador
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="admin-username"
                  type="text"
                  placeholder="Introduce usuario"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  autoFocus
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Introduce contraseña"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              id="admin-submit-btn"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
            >
              Iniciar Sesión como Administrador
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
