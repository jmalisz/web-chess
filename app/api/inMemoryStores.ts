type SessionData = {
  userId: string;
  gameId: string;
  gamePosition: string;
  chatMessages: string[];
};

export function createSessionStore() {
  const sessionsStore = new Map<string, SessionData>();

  // Clear store every 24h to not overwhelm the server
  // TODO: Not ideal, find better solution. Probably a no-sql db.
  setInterval(() => sessionsStore.clear(), 24 * 60 * 60 * 1000);

  function findSession(sessionId: string) {
    return sessionsStore.get(sessionId);
  }
  function saveSession(sessionId: string, sessionData: SessionData) {
    return sessionsStore.set(sessionId, sessionData);
  }
  function clearSession(sessionId: string) {
    sessionsStore.delete(sessionId);
  }

  return {
    findSession,
    saveSession,
    clearSession,
  };
}
