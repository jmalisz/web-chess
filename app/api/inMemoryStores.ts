export type SessionData = {
  userId: string;
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

export type GameData = {
  gameId: string;
  gamePosition: string;
  chatMessages: string[];
};

export function createGameStore() {
  const gameStore = new Map<string, GameData>();

  // Clear store every 24h to not overwhelm the server
  // TODO: Not ideal, find better solution. Probably a no-sql db.
  setInterval(() => gameStore.clear(), 24 * 60 * 60 * 1000);

  function findGame(gameId: string) {
    return gameStore.get(gameId);
  }
  function saveGame(gameId: string, gameData: GameData) {
    return gameStore.set(gameId, gameData);
  }
  function clearGame(gameId: string) {
    gameStore.delete(gameId);
  }

  return {
    findGame,
    saveGame,
    clearGame,
  };
}
