"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function ImageCarousel({ images = [], ratio = 3 / 4 }) {
  const [api, setApi] = useState(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setSelected(api.selectedScrollSnap());
    };
    update();

    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div className="w-full">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((img, idx) => (
            <CarouselItem key={img + idx}>
              <div className="relative w-full overflow-hidden rounded-2xl bg-muted"
                style={{ aspectRatio: `${ratio}` }} >
                <Image src={img} alt={img} fill className="object-contain" priority={idx === 0} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* 底部小点 */}
      <div className="py-2 flex items-center justify-center gap-1.5">
        {Array.from({ length: images.length }).map((_, i) => (
          <button key={i} type="button" className={cn(
            "h-1.5 w-1.5 rounded-full transition-all",
            i === selected ? "w-4 bg-foreground" : "bg-foreground/35"
          )} />
        ))}
      </div>
    </div>
  );
}