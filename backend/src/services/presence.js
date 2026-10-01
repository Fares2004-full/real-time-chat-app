const socketsByUser = new Map(); // userId -> Set<socketId>

function addSocket(userId, socketId) {
  if (!socketsByUser.has(userId)) socketsByUser.set(userId, new Set());
  const set = socketsByUser.get(userId);
  const wasOnline = set.size > 0;
  set.add(socketId);
  return { becameOnline: !wasOnline };
}

function removeSocket(userId, socketId) {
  const set = socketsByUser.get(userId);
  if (!set) return { becameOffline: false };
  set.delete(socketId);
  const becameOffline = set.size === 0;
  if (becameOffline) socketsByUser.delete(userId);
  return { becameOffline };
}

function isOnline(userId) {
  const set = socketsByUser.get(userId);
  return !!set && set.size > 0;
}

module.exports = { addSocket, removeSocket, isOnline };
