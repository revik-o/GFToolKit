import { useState, useEffect } from "react";
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

  // Determine particle color and animation speed based on battery level
  const getParticleConfig = () => {
    let color = "#ef4444"; // red-500 for low
    let speed = 0.5;
    let quantity = 15;

    if (batteryLevel > 70) {
      color = "#10b981"; // emerald-500
      speed = 2;
      quantity = 40;
    } else if (batteryLevel > 30) {
      color = "#eab308"; // yellow-500
      speed = 1;
      quantity = 25;
    }

    return { color, speed, quantity };
  };

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
        fpsLimit: 60,
        fullScreen: { enable: false, zIndex: 0 },
        particles: {
          color: {
            value: color,
          },
          move: {
            direction: "top",
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
              speed: 1,
              sync: false,
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
