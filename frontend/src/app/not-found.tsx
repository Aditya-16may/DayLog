"use client";

import { useEffect, useRef } from "react";

export default function NotFoundPage() {
  const torchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveTorch = (x: number, y: number) => {
      if (!torchRef.current) return;
      torchRef.current.style.left = `${x}px`;
      torchRef.current.style.top = `${y}px`;
    };

    const handleMouseMove = (event: MouseEvent) => {
      moveTorch(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      moveTorch(touch.clientX, touch.clientY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      moveTorch(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/404_image.png')" }}
    >
      <div className="z-10 px-6 text-center font-mono min-h-screen w-screen relative">
        <h1
          className="left-2 top-1/2 absolute -mt-30 text-[7rem] font-bold text-[#6260e2] sm:text-[10rem] md:text-[15rem]"
          style={{
            textShadow:
              "-5px 5px 0px rgba(0,0,0,0.7), -10px 10px 0px rgba(0,0,0,0.4), -15px 15px 0px rgba(0,0,0,0.2)",
          }}
        >
          404
        </h1>
        <div className="right-0 top-1/2 absolute flex flex-col items-center justify-center">
            <h2
            className="-mt-10 text-4xl font-bold text-white sm:text-5xl md:-mt-20 md:text-7xl"
            style={{
              textShadow: "-5px 5px 0px rgba(0,0,0,0.7)",
            }}
          >
            Uh, Ohh
          </h2>

          <h3
            className="mt-6 max-w-4xl text-lg font-bold text-white sm:text-2xl md:text-3xl"
            style={{
              textShadow: "-5px 5px 0px rgba(0,0,0,0.7)",
            }}
          >
            Sorry, we can&apos;t find what you are looking for because it&apos;s so dark in here.
          </h3>
        </div>
        
      </div>

      <div
        ref={torchRef}
        className="pointer-events-none fixed left-1/2 top-1/2 z-20 size-45 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.97)] md:size-55"
      >
        <div className="h-full w-full rounded-full shadow-[inset_0_0_40px_2px_#000,0_0_20px_4px_rgba(13,13,10,0.2)]" />
      </div>
    </div>
  );
}