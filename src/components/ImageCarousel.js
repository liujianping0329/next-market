"use client";

import {
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const NEXT_IMAGE_HOSTS = [
  "flrzlulvyzokzwptsidz.supabase.co",
];

const canUseNextImage = (src) => {
  if (!src) return false;

  // 本地图片
  if (src.startsWith("/")) return true;

  try {
    return NEXT_IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
};

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
          {images.map((img, idx) => {
            const useNextImage = canUseNextImage(img);
            return (
              <CarouselItem key={img + idx}>
                <div className="relative w-full overflow-hidden bg-muted"
                  style={{ aspectRatio: `${ratio}` }} >
                  {useNextImage ? (
                    <Image
                      src={img}
                      alt={img}
                      fill
                      className="object-contain"
                      priority={idx === 0}
                    />
                  ) : (
                    <img
                      src={img}
                      alt={img}
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  )}
                </div>
              </CarouselItem>
            )
          })}
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