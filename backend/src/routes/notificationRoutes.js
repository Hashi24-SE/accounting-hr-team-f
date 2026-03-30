const express = require('express');
const { addClient } = require('../notifications/sseManager');
const authMiddleware = require('../middlewares/authMiddleware');
const supabase = require('../config/supabase');
const { success } = require('../utils/response');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Real-time notifications and history
 */

/**
 * @swagger
 * /api/notifications/stream:
 *   get:
 *     summary: Connect to SSE stream
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: SSE stream connected
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

router.get('/stream', (req, res) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  let user;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    user = { ...decoded, id: decoded.id || decoded.userId };
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!user?.id) return res.status(401).json({ message: 'Unauthorized' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  addClient(user.id, res);
});

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', authMiddleware, async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${req.user.id},recipient_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return success(res, data, 'Notifications fetched successfully', 200);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id);

    if (error) throw error;

    return success(res, null, 'Notification marked as read', 200);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', authMiddleware, async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .or(`recipient_id.eq.${req.user.id},recipient_id.is.null`);

    if (error) throw error;

    return success(res, null, 'All notifications marked as read', 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;