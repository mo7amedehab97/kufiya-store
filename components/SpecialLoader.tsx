"use client";

export default function SpecialLoader({
  fullscreen = true,
}: {
  fullscreen?: boolean;
}) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex items-center justify-center"
          : "flex items-center justify-center w-full h-full"
      }
    >
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full animate-spin"
          style={{
            border: "8px solid transparent",
            borderTopColor: "#000000", // Black (top stripe)
            borderRightColor: "#FFFFFF", // White (middle stripe)
            borderBottomColor: "green", // Green (bottom stripe)
            borderLeftColor: "red", // Red (triangle)
            animationDuration: "1s",
          }}
        />
      </div>
    </div>
  );
}
