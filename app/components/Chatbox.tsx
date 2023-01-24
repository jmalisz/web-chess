import type { KeyboardEvent } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

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

  const chatKeyUpHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key, shiftKey } = event;

      if (key === "Enter" && !shiftKey) {
        event.preventDefault();

        if (!chatInputRef.current?.textContent) return;

        onNewChatMessage(chatInputRef.current.textContent);
        chatInputRef.current.textContent = "";
      }
    },
    [onNewChatMessage]
  );

  return (
    <div className="flex w-80 flex-col gap-4">
      <div className="text-center">Game chat</div>
      <div className="flex h-[41rem] max-h-[41rem] flex-col gap-4 rounded-lg border border-base-content p-4">
        <div className="flex h-4/5 flex-col gap-2 overflow-auto">
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
          className="input-bordered input h-1/5 overflow-auto whitespace-pre-wrap break-words"
          data-lexical-editor="true"
          role="textbox"
          spellCheck="true"
          tabIndex={0}
          contentEditable
          onKeyUp={chatKeyUpHandler}
        />
      </div>
    </div>
  );
}
