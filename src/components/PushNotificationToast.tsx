import React, { useEffect } from 'react';
import { Bell, Clock, Sparkles, X } from 'lucide-react';
import { PushNotification } from '../types';

interface PushNotificationToastProps {
  notification: PushNotification | null;
  onDismiss: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full px-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start space-x-3.5 ring-1 ring-white/10">
        
        {/* App Icon badge */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Bell className="w-5 h-5 text-slate-950" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Pabellón Municipal · Notificación Push
            </span>
            <span className="text-[10px] text-slate-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Ahora</span>
            </span>
          </div>

          <h4 className="text-sm font-bold text-white leading-snug mb-1">
            {notification.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            {notification.body}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
