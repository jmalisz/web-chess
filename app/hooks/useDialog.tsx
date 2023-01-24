import type { PropsWithChildren, ReactElement } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type DialogContextType = {
  dialog: ReactElement | undefined;
  setDialog: React.Dispatch<React.SetStateAction<ReactElement | undefined>>;
};

const DialogContext = createContext<DialogContextType>({ dialog: undefined, setDialog: () => {} });

export function DialogContextProvider({ children }: PropsWithChildren) {
  const [dialog, setDialog] = useState<ReactElement>();

  const dialogValue = useMemo(() => ({ dialog, setDialog }), [dialog]);

  return (
    <DialogContext.Provider value={dialogValue}>
      {dialog}
      {children}
    </DialogContext.Provider>
  );
}

export function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) throw new Error("useDialogContext must be used within DialogContextProvider");

  return context;
}
