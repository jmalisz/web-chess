// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-param-reassign */

import { createServer } from "node:http";

import { Chess } from "chess.js";
import type { Express } from "express";
import { nanoid } from "nanoid";
import { Server } from "socket.io";
import { z } from "zod";

import type { ChatMessage, GameData } from "./inMemoryStores.server";
import { createGameStore, createSessionStore } from "./inMemoryStores.server";

declare module "socket.io" {
  interface Socket {
    sessionId: string;
    userId: string;
    gameId: string;
    gamePosition: string;
    chatMessages: ChatMessage[];
  }
}

const initialHandshakeSchema = z.object({
  sessionId: z.string().optional(),
});

const createGameRoomSchema = z.object({
  gameId: z.string(),
});

const newGamePositionSchema = z.object({
  gameId: z.string(),
  newGamePosition: z.string(),
});
// const newChatMessageSchema = z.object({
//   userId: z.string(),
//   newChatMessage: z.string(),
// });
// export type NewChatMessageSchemaInput = z.infer<typeof newChatMessageSchema>;
// export type NewChatMessageSchemaOutput = Omit<z.infer<typeof newChatMessageSchema>, "gameId">;

export function createSocketIoServer(app: Express) {
  const sessionStore = createSessionStore();
  const gameStore = createGameStore();
  const httpServer = createServer(app);
  const socketIoServer = new Server(httpServer);
  const chess = new Chess();

  socketIoServer.use((socketIo, next) => {
    const { sessionId } = initialHandshakeSchema.parse(socketIo.handshake.auth);

    if (sessionId) {
      const userId = sessionStore.findSession(sessionId);

      if (userId) {
        socketIo.sessionId = sessionId;
        socketIo.userId = userId;

        return next();
      }
    }

    socketIo.sessionId = nanoid();
    socketIo.userId = nanoid();

    next();
  });

  socketIoServer.on("connection", (socketIo) => {
    try {
      const { sessionId, userId } = socketIo;
      sessionStore.saveSession(sessionId, userId);
      socketIo.emit("connected", { sessionId, userId });

      // Provides socket logs on client
      if (process.env.NODE_ENV !== "production") {
        socketIo.onAny((event: string) => {
          // eslint-disable-next-line no-console
          console.log(event, sessionId);
        });
        // eslint-disable-next-line no-console
        console.log("Socket created:", sessionId);
      }

      socketIo.on("enterGameRoom", async (data) => {
        const { gameId } = createGameRoomSchema.parse(data);
        await socketIo.join(gameId);

        const savedGameData = gameStore.findGame(gameId);

        if (savedGameData) {
          if (userId === savedGameData.firstUserId || userId === savedGameData.secondUserId) {
            socketIo.emit("enterGameRoom", savedGameData);
            // eslint-disable-next-line unicorn/no-negated-condition
          } else if (!savedGameData.secondUserId) {
            savedGameData.secondUserId = userId;
            gameStore.saveGame(gameId, savedGameData);
            socketIo.emit("enterGameRoom", savedGameData);
          } else {
            // Disconnect client for trying to access unauthorized data
            socketIo.disconnect();
          }

          return;
        }

        const newGameData: GameData = {
          firstUserId: userId,
          gamePosition: chess.fen(),
          chatMessages: [],
        };

        gameStore.saveGame(gameId, newGameData);
        socketIo.emit("enterGameRoom", newGameData);
      });

      // TODO: Add server game history validation
      socketIo.on("newGamePosition", (data) => {
        const { gameId, newGamePosition } = newGamePositionSchema.parse(data);
        const game = gameStore.findGame(gameId);

        if (!game) {
          socketIo.disconnect(true);
          return;
        }

        gameStore.saveGame(gameId, { ...game, gamePosition: newGamePosition });
        socketIo.to(gameId).emit("newGamePosition", { newGamePosition });
      });

      // socketIo.on("newChatMessage", (data) => {
      //   const { userId, gameId, newChatMessage } = newChatMessageSchema.parse(data);
      //   const session = sessionStore.findSession(sessionId);

      //   if (!session) throw new Error(`Session ${sessionId} not found in newChatMessage event`);

      //   if (session.gameId !== gameId) {
      //     session.chatMessages = [];
      //   }
      //   session.chatMessages.push(newChatMessage);
      //   sessionStore.saveSession(sessionId, { ...session, gameId });
      //   socketIo.to(gameId).emit("newChatMessage", { userId, newChatMessage });
      // });
    } catch (error) {
      socketIo.emit("disconnecting", error);
      socketIo.disconnect(true);
    }
  });

  return { httpServer, socketIoServer };
}
