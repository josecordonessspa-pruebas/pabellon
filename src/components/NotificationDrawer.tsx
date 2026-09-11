import React from 'react';
import { Bell, Check, Clock, Sparkles, Volume2, X } from 'lucide-react';
import { PushNotification } from '../types';
import { playPushNotificationSound, requestBrowserNotificationPermission } from '../utils/audio';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onTriggerTestNotification: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onTriggerTestNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Notificaciones Push</h3>
              <p className="text-xs text-slate-500">Avisos automáticos en tu móvil</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={onTriggerTestNotification}
            className="text-emerald-700 font-semibold hover:text-emerald-900 flex items-center space-x-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Simular aviso 1 hora antes</span>
          </button>

          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Marcar leídas</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm mb-1">Sin notificaciones pendientes</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Cuando alquiles una pista o te apuntes a Spinning, Zumba, CrossFit o Pilates recibirás aquí y en tu móvil la confirmación y el recordatorio 1 hora antes.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`py-3.5 transition-colors ${
                  !notif.isRead ? 'bg-emerald-50/40 -mx-4 px-4 rounded-xl' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>
                <div className="mt-2 flex items-center space-x-2 text-[10px] text-emerald-700 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Push enviada a tu dispositivo</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Sistema Push de Pabellón Municipal</p>
          <p className="text-[11px] leading-normal">
            Garantizamos que recibirás un aviso 1 hora antes de que comience tu pista o clase. También serás avisado si pasas de lista de espera a plaza confirmada.
          </p>
        </div>

      </div>
    </div>
  );
};
