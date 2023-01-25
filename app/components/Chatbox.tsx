import { debounce } from "lodash";
import type { KeyboardEvent } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

type ChatboxProps = {
  chatMessages: {
    id: string;
    isYour: boolean;
    content: string;
  }[];
  onNewChatMessage: (newChatMessage: string) => void;
};

export function Chatbox({ chatMessages, onNewChatMessage }: ChatboxProps) {
  const chatInputRef = useRef<HTMLDivElement>(null);
  const endChatRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    endChatRef.current?.scrollIntoView();
  }, [chatMessages]);

  const triggerSend = useCallback(() => {
    if (!chatInputRef.current?.textContent) return;

    onNewChatMessage(chatInputRef.current.textContent);
    chatInputRef.current.textContent = "";
  }, [onNewChatMessage]);

  const chatKeyUpHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key, shiftKey } = event;

      if (key === "Enter" && !shiftKey) {
        event.preventDefault();

        triggerSend();
      }
    },
    [triggerSend]
  );

  const debouncedChatKeyUpHandler = useMemo(
    () => debounce(chatKeyUpHandler, 100),
    [chatKeyUpHandler]
  );

  return (
    <div className="flex flex-col gap-4 md:w-[30%]">
      <div className="text-center">Game chat</div>
      <div className="flex h-full max-h-[80vh] flex-col gap-4 rounded-lg border border-base-content p-4">
        <div className="flex h-40 flex-col gap-2 overflow-auto md:h-[41rem]">
          {chatMessages.map(({ id, isYour, content }) =>
            isYour ? (
              <div key={id} className="chat chat-end whitespace-pre-wrap break-words">
                <div className="chat-bubble chat-bubble-primary">{content}</div>
              </div>
            ) : (
              <div key={id} className="chat chat-start whitespace-pre-wrap break-words">
                <div className="chat-bubble chat-bubble-secondary">{content}</div>
              </div>
            )
          )}
          <div ref={endChatRef} />
        </div>
        <div
          ref={chatInputRef}
          aria-label="Message input"
          className="input-bordered input overflow-auto whitespace-pre-wrap break-words md:h-1/5"
          data-lexical-editor="true"
          role="textbox"
          spellCheck="true"
          tabIndex={0}
          contentEditable
          onKeyUp={debouncedChatKeyUpHandler}
        />
        <button className="btn-ghost btn-sm btn" type="button" onClick={triggerSend}>
          Send
        </button>
      </div>
    </div>
  );
}
