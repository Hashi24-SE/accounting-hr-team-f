const eventBus = require('../events/eventBus');
const { createNotification } = require('./notificationService');

eventBus.on('employee.created', async ({ employee, actorId, actorName }) => {
  await createNotification({
    type: 'employee.created',
    recipientId: null, // broadcast to all admins
    actorId,
    payload: { employee, actorName },
    channels: ['in_app', 'email'],
  });
});

eventBus.on('salary.revised', async ({ employee, salary, actorId }) => {
  await createNotification({
    type: 'salary.revised',
    recipientId: employee.id, // only notify that employee
    actorId,
    payload: { employee, salary },
    channels: ['in_app', 'email'],
  });
});

eventBus.on('account.deactivated', async ({ employee, actorId, actorName }) => {
  await createNotification({
    type: 'account.deactivated',
    recipientId: null, // broadcast to all admins
    actorId,
    payload: { employee, actorName },
    channels: ['in_app', 'email'],
  });
});
