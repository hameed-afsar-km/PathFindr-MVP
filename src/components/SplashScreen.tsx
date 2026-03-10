import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 2000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const primaryColor = new THREE.Color('hsl(270, 80%, 60%)');
    const accentColor = new THREE.Color('hsl(320, 80%, 65%)');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;
      pos[i3 + 1] = (Math.random() - 0.5) * 20;
      pos[i3 + 2] = (Math.random() - 0.5) * 20;

      const t = Math.random();
      const color = primaryColor.clone().lerp(accentColor, t);
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function SplashScreen() {
  const { setScreen, careers, profile } = useApp();

  const handleBegin = () => {
    if (careers && careers.length > 0) {
      setScreen('home');
    } else if (profile?.username) {
      setScreen('onboarding');
    } else {
      setScreen('auth');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <ParticleField />
        </Canvas>
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold gradient-text mb-4 tracking-tight"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
        >
          PathFindr
          <span className="text-primary">.AI</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground text-lg md:text-xl mb-12 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          Your AI-powered career navigation system
        </motion.p>

        <motion.button
          onClick={handleBegin}
          className="glass glow-primary px-10 py-4 rounded-2xl text-primary font-semibold text-lg hover:scale-105 transition-transform duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Your Journey →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
