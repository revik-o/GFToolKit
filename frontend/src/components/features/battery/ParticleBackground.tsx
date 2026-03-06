import { useState, useEffect, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

interface ParticleBackgroundProps {
  batteryLevel: number;
}

export function ParticleBackground({ batteryLevel }: ParticleBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (): Promise<void> => {
    // can be used to perform some actions when particles are loaded
  };

  const getParticleConfig = useCallback(() => {
    let color = "#ef4444";
    let speed = 0.5;
    let quantity = 15;

    if (batteryLevel > 70) {
      color = "#ffffff";
      speed = 1;
      quantity = 40;
    } else if (batteryLevel > 30) {
      color = "#eab308";
      speed = 1;
      quantity = 25;
    }

    return { color, speed, quantity };
  }, [batteryLevel]);

  const { color, speed, quantity } = getParticleConfig();

  if (!init) {
    return <></>;
  }

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-40"
      options={{
        fpsLimit: 120,
        fullScreen: { enable: false, zIndex: 0 },
        particles: {
          color: {
            value: color,
          },
          move: {
            direction: "outside",
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: speed,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              width: 800,
              height: 800,
            },
            value: quantity,
          },
          opacity: {
            value: { min: 0.1, max: 0.5 },
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
              startValue: "max",
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 4 },
            animation: {
              enable: true,
              speed: 2,
              sync: false,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
