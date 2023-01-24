/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import type { Socket } from "socket.io";

export const createCallbackErrorWrapper = (socketIo: Socket) => {
  const errorHandler = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error);
    socketIo.disconnect(true);
  };

  return (callback: (args: unknown[]) => void) =>
    (...args: unknown[]) => {
      try {
        const ret = Reflect.apply(callback, this, args);
        if (ret && typeof ret?.catch === "function") {
          // async handler
          ret.catch(errorHandler);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        errorHandler(error);
      }
    };
};

/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
