import { Form } from "@remix-run/react";

export default function Index() {
  return (
    <div>
      Would you want to play a game of chess?
      <Form className="mt-4">
        <button
          className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 active:bg-blue-400"
          type="submit"
        >
          Play
        </button>
      </Form>
    </div>
  );
}
