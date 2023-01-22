import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { z } from "zod";

type SocketIoContextData = {
  socketIo: Socket;
  userId: string;
};

const SocketIoContext = createContext<SocketIoContextData | undefined>(undefined);

const SESSION_ID_LS_KEY = "sessionId";

const connectedDataSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
});

export function SocketIoProvider({ children }: PropsWithChildren) {
  const [socketIo, setSocketIo] = useState<Socket>();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const newSocketIo = io("http://localhost:3000", { autoConnect: false });
    setSocketIo(newSocketIo);

    // Provides socket logs on client
    if (process.env.NODE_ENV !== "production") {
      newSocketIo.onAny((event, ...args) => {
        // eslint-disable-next-line no-console
        console.log(event, args);
      });
      // eslint-disable-next-line no-console
      console.log("Socket created:", newSocketIo);
    }

    // Connects the socket
    const savedSessionId = localStorage.getItem(SESSION_ID_LS_KEY);
    if (savedSessionId) {
      newSocketIo.auth = { sessionId: savedSessionId };
    }
    newSocketIo.connect();
    newSocketIo.on("connected", (data) => {
      const { sessionId, userId: socketUserId } = connectedDataSchema.parse(data);
      newSocketIo.auth = { sessionId };
      localStorage.setItem(SESSION_ID_LS_KEY, sessionId);
      setUserId(socketUserId);
    });

    return () => {
      newSocketIo.close();
    };
  }, []);

  const contextValue = useMemo(
    () => (socketIo ? { socketIo, userId } : undefined),
    [socketIo, userId]
  );

  return <SocketIoContext.Provider value={contextValue}> {children} </SocketIoContext.Provider>;
}

export function useSocketIo() {
  const context = useContext(SocketIoContext);

  return context;
}
