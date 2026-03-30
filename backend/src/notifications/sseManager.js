const clients = new Map(); // userId → res

const addClient = (userId, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  clients.set(userId, res);

  // Cleanup on disconnect
  res.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(userId);
  });
};

const sendToUser = (userId, payload) => {
  const client = clients.get(userId);
  if (client) {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
};

const sendToAll = (payload) => {
  clients.forEach((res) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
};

module.exports = {
  addClient,
  sendToUser,
  sendToAll
};