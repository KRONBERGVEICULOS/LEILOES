import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type ContainerProps = {
  as?: "div" | "section";
  className?: string;
  children: ReactNode;
};

export function Container({
  as: Element = "div",
  className,
  children,
}: ContainerProps) {
  return (
    <Element
      className={cn(
        "mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10 [&>*]:min-w-0",
        className,
      )}
    >
      {children}
    </Element>
  );
}
