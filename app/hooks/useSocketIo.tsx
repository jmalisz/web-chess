import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

const SocketIoContext = createContext<Socket | undefined>(undefined);

export function SocketIoProvider({ children }: PropsWithChildren) {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocketIo = io("http://localhost:3000", { autoConnect: false });
    setSocket(newSocketIo);

    if (process.env.NODE_ENV !== "production") {
      newSocketIo.onAny((event, ...args) => {
        // eslint-disable-next-line no-console
        console.log(event, args);
      });
      console.log("Socket created!", newSocketIo);
    }

    return () => {
      newSocketIo.close();
    };
  }, []);

  return <SocketIoContext.Provider value={socket}> {children} </SocketIoContext.Provider>;
}

export function useSocketIo() {
  const context = useContext(SocketIoContext);

  return context;
}
