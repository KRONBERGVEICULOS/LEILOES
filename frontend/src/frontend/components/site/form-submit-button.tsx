"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/shared/lib/utils";

type FormSubmitButtonProps = {
  className?: string;
  idleLabel: string;
  pendingLabel: string;
};

export function FormSubmitButton({
  className,
  idleLabel,
  pendingLabel,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90 disabled:cursor-not-allowed disabled:opacity-72",
        className,
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
