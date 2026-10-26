/**
 * NirogCare - Clean Centered 3D Human Medical Assistant Stage (`/src/avatar/AvatarCanvas.tsx`)
 *
 * Renders the character's rigged 3D Human GLB model (`/avatars/medical_assistant.glb`,
 * `/avatars/avaturn.glb`, `/avatars/avatarsdk.glb`) centered in the middle of the viewport
 * at head-and-shoulders portrait framing, with smooth 60 FPS audio-clock lip-sync.
 * Includes graceful WebGL Context Lost recovery and photoreal 2D studio fallback.
 */

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { CharacterConfig } from '../config/characters';
import { ProceduralAvatar, type AvatarBehaviorState } from './ProceduralAvatar';

export interface AvatarCanvasProps {
  character: CharacterConfig;
  behaviorState: AvatarBehaviorState;
}

class WebGlErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[AvatarCanvas] 3D WebGL render error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  character,
  behaviorState
}) => {
  const [contextLost, setContextLost] = useState(false);

  const studio2DFallback = (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#071915] via-[#071418] to-[#050d11]">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/50">
        <img
          src={character.posterUrl || '/avatars/doctor-poster-1080.jpg'}
          alt={character.name}
          className="w-full h-full object-cover object-top animate-pulse"
          style={{ animationDuration: behaviorState === 'speaking' ? '1.5s' : '4s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <div className="mt-4 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-medium text-emerald-300">
        {character.name} • {character.title}
      </div>
    </div>
  );

  if (contextLost) {
    return studio2DFallback;
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-gradient-to-b from-[#071915] via-[#071418] to-[#050d11]">
      {/* Soft Centered Emerald Studio Key Glow behind the Avatar */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, hsla(158, 64%, 42%, 0.26), hsla(168, 60%, 35%, 0.08) 48%, transparent 72%)'
        }}
      />

      {/* Centered Head-and-Shoulders 3D Human Viewport with Context Guard */}
      <WebGlErrorBoundary fallback={studio2DFallback}>
        <Canvas
          shadows={false}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.0, 1.25], fov: 28, near: 0.05, far: 20 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false
          }}
          onCreated={({ gl }) => {
            const canvasEl = gl.domElement;
            canvasEl.addEventListener('webglcontextlost', (event) => {
              event.preventDefault();
              console.warn('[AvatarCanvas] WebGL context lost; gracefully falling back to photoreal 2D assistant mode.');
              setContextLost(true);
            });
            canvasEl.addEventListener('webglcontextrestored', () => {
              console.info('[AvatarCanvas] WebGL context restored.');
              setContextLost(false);
            });
          }}
        >
          <ambientLight intensity={1.1} color="#f8fafc" />
          <hemisphereLight args={['#f0fdf4', '#0f172a', 0.95]} />
          <directionalLight position={[1.3, 1.6, 2.2]} intensity={1.7} color="#fffbeb" />
          <directionalLight position={[-1.5, 1.0, 1.8]} intensity={0.85} color="#99f6e4" />
          <spotLight
            position={[0, 1.4, -1.8]}
            intensity={1.25}
            angle={0.75}
            penumbra={0.8}
            color="#10b981"
          />
          <ProceduralAvatar character={character} behaviorState={behaviorState} />
        </Canvas>
      </WebGlErrorBoundary>

      {/* Soft bottom vignette so the bottom chat bar blends cleanly */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(5, 13, 17, 0.88) 100%)'
        }}
      />
    </div>
  );
};
