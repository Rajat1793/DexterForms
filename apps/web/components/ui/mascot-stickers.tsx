"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Sticker = {
  src: string; top: number; side: "left" | "right";
  offset: number; rotate: number; size: number;
  tapeAngle: number; tapeWidth: number;
};

/** Renders N randomly placed sticker-taped mascot images.
 *  Parent must have `position: relative` for absolute positioning. */
export function MascotStickers({ count = 3 }: { count?: number }) {
  const [stickers, setStickers] = useState<Sticker[] | null>(null);

  useEffect(() => {
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    fetch("/api/mascots")
      .then(r => r.json())
      .then(({ images }: { images: string[] }) => {
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        const pool = shuffled.slice(0, count);
        const n = pool.length;
        if (n === 0) return;
        const topStep = 80 / n;
        setStickers(
          Array.from({ length: n }, (_, i) => ({
            src: pool[i]!,
            top: rnd(i * topStep + 5, i * topStep + topStep - 5),
            side: i % 2 === 0 ? "right" : "left",
            offset: rnd(0, 1.5),
            rotate: rnd(-12, 12),
            size: Math.round(rnd(110, 155)),
            tapeAngle: +rnd(-5, 5).toFixed(1),
            tapeWidth: Math.round(rnd(45, 68)),
          }))
        );
      });
  }, [count]);

  if (!stickers) return null;

  return (
    <>
      {stickers.map((img, i) => (
        <div key={i} className="pointer-events-none select-none absolute z-20 hidden md:block"
          style={{ top: `${img.top}%`, [img.side]: `${img.offset}%`, transform: `rotate(${img.rotate}deg)` }}>
          <div className="sticker-card">
            <Image src={img.src} alt="" width={img.size} height={img.size}
              style={{ height: "auto", display: "block" }} className="object-contain" />
          </div>
          <div className="sticker-tape" style={{
            width: `${img.tapeWidth}%`,
            top: "-10px",
            left: "50%",
            transform: `translateX(-50%) rotate(${img.tapeAngle}deg)`,
          }} />
        </div>
      ))}
    </>
  );
}

/** Single random mascot image fetched from /api/mascots. */
export function RandomMascot({
  width = 110, height = 110, className = "",
}: { width?: number; height?: number; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mascots")
      .then(r => r.json())
      .then(({ images }: { images: string[] }) => {
        if (images.length > 0) {
          setSrc(images[Math.floor(Math.random() * images.length)]!);
        }
      });
  }, []);

  if (!src) return null;

  return (
    <Image src={src} alt="" width={width} height={height}
      style={{ height: "auto" }} className={`object-contain ${className}`} />
  );
}
