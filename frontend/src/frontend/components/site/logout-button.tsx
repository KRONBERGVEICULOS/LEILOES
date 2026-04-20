"use client";

import { logoutUserAction } from "@/backend/features/platform/actions/auth";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className,
  label = "Sair",
}: LogoutButtonProps) {
  return (
    <form action={logoutUserAction}>
      <button className={className} type="submit">
        {label}
      </button>
    </form>
  );
}
