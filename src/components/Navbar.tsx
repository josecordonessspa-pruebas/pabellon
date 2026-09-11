import React, { useState } from 'react';
import { Bell, Calendar, Dumbbell, LogIn, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { PushNotification, User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'courts' | 'classes' | 'profile' | 'admin';
  setActiveTab: (tab: 'courts' | 'classes' | 'profile' | 'admin') => void;
  onOpenAuth: (initialMode?: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  isRealtimeConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  notifications,
  onOpenNotifications,
  isRealtimeConnected = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('courts')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <span className="font-extrabold text-xl tracking-tight">PM</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg leading-tight">Pabellón Municipal</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Polideportivo
                </span>
                {/* Real-time live status pill */}
                <div
                  id="realtime-status-pill"
                  className={`hidden md:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    isRealtimeConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                  title={isRealtimeConnected ? 'Conectado a la base de datos central en tiempo real' : 'Reconectando con el servidor...'}
                >
                  <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>{isRealtimeConnected ? 'En línea · Tiempo Real' : 'Reconectando...'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Pistas Deportivas y Clases Dirigidas</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-courts-btn"
              onClick={() => setActiveTab('courts')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'courts'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Pistas y Horarios</span>
            </button>

            <button
              id="nav-classes-btn"
              onClick={() => setActiveTab('classes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'classes'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Clases Dirigidas</span>
              <span className="text-[11px] bg-slate-200/80 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
                Máx 15
              </span>
            </button>

            {currentUser && (
              <button
                id="nav-profile-btn"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Mis Reservas</span>
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                id="nav-admin-btn"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Panel Administrador</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell with counter */}
            <button
              id="notifications-toggle-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notificaciones push"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Auth section */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  id="user-badge-btn"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-lg ${currentUser.avatarColor || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-xs`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                </button>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="auth-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
                <button
                  id="auth-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Registrarse
                </button>
                <button
                  id="auth-admin-access-btn"
                  onClick={() => onOpenAuth('admin')}
                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Acceso Administrador"
                  aria-label="Acceso Administrador"
                >
                  <Shield className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-slate-200 bg-white px-2 py-1.5 flex items-center justify-around">
        <button
          id="mobile-nav-courts"
          onClick={() => setActiveTab('courts')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium ${
            activeTab === 'courts' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Pistas</span>
        </button>

        <button
          id="mobile-nav-classes"
          onClick={() => setActiveTab('classes')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium ${
            activeTab === 'classes' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Dumbbell className="w-4 h-4 mb-0.5" />
          <span>Clases</span>
        </button>

        {currentUser && (
          <button
            id="mobile-nav-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium ${
              activeTab === 'profile' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <UserIcon className="w-4 h-4 mb-0.5" />
            <span>Mis Reservas</span>
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <button
            id="mobile-nav-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-semibold ${
              activeTab === 'admin' ? 'text-indigo-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5 text-indigo-600" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
