/**
 * NirogCare - Clean Centered 3D Human Medical Assistant Stage (`/src/avatar/AvatarCanvas.tsx`)
 *
 * Renders the character's rigged 3D Human GLB model (`/avatars/medical_assistant.glb`,
 * `/avatars/avaturn.glb`, `/avatars/avatarsdk.glb`) centered in the middle of the viewport
 * at head-and-shoulders portrait framing, with smooth 60 FPS audio-clock lip-sync.
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import type { CharacterConfig } from '../config/characters';
import { ProceduralAvatar, type AvatarBehaviorState } from './ProceduralAvatar';

export interface AvatarCanvasProps {
  character: CharacterConfig;
  behaviorState: AvatarBehaviorState;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  character,
  behaviorState
}) => {
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

      {/* Centered Head-and-Shoulders 3D Human Viewport */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.0, 1.25], fov: 28, near: 0.05, far: 20 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.1} color="#f8fafc" />
        <hemisphereLight args={['#f0fdf4', '#0f172a', 0.95]} />
        <directionalLight
          position={[1.3, 1.6, 2.2]}
          intensity={1.7}
          color="#fffbeb"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
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
