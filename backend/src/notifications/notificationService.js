const supabase = require('../config/supabase');
const eventBus = require('../events/eventBus');
const { sendToUser, sendToAll } = require('./sseManager');
const { sendEmail } = require('./emailTransport');
const { getTemplate } = require('./templates/index');

const createNotification = async ({
  type,
  recipientId = null,
  actorId,
  payload,
  channels = ['in_app', 'email'],
}) => {
  const template = getTemplate(type, payload);

  // 1. Persist to DB
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      type,
      recipient_id: recipientId,
      actor_id: actorId,
      title: template.title,
      body: template.body,
      payload,
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create notification:', error);
    return;
  }

  // 2. Real-time SSE push
  if (channels.includes('in_app')) {
    const ssePayload = { ...notification, event: 'notification.new' };
    recipientId
      ? sendToUser(recipientId, ssePayload)
      : sendToAll(ssePayload);
  }

  // 3. Email
  if (channels.includes('email') && template.email) {
    // Determine the email recipient
    let recipientEmail = null;

    if (recipientId) {
      // Find specific user (for things like salary.revised)
      const { data: recipient } = await supabase
        .from('users')
        .select('email')
        .eq('id', recipientId)
        .single();
      recipientEmail = recipient?.email;
    } else {
      // Broadcast to admins (for things like employee.created, account.deactivated)
      // For testing/mocking we'll just send it to a generic admin,
      // In reality we should iterate over all admins or have a generic admin email
      // To simplify this mock, we fetch the default admin email
      const env = require('../config/env');
      recipientEmail = env.ADMIN_DEFAULT_EMAIL;
    }

    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: template.email.subject,
        html: template.email.html,
      });
    }
  }

  return notification;
};

module.exports = {
  createNotification,
};