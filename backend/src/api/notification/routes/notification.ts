export default {
  routes: [
    { method: 'GET', path: '/notifications', handler: 'notification.find', config: { auth: { scope: ['authenticated'] } } },
    { method: 'GET', path: '/notifications/unread-count', handler: 'notification.unreadCount', config: { auth: { scope: ['authenticated'] } } },
    { method: 'POST', path: '/notifications/:id/read', handler: 'notification.markRead', config: { auth: { scope: ['authenticated'] } } },
    { method: 'POST', path: '/notifications/read-all', handler: 'notification.markAllRead', config: { auth: { scope: ['authenticated'] } } },
  ],
};
