import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/database';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // --- API Routes FIRST ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Real-time Server-Sent Events (SSE) stream
  app.get('/api/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const clientId = `sse-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    dbManager.addSseClient(clientId, res);

    // Initial handshake event
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

    // Keep-alive heartbeat every 20 seconds
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch {
        clearInterval(heartbeatInterval);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      dbManager.removeSseClient(clientId);
    });
  });

  // Full state fetch
  app.get('/api/state', (req, res) => {
    const state = dbManager.getState();
    res.json({ success: true, data: state });
  });

  // Auth routes
  app.post('/api/auth/login-admin', (req, res) => {
    const { username, password } = req.body || {};
    const result = dbManager.loginAdmin(username || '', password || '');
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  });

  app.post('/api/auth/login-client', (req, res) => {
    const { emailOrPhone, password } = req.body || {};
    const result = dbManager.loginClient(emailOrPhone || '', password || '');
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body || {};
    const result = dbManager.registerClient(name || '', email || '', phone || '', password || '');
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Court Facilities routes
  app.post('/api/facilities/add', (req, res) => {
    const facilityData = req.body;
    const facility = dbManager.addCourtFacility(facilityData);
    res.json({ success: true, facility });
  });

  app.put('/api/facilities/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const result = dbManager.updateCourtFacility(id, updates);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  });

  app.delete('/api/facilities/:id', (req, res) => {
    const { id } = req.params;
    const result = dbManager.deleteCourtFacility(id);
    res.json(result);
  });

  // Court Slots routes
  app.post('/api/courts/add', (req, res) => {
    const slotData = req.body;
    const result = dbManager.addCourtSlot(slotData);
    if (!result.success) {
      return res.status(409).json(result);
    }
    res.json(result);
  });

  app.post('/api/courts/batch-add', (req, res) => {
    const { slots } = req.body || {};
    if (!Array.isArray(slots)) {
      return res.status(400).json({ success: false, error: 'Lista de franjas no válida' });
    }
    const result = dbManager.batchAddCourtSlots(slots);
    res.json({ success: true, ...result });
  });

  app.put('/api/courts/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const result = dbManager.updateCourtSlot(id, updates);
    if (!result.success) {
      return res.status(409).json(result);
    }
    res.json(result);
  });

  app.delete('/api/courts/:id', (req, res) => {
    const { id } = req.params;
    const result = dbManager.deleteCourtSlot(id);
    res.json(result);
  });

  app.post('/api/courts/book', (req, res) => {
    const { slotId, user } = req.body || {};
    if (!slotId || !user) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos' });
    }
    const result = dbManager.bookCourtSlot(slotId, user);
    if (!result.success) {
      return res.status(409).json(result);
    }
    res.json(result);
  });

  app.post('/api/courts/cancel', (req, res) => {
    const { slotId, userId, isAdmin } = req.body || {};
    if (!slotId || !userId) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos' });
    }
    const result = dbManager.cancelCourtSlot(slotId, userId, Boolean(isAdmin));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Fitness Classes routes
  app.post('/api/classes/add', (req, res) => {
    const classData = req.body;
    const result = dbManager.addFitnessClass(classData);
    if (!result.success) {
      return res.status(409).json(result);
    }
    res.json(result);
  });

  app.put('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const result = dbManager.updateFitnessClass(id, updates);
    if (!result.success) {
      return res.status(409).json(result);
    }
    res.json(result);
  });

  app.delete('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const result = dbManager.deleteFitnessClass(id);
    res.json(result);
  });

  app.post('/api/classes/enroll', (req, res) => {
    const { classId, user } = req.body || {};
    if (!classId || !user) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros' });
    }
    const result = dbManager.enrollFitnessClass(classId, user);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/classes/cancel', (req, res) => {
    const { classId, userId } = req.body || {};
    if (!classId || !userId) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros' });
    }
    const result = dbManager.cancelFitnessClassEnrollment(classId, userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/classes/:id/admin-enroll', (req, res) => {
    const { id } = req.params;
    const { attendee } = req.body || {};
    if (!attendee || !attendee.userName) {
      return res.status(400).json({ success: false, error: 'Datos del alumno incompletos' });
    }
    const result = dbManager.adminEnrollUserInClass(id, attendee);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post('/api/classes/:id/admin-remove', (req, res) => {
    const { id } = req.params;
    const { targetUserId } = req.body || {};
    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Identificador del alumno requerido' });
    }
    const result = dbManager.adminRemoveUserFromClass(id, targetUserId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Direct database inspection & download for admin
  app.get('/api/database/file', (req, res) => {
    const content = dbManager.getRawFile();
    res.setHeader('Content-Disposition', 'attachment; filename="pabellon_database.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  });

  app.post('/api/database/reset', (req, res) => {
    const resetDb = dbManager.resetDatabase();
    res.json({ success: true, message: 'Base de datos restablecida', data: resetDb });
  });

  // Notifications
  app.post('/api/notifications/read', (req, res) => {
    const { notifId } = req.body || {};
    if (notifId) dbManager.markNotificationAsRead(notifId);
    res.json({ success: true });
  });

  app.post('/api/notifications/clear', (req, res) => {
    const { userId } = req.body || {};
    dbManager.clearAllNotifications(userId);
    res.json({ success: true });
  });

  // --- Vite middleware for frontend integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pabellón Municipal server online on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
