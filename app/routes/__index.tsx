import { Link, Outlet } from "@remix-run/react";
import { useEffect } from "react";

import { useDialogContext } from "~/hooks/useDialog";
import { useSocketIo } from "~/hooks/useSocketIo";

type DisconnectedDialogProps = {
  onGoToHome: () => void;
};

function DisconnectedDialog({ onGoToHome }: DisconnectedDialogProps) {
  return (
    <div className="modal visible">
      <div className="modal-box">
        <h3 className="text-center text-lg font-bold">Disconnected</h3>
        <p className="mb-4">
          It seems that you have been disconnected. This may occur on server error or if you try to
          join a game session that is already in progress.
        </p>
        <p>If this error persists try reloading the webpage or go to homepage.</p>
        <div className="modal-action justify-evenly">
          <Link to="/">
            <button className="btn-primary btn" type="button" onClick={onGoToHome}>
              Go to homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function IndexLayout() {
  const socketIo = useSocketIo();
  const { setDialog } = useDialogContext();

  // Display error dialog to user that has been disconnected
  useEffect(() => {
    if (!socketIo) return;

    socketIo.on("disconnect", () => {
      setDialog(<DisconnectedDialog onGoToHome={() => socketIo.connect()} />);
    });
  }, [setDialog, socketIo]);

  return (
    <div className="flex h-screen flex-col items-center">
      <header className="sticky top-0 z-10 w-full border-b border-b-gray-200 bg-base-100">
        <div className="m-auto max-w-5xl p-4">
          <Link to="/">
            <h1 className="text-3xl text-primary focus:text-primary-focus">Web-Chess</h1>
          </Link>
        </div>
      </header>
      <div className="w-full max-w-5xl flex-grow justify-center p-4">
        <Outlet />
      </div>
      <footer className="flex max-w-5xl justify-center p-4 opacity-20">
        Made by Jakub Maliszewski
      </footer>
    </div>
  );
}

export default IndexLayout;
