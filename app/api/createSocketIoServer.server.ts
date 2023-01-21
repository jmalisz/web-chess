// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-param-reassign */

import { createServer } from "node:http";

import type { Express } from "express";
import { Server } from "socket.io";
import { z } from "zod";

import { createSessionStore } from "./inMemoryStores";

declare module "socket.io" {
  interface Socket {
    sessionId: string;
    userId: string;
    gameId: string;
    gamePosition: string;
    chatMessages: string[];
  }
}

const socketIoCustomDataSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  gameId: z.string(),
  gamePosition: z.string(),
  chatMessages: z.array(z.string()),
});
const newGamePositionSchema = z.object({
  gameId: z.string(),
  gamePosition: z.string(),
});
const newChatMessageSchema = z.object({
  userId: z.string(),
  gameId: z.string(),
  newChatMessage: z.string(),
});
export type NewChatMessageSchemaInput = z.infer<typeof newChatMessageSchema>;
export type NewChatMessageSchemaOutput = Omit<z.infer<typeof newChatMessageSchema>, "gameId">;

export function createSocketIoServer(app: Express) {
  const sessionStore = createSessionStore();
  const httpServer = createServer(app);
  const socketIoServer = new Server(httpServer);

  socketIoServer.use((socketIo, next) => {
    const { sessionId, userId, gameId, gamePosition, chatMessages } =
      socketIoCustomDataSchema.parse(socketIo.handshake.auth);

    if (sessionId) {
      const session = sessionStore.findSession(sessionId);

      if (session) {
        socketIo.sessionId = sessionId;
        socketIo.userId = session.userId;
        socketIo.gameId = session.gameId;
        socketIo.gamePosition = session.gamePosition;
        socketIo.chatMessages = session.chatMessages;

        return next();
      }
    }

    socketIo.sessionId = sessionId;
    socketIo.gameId = userId;
    socketIo.gameId = gameId;
    socketIo.gamePosition = gamePosition;
    socketIo.chatMessages = chatMessages;

    next();
  });

  socketIoServer.on("connection", (socketIo) => {
    try {
      const { sessionId, ...freshSessionData } = socketIo;
      sessionStore.saveSession(sessionId, {
        userId: freshSessionData.userId,
        gameId: freshSessionData.gameId,
        gamePosition: freshSessionData.gamePosition,
        chatMessages: freshSessionData.chatMessages,
      });
      socketIo.emit("connected", "Connected!");

      // TODO: Add server game history validation
      socketIo.on("newGamePosition", (data) => {
        const roomGameData = newGamePositionSchema.parse(data);
        const session = sessionStore.findSession(sessionId);

        if (!session) throw new Error(`Session ${sessionId} not found in newGamePosition event`);

        sessionStore.saveSession(sessionId, { ...session, ...roomGameData });
        socketIo.to(roomGameData.gameId).emit("newGamePosition", roomGameData);
      });

      socketIo.on("newChatMessage", (data) => {
        const { userId, gameId, newChatMessage } = newChatMessageSchema.parse(data);
        const session = sessionStore.findSession(sessionId);

        if (!session) throw new Error(`Session ${sessionId} not found in newChatMessage event`);

        if (session.gameId !== gameId) {
          session.chatMessages = [];
        }
        session.chatMessages.push(newChatMessage);
        sessionStore.saveSession(sessionId, { ...session, gameId });
        socketIo.to(gameId).emit("newChatMessage", { userId, newChatMessage });
      });
    } catch (error) {
      socketIo.emit("disconnecting", error);
      socketIo.disconnect(true);
    }
  });

  return { httpServer, socketIoServer };
}
