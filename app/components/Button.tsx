import type { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>;

export function Button({ children, className = "", ...buttonProps }: ButtonProps) {
  return (
    <button
      className={`rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 active:bg-blue-400 ${className}`}
      type="button"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...buttonProps}
    >
      {children}
    </button>
  );
}
