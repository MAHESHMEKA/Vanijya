'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { api } from '../../lib/api';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Info,
  Check,
  ExternalLink,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { isAuthenticated, user } = useAuth();
  const { t, formatDateLocalized } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Ignore background network error
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const list = await api.get<NotificationItem[]>('/notifications?limit=15');
      setNotifications(list || []);
      const count = (list || []).filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 25000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated, fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  if (!isAuthenticated || !user) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BID_RECEIVED':
      case 'BID_MODIFIED':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'BID_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT_PAID':
      case 'PAYMENT_INITIATED':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'PROFILE_INCOMPLETE':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  const getNotificationLink = (n: NotificationItem) => {
    if (n.entityType === 'LOT' && user.role === 'FARMER') return `/my-lots`;
    if (n.entityType === 'TRANSACTION') {
      return user.role === 'BUYER' ? '/purchases' : '/dashboard';
    }
    if (n.type === 'PROFILE_INCOMPLETE') return '/profile';
    return user.role === 'BUYER' ? '/my-bids' : '/dashboard';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                {t.notificationsTitle}
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">
                  {unreadCount} {t.unreadCountLabel}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {t.markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-amber-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                {t.commonLoading}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                {t.noNotifications}
              </div>
            ) : (
              notifications.map((n) => {
                const targetLink = getNotificationLink(n);
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-amber-50/50 transition flex items-start gap-3 ${
                      !n.isRead ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 bg-white border border-amber-200 rounded-lg shrink-0 shadow-2xs">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            title="Mark as read"
                            className="w-2 h-2 rounded-full bg-amber-500 shrink-0 hover:scale-125 transition"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug break-words">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          {formatDateLocalized(n.createdAt)}
                        </span>
                        <Link
                          href={targetLink}
                          onClick={() => {
                            if (!n.isRead) {
                              api.patch(`/notifications/${n.id}/read`, {}).catch(() => {});
                            }
                            setIsOpen(false);
                          }}
                          className="text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5"
                        >
                          {t.viewRelatedEntity} <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
