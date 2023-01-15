import { Outlet } from "@remix-run/react";

export default function Index() {
  return (
    <div className="flex h-screen flex-col items-center">
      <header className="sticky top-0 w-full border-b border-b-gray-200">
        <div className="m-auto max-w-5xl p-4">
          <h1 className="text-blue-500">Web-Chess</h1>
        </div>
      </header>
      <div className="max-w-5xl flex-grow justify-center p-4">
        <Outlet />
      </div>
      <footer className="flex max-w-5xl justify-center p-4 opacity-20">
        Made by Jakub Maliszewski
      </footer>
    </div>
  );
}
