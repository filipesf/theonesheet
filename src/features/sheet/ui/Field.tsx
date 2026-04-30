import type { InputHTMLAttributes, ReactNode } from 'react';

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, children, className = '' }: FieldProps) {
  return (
    <label className={`flex flex-col gap-0.5 min-w-0 ${className}`}>
      <span className="font-label text-microcaption tracking-label uppercase text-ink-red">
        {label}
      </span>
      <span className="block border-b border-ink-red/60 pb-0.5 min-h-[1.6rem]">
        {children}
      </span>
    </label>
  );
}

type HandInputProps = InputHTMLAttributes<HTMLInputElement>;

export function HandInput({ className = '', ...rest }: HandInputProps) {
  return (
    <input
      {...rest}
      className={`w-full bg-transparent border-0 outline-none font-body italic text-lg leading-tight text-ink-navy placeholder:text-ink-navy/40 placeholder:not-italic focus:ring-0 ${className}`}
    />
  );
}
