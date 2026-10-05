import { useEffect, useId, useRef, useState } from "react";

const hearts = [
  { left: "calc((100% - 500px) / 4)", top: "8%", size: "clamp(110px, 15vw, 220px)", rotate: "-14deg", offset: 0.04 },
  { left: "calc((100% - 500px) / 4)", top: "39%", size: "clamp(80px, 10vw, 150px)", rotate: "12deg", offset: 0.21 },
  { left: "calc((100% - 500px) / 4)", top: "70%", size: "clamp(100px, 13vw, 190px)", rotate: "-8deg", offset: 0.39 },
  { left: "calc(100% - (100% - 500px) / 4)", top: "12%", size: "clamp(100px, 14vw, 210px)", rotate: "15deg", offset: 0.56 },
  { left: "calc(100% - (100% - 500px) / 4)", top: "45%", size: "clamp(80px, 10vw, 145px)", rotate: "-12deg", offset: 0.73 },
  { left: "calc(100% - (100% - 500px) / 4)", top: "73%", size: "clamp(85px, 11vw, 160px)", rotate: "8deg", offset: 0.88 },
];

export function LoginHeartBackground() {
  const clipId = `login-heart-${useId().replace(/:/g, "")}`;
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(desktop.matches && !reducedMotion.matches);
    update();
    desktop.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    videos.current.forEach(video => {
      if (!video) return;
      if (paused) video.pause();
      else void video.play().catch(() => {});
    });
  }, [paused, enabled]);
  if (!enabled) return null;
  return (
    <>
    <div className="login-heart-background absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M .5 .94 C .44 .88 .06 .61 .06 .31 C .06 .05 .37 .01 .5 .23 C .63 .01 .94 .05 .94 .31 C .94 .61 .56 .88 .5 .94 Z" />
          </clipPath>
        </defs>
      </svg>
      {hearts.map((heart, index) => (
        <div key={index} className="login-video-heart absolute" style={{ left: heart.left, top: heart.top, width: `min(${heart.size}, calc((100vw - 560px) * 0.3))`, aspectRatio: "1", transform: `translateX(-50%) rotate(${heart.rotate})`, filter: "drop-shadow(0 8px 12px rgba(180, 110, 20, .14))" }}>
          <div className="h-full w-full bg-amber-300 p-1.5" style={{ clipPath: `url(#${clipId})` }}>
            <div className="h-full w-full bg-amber-100" style={{ clipPath: `url(#${clipId})` }}>
              <video
                ref={node => { videos.current[index] = node; }}
                autoPlay={!paused} muted loop playsInline preload="metadata"
                className="h-full w-full object-cover motion-reduce:hidden"
                onLoadedMetadata={(event) => {
                  const video = event.currentTarget;
                  if (Number.isFinite(video.duration) && video.duration > 0) {
                    video.currentTime = video.duration * heart.offset;
                  }
                }}
              >
                <source src={`${import.meta.env.BASE_URL}food_homepage.mp4`} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      ))}
    </div>
      <button type="button" className="absolute top-4 right-4 z-10 min-h-[44px] rounded-xl bg-white px-4 text-sm text-amber-800 shadow-sm" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Play background videos" : "Pause background videos"}</button>
    </>
  );
}