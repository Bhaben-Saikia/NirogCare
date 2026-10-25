/**
 * Real-Time 3D Human GLB Avatar with 72 ARKit + Oculus Viseme Morph Targets (`/src/avatar/ProceduralAvatar.tsx`)
 *
 * Loads the character's rigged 3D human `.glb` model (`/avatars/medical_assistant.glb`,
 * `/avatars/avaturn.glb`, `/avatars/avatarsdk.glb`) using Three.js `GLTFLoader`
 * and drives its 66-72 facial blendshapes + skeletal rig at 60 FPS from the hardware
 * `AudioContext.currentTime` clock (or Browser SpeechSynthesis phoneme cadence)
 * via `avatarAudioEngine.sampleVisemes(dt)`.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CharacterConfig } from '../config/characters';
import { avatarAudioEngine } from '../audio/audioEngine';

export type AvatarBehaviorState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ProceduralAvatarProps {
  character: CharacterConfig;
  behaviorState: AvatarBehaviorState;
}

interface MorphMeshEntry {
  mesh: THREE.Mesh;
  dict: Record<string, number>;
  influences: number[];
}

interface RigRefs {
  scene: THREE.Group;
  headYOffset: number;
  morphMeshes: MorphMeshEntry[];
  bones: {
    spine?: THREE.Bone;
    spine1?: THREE.Bone;
    spine2?: THREE.Bone;
    neck?: THREE.Bone;
    head?: THREE.Bone;
    leftArm?: THREE.Bone;
    rightArm?: THREE.Bone;
    leftForeArm?: THREE.Bone;
    rightForeArm?: THREE.Bone;
  };
  restRotations: Map<THREE.Bone, THREE.Euler>;
}

const gltfCache = new Map<string, Promise<THREE.Group>>();

function loadGlbScene(url: string): Promise<THREE.Group> {
  const existing = gltfCache.get(url);
  if (existing) return existing;

  const loader = new GLTFLoader();
  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      (err) => reject(err)
    );
  });
  gltfCache.set(url, promise);
  return promise;
}

function setMorphTargetDamped(
  morphMeshes: MorphMeshEntry[],
  targetName: string,
  targetValue: number,
  lambda: number,
  dt: number
): void {
  const clamped = Math.max(0, Math.min(1, targetValue));
  for (let i = 0; i < morphMeshes.length; i++) {
    const entry = morphMeshes[i];
    const idx = entry.dict[targetName];
    if (idx !== undefined && entry.influences[idx] !== undefined) {
      entry.influences[idx] = THREE.MathUtils.damp(
        entry.influences[idx],
        clamped,
        lambda,
        dt
      );
    }
  }
}

export const ProceduralAvatar: React.FC<ProceduralAvatarProps> = ({
  character,
  behaviorState
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const [rig, setRig] = useState<RigRefs | null>(null);

  const animState = useRef({
    nextBlinkTime: 1.6,
    blinkStartTime: -1,
    blinkDuration: 0.17,
    nextSaccadeTime: 1.4,
    saccadeTargetX: 0,
    saccadeTargetY: 0,
    currentEyeX: 0,
    currentEyeY: 0,
    phraseGestureTime: -10,
    phraseGestureSide: 0,
    phraseNodImpulse: 0,
    smoothedStateWeights: {
      idle: 1,
      listening: 0,
      thinking: 0,
      speaking: 0
    }
  });

  useEffect(() => {
    const unsub = avatarAudioEngine.onPhraseBoundary((chunkIndex, text) => {
      const st = animState.current;
      st.phraseGestureTime = performance.now() / 1000;
      st.phraseGestureSide = chunkIndex % 3 === 0 ? 0 : chunkIndex % 2 === 0 ? 1 : -1;
      const hasStrongPunct = /[?!।]/.test(text);
      st.phraseNodImpulse = hasStrongPunct ? 1.0 : 0.65;
    });
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const url = character.glbUrl || '/avatars/medical_assistant.glb';

    loadGlbScene(url)
      .then((loadedScene) => {
        if (cancelled) return;

        const morphMeshes: MorphMeshEntry[] = [];
        const bones: RigRefs['bones'] = {};
        const restRotations = new Map<THREE.Bone, THREE.Euler>();
        let headCenterY = 1.56;

        loadedScene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = false;

            // Hide glasses if present so eyes and upper face remain unobstructed
            if (/Glasses/i.test(mesh.name)) {
              mesh.visible = false;
            }

            if (/Wolf3D_Head|Head_Mesh|AvatarHead/i.test(mesh.name)) {
              mesh.geometry.computeBoundingBox();
              const bb = mesh.geometry.boundingBox;
              if (bb && bb.max.y > 0.8 && bb.max.y < 2.2) {
                headCenterY = (bb.min.y + bb.max.y) * 0.5;
              }
            }

            if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
              morphMeshes.push({
                mesh,
                dict: mesh.morphTargetDictionary,
                influences: mesh.morphTargetInfluences
              });
            }
          }

          if ((obj as THREE.Bone).isBone) {
            const bone = obj as THREE.Bone;
            const n = bone.name;
            if (n === 'Spine') bones.spine = bone;
            else if (n === 'Spine1') bones.spine1 = bone;
            else if (n === 'Spine2') bones.spine2 = bone;
            else if (n === 'Neck' || n === 'Neck1') bones.neck = bones.neck || bone;
            else if (n === 'Head' || n === 'AvatarHead') bones.head = bones.head || bone;
            else if (n === 'LeftArm') bones.leftArm = bone;
            else if (n === 'RightArm') bones.rightArm = bone;
            else if (n === 'LeftForeArm') bones.leftForeArm = bone;
            else if (n === 'RightForeArm') bones.rightForeArm = bone;
          }
        });

        // Relax T-pose arms down to a natural posture at the character's sides
        for (const armBone of [bones.leftArm, bones.rightArm]) {
          if (armBone) {
            const baseEuler = armBone.rotation.clone();
            if (Math.abs(baseEuler.x) < 0.35) {
              baseEuler.x = 1.18;
            }
            armBone.rotation.copy(baseEuler);
            restRotations.set(armBone, baseEuler.clone());
          }
        }

        // Apply eye-level pitch correction to Neck & Head bind poses (which tilt down +0.14..+0.25 rad in GLB bind pose)
        if (bones.neck) {
          const neckEuler = bones.neck.rotation.clone();
          if (neckEuler.x > 0.08) {
            neckEuler.x -= 0.13;
          }
          bones.neck.rotation.copy(neckEuler);
          restRotations.set(bones.neck, neckEuler.clone());
        }

        if (bones.head) {
          const headEuler = bones.head.rotation.clone();
          headEuler.x -= 0.03;
          bones.head.rotation.copy(headEuler);
          restRotations.set(bones.head, headEuler.clone());
        }

        for (const bone of [
          bones.spine,
          bones.spine1,
          bones.spine2,
          bones.leftForeArm,
          bones.rightForeArm
        ]) {
          if (bone) {
            restRotations.set(bone, bone.rotation.clone());
          }
        }

        setRig({
          scene: loadedScene,
          headYOffset: -headCenterY + 0.05,
          morphMeshes,
          bones,
          restRotations
        });
      })
      .catch((err) => {
        console.warn('[Avatar] Failed to load GLB:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [character.glbUrl]);

  // 60 FPS Audio-Clock-Driven Blendshape & Skeletal Loop
  useFrame((state, delta) => {
    if (!rig) return;
    const dt = Math.min(0.1, Math.max(0.001, delta));
    const t = state.clock.getElapsedTime();
    const st = animState.current;
    const { morphMeshes, bones, restRotations } = rig;

    // 1. Sample high-precision phoneme + formant visemes on the AudioContext clock
    const visemes = avatarAudioEngine.sampleVisemes(dt);
    const activeState: AvatarBehaviorState = visemes.isSpeaking ? 'speaking' : behaviorState;

    // 2. Smooth state transition weights
    const stateSpeed = 8.5;
    st.smoothedStateWeights.idle = THREE.MathUtils.damp(
      st.smoothedStateWeights.idle,
      activeState === 'idle' ? 1 : 0,
      stateSpeed,
      dt
    );
    st.smoothedStateWeights.listening = THREE.MathUtils.damp(
      st.smoothedStateWeights.listening,
      activeState === 'listening' ? 1 : 0,
      stateSpeed,
      dt
    );
    st.smoothedStateWeights.thinking = THREE.MathUtils.damp(
      st.smoothedStateWeights.thinking,
      activeState === 'thinking' ? 1 : 0,
      stateSpeed,
      dt
    );
    st.smoothedStateWeights.speaking = THREE.MathUtils.damp(
      st.smoothedStateWeights.speaking,
      activeState === 'speaking' ? 1 : 0,
      stateSpeed,
      dt
    );

    const wListen = st.smoothedStateWeights.listening;
    const wThink = st.smoothedStateWeights.thinking;
    const wSpeak = st.smoothedStateWeights.speaking;

    st.phraseNodImpulse = THREE.MathUtils.damp(st.phraseNodImpulse, 0, 5.5, dt);

    // 3. Natural Eyelid Blinking
    if (t >= st.nextBlinkTime && st.blinkStartTime < 0) {
      st.blinkStartTime = t;
      st.blinkDuration = 0.15 + Math.random() * 0.05;
      st.nextBlinkTime = t + 2.2 + Math.random() * 3.4;
    }

    let blinkWeight = 0;
    if (st.blinkStartTime >= 0) {
      const elapsed = t - st.blinkStartTime;
      if (elapsed >= st.blinkDuration) {
        st.blinkStartTime = -1;
        blinkWeight = 0;
      } else {
        const norm = elapsed / st.blinkDuration;
        if (norm < 0.35) {
          const p = norm / 0.35;
          blinkWeight = p * p * (3 - 2 * p);
        } else {
          const p = (norm - 0.35) / 0.65;
          blinkWeight = 1 - p * p;
        }
      }
    }

    setMorphTargetDamped(morphMeshes, 'eyeBlinkLeft', blinkWeight, 42, dt);
    setMorphTargetDamped(morphMeshes, 'eyeBlinkRight', blinkWeight, 42, dt);
    setMorphTargetDamped(morphMeshes, 'eyesClosed', blinkWeight, 42, dt);

    // 4. Eye Gaze Micro-Saccades
    if (t >= st.nextSaccadeTime) {
      if (activeState === 'thinking') {
        st.saccadeTargetX = 0.22 + (Math.random() - 0.5) * 0.08;
        st.saccadeTargetY = 0.14 + (Math.random() - 0.5) * 0.06;
        st.nextSaccadeTime = t + 0.9 + Math.random() * 0.9;
      } else {
        const centerGaze = Math.random() < 0.84;
        st.saccadeTargetX = centerGaze ? 0 : (Math.random() - 0.5) * 0.12;
        st.saccadeTargetY = centerGaze ? 0 : (Math.random() - 0.5) * 0.08;
        st.nextSaccadeTime = t + 1.2 + Math.random() * 2.0;
      }
    }

    st.currentEyeX = THREE.MathUtils.damp(st.currentEyeX, st.saccadeTargetX, 20, dt);
    st.currentEyeY = THREE.MathUtils.damp(st.currentEyeY, st.saccadeTargetY, 20, dt);

    const lookRight = Math.max(0, st.currentEyeX);
    const lookLeft = Math.max(0, -st.currentEyeX);
    const lookUp = Math.max(0, st.currentEyeY);
    const lookDown = Math.max(0, -st.currentEyeY);

    setMorphTargetDamped(morphMeshes, 'eyeLookOutLeft', lookLeft, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookInRight', lookLeft, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookInLeft', lookRight, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookOutRight', lookRight, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookUpLeft', lookUp, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookUpRight', lookUp, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookDownLeft', lookDown, 22, dt);
    setMorphTargetDamped(morphMeshes, 'eyeLookDownRight', lookDown, 22, dt);

    // 5. Smooth, Human-Scale Mutually-Exclusive Viseme Lip-Sync
    // glTF morph targets are additive, so we drive ONLY the normalized Oculus visemes
    // (total sum capped <= 0.36) + a subtle jawOpen (<= 0.12) and keep overlapping ARKit
    // mouth targets at 0 so the lips never over-stretch vertically or horizontally.
    const { aa, ee, ih, oh, ou, pp, ff, dd, ss, jawOpen, energy, pitchAccent } = visemes;
    const lipLambda = 15; // Smooth human muscle inertia (~65ms coarticulation)

    const openSuppress = Math.max(0, 1 - pp * 0.9);
    let wAa = Math.min(0.32, aa * openSuppress);
    let wEe = Math.min(0.28, ee * openSuppress);
    let wIh = Math.min(0.24, ih * openSuppress);
    let wOh = Math.min(0.3, oh * openSuppress);
    let wOu = Math.min(0.28, ou * openSuppress);
    const wPp = Math.min(0.38, pp);
    let wFf = Math.min(0.28, ff * openSuppress);
    let wDd = Math.min(0.24, dd * openSuppress);
    let wSs = Math.min(0.24, ss * openSuppress);

    // Enforce strict total sum cap across open mouth visemes so additive morphs never distort the face
    const openSum = wAa + wEe + wIh + wOh + wOu + wFf + wDd + wSs;
    if (openSum > 0.35) {
      const scale = 0.35 / openSum;
      wAa *= scale;
      wEe *= scale;
      wIh *= scale;
      wOh *= scale;
      wOu *= scale;
      wFf *= scale;
      wDd *= scale;
      wSs *= scale;
    }

    setMorphTargetDamped(morphMeshes, 'viseme_aa', wAa, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_E', wEe, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_I', wIh, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_O', wOh, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_U', wOu, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_PP', wPp, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_FF', wFf, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_DD', wDd, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_SS', wSs, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_TH', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_CH', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_kk', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_nn', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_RR', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'viseme_sil', 0, lipLambda, dt);

    // Subtle jawOpen complement (viseme_aa / viseme_O already displace the lower jaw in the GLB)
    const effectiveJaw = Math.min(0.12, jawOpen * openSuppress);
    setMorphTargetDamped(morphMeshes, 'jawOpen', effectiveJaw, lipLambda, dt);

    // Keep overlapping ARKit mouth targets at 0 to prevent double/triple additive lip stretching
    setMorphTargetDamped(morphMeshes, 'mouthOpen', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthLowerDownLeft', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthLowerDownRight', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthUpperUpLeft', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthUpperUpRight', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthFunnel', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthPucker', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthStretchLeft', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthStretchRight', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthClose', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthPressLeft', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'mouthPressRight', 0, lipLambda, dt);
    setMorphTargetDamped(morphMeshes, 'tongueOut', 0, lipLambda, dt);

    // Gentle resting smile when silent; relaxed to 0 during speech so lip corners stay natural
    const idleSmile = (1 - wSpeak * 0.95) * (0.08 + wListen * 0.08);
    setMorphTargetDamped(morphMeshes, 'mouthSmile', idleSmile, 12, dt);
    setMorphTargetDamped(morphMeshes, 'mouthSmileLeft', idleSmile, 12, dt);
    setMorphTargetDamped(morphMeshes, 'mouthSmileRight', idleSmile, 12, dt);
    setMorphTargetDamped(morphMeshes, 'cheekSquintLeft', idleSmile * 0.35, 12, dt);
    setMorphTargetDamped(morphMeshes, 'cheekSquintRight', idleSmile * 0.35, 12, dt);

    // Subtle brow expression tied to speech pitch accent and listening engagement
    const browRaise = Math.min(
      0.32,
      pitchAccent * 0.24 + st.phraseNodImpulse * 0.18 + wListen * 0.14
    );
    setMorphTargetDamped(morphMeshes, 'browInnerUp', browRaise, 12, dt);
    setMorphTargetDamped(morphMeshes, 'browOuterUpLeft', browRaise * 0.7, 12, dt);
    setMorphTargetDamped(morphMeshes, 'browOuterUpRight', browRaise * 0.7, 12, dt);
    setMorphTargetDamped(morphMeshes, 'browDownLeft', wThink * 0.22, 10, dt);
    setMorphTargetDamped(morphMeshes, 'browDownRight', wThink * 0.16, 10, dt);

    // 6. Skeletal Breathing, Head/Neck Nods, and Conversational Posture
    const breathWave = Math.sin(t * 1.85);
    if (bones.spine1) {
      const rest = restRotations.get(bones.spine1);
      if (rest) {
        bones.spine1.rotation.x = THREE.MathUtils.damp(
          bones.spine1.rotation.x,
          rest.x + breathWave * 0.012 + wListen * 0.025,
          6,
          dt
        );
        bones.spine1.rotation.y = THREE.MathUtils.damp(
          bones.spine1.rotation.y,
          rest.y + Math.sin(t * 0.4) * 0.018,
          6,
          dt
        );
      }
    }

    const idleYaw = Math.sin(t * 0.55) * 0.035;
    const idlePitch = Math.sin(t * 0.72) * 0.018;
    const idleRoll = Math.cos(t * 0.48) * 0.02;

    const listenNod = Math.max(0, Math.sin(t * 2.4)) ** 4 * 0.065;
    const speakNod =
      Math.sin(t * 5.8) * energy * 0.055 + pitchAccent * 0.045 + st.phraseNodImpulse * 0.07;
    const speakYaw = Math.sin(t * 1.55) * (0.025 + energy * 0.035);
    const speakRoll = Math.cos(t * 1.25) * (0.02 + energy * 0.03);

    const deltaYaw = idleYaw * (1 - wThink * 0.6) + wThink * 0.1 + speakYaw * wSpeak;
    const deltaPitch =
      idlePitch + (0.02 + listenNod) * wListen - 0.04 * wThink + speakNod * wSpeak;
    const deltaRoll = idleRoll + 0.03 * wListen - 0.035 * wThink + speakRoll * wSpeak;

    if (bones.neck) {
      const rest = restRotations.get(bones.neck);
      if (rest) {
        bones.neck.rotation.x = THREE.MathUtils.damp(
          bones.neck.rotation.x,
          rest.x + deltaPitch * 0.35,
          9,
          dt
        );
        bones.neck.rotation.y = THREE.MathUtils.damp(
          bones.neck.rotation.y,
          rest.y + deltaYaw * 0.35,
          9,
          dt
        );
      }
    }

    if (bones.head) {
      const rest = restRotations.get(bones.head);
      if (rest) {
        bones.head.rotation.x = THREE.MathUtils.damp(
          bones.head.rotation.x,
          rest.x + deltaPitch * 0.65,
          11,
          dt
        );
        bones.head.rotation.y = THREE.MathUtils.damp(
          bones.head.rotation.y,
          rest.y + deltaYaw * 0.65,
          11,
          dt
        );
        bones.head.rotation.z = THREE.MathUtils.damp(
          bones.head.rotation.z,
          rest.z + deltaRoll,
          10,
          dt
        );
      }
    }
  });

  if (!rig) {
    return null;
  }

  return (
    <group ref={rootGroupRef} position={[0, rig.headYOffset, 0]}>
      <primitive object={rig.scene} />
    </group>
  );
};
