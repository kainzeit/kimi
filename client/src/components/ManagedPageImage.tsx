import type { CSSProperties } from "react";

export type ManagedPageImageData = {
  id: number;
  url: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
};

export function getManagedPageImageStyle(
  image: ManagedPageImageData,
  fallbackHeight: number,
): CSSProperties {
  const width = image.displayWidth && image.displayWidth > 0 ? image.displayWidth : null;
  const height = image.displayHeight && image.displayHeight > 0 ? image.displayHeight : fallbackHeight;

  return {
    width: width ? `${width}px` : "auto",
    height: `${height}px`,
    maxWidth: "100%",
    objectFit: "contain",
    borderRadius: "4px",
    display: "block",
  };
}

export function ManagedPageImage({
  image,
  fallbackHeight,
  className,
}: {
  image: ManagedPageImageData;
  fallbackHeight: number;
  className?: string;
}) {
  return (
    <img
      src={image.url}
      alt=""
      className={`managed-page-image ${className ?? ""}`.trim()}
      style={getManagedPageImageStyle(image, fallbackHeight)}
      data-display-width={image.displayWidth ?? undefined}
      data-display-height={image.displayHeight ?? undefined}
    />
  );
}
