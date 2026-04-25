/* eslint-disable @next/next/no-img-element */
import Image, { type ImageProps } from "next/image";

import { cn } from "@/shared/lib/utils";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

function isLocalPublicImage(src: string) {
  return src.startsWith("/");
}

export function MediaImage({
  alt,
  className,
  fill,
  loading,
  src,
  ...props
}: MediaImageProps) {
  if (isLocalPublicImage(src)) {
    return (
      <Image
        alt={alt}
        className={className}
        fill={fill}
        loading={loading}
        src={src}
        {...props}
      />
    );
  }

  if (fill) {
    return (
      <img
        alt={alt}
        className={cn("absolute inset-0 h-full w-full", className)}
        loading={loading}
        src={src}
      />
    );
  }

  return <img alt={alt} className={className} loading={loading} src={src} />;
}
