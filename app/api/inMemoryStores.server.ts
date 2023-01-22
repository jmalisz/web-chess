export type SessionData = string;

export function createSessionStore() {
  // Just check if exists in Map
  const sessionsStore = new Map<string, SessionData>();

  // Clear store every 24h to not overwhelm the server
  // TODO: Not ideal, find better solution. Probably a db.
  setInterval(() => sessionsStore.clear(), 24 * 60 * 60 * 1000);

  function findSession(sessionId: string) {
    return sessionsStore.get(sessionId);
  }
  function saveSession(sessionId: string, userId: string) {
    return sessionsStore.set(sessionId, userId);
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

export type ChatMessage = {
  fromUserId: string;
  content: string;
};

export type GameData = {
  firstUserId: string;
  secondUserId?: string;
  gamePosition: string;
  chatMessages: ChatMessage[];
};

export function createGameStore() {
  const gameStore = new Map<string, GameData>();

  // Clear store every 24h to not overwhelm the server
  // TODO: Not ideal, find better solution. Probably a db.
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