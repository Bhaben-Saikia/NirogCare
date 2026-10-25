# Avatar & 3D Asset Licenses (`LICENSES.md`)

## 1. Photorealistic Human Studio Assets (`/public/avatars/*.mp4`, `*.jpg`, `*.webp`)
- **Files**: `doctor-loop-1080.mp4`, `advisor-loop-1080.mp4`, `specialist-loop-1080.mp4`, `doctor-poster-1080.jpg`, `ravatar-doctor-poster.webp`, `ravatar-doctor-portrait.webp`
- **Source**: First-party NirogCare clinical studio assets included in the repository.
- **License**: Proprietary / Repository MIT License.

## 2. Rigged 3D Human GLB Models (`/public/avatars/avaturn.glb`, `medical_assistant.glb`, `avatarsdk.glb`)
- **Source**: `met4citizen/TalkingHead` (`avatars/avaturn.glb`, `avatars/brunette.glb`, `avatars/avatarsdk.glb`).
- **Blendshapes / Viseme Targets**: 66–72 morph targets including all 15 Oculus Visemes (`viseme_sil`, `viseme_PP`, `viseme_FF`, `viseme_TH`, `viseme_DD`, `viseme_kk`, `viseme_CH`, `viseme_SS`, `viseme_nn`, `viseme_RR`, `viseme_aa`, `viseme_E`, `viseme_I`, `viseme_O`, `viseme_U`) and 52 Apple ARKit facial blendshapes (`jawOpen`, `mouthOpen`, `mouthSmile`, `eyeBlinkLeft`, `eyeBlinkRight`, `browInnerUp`, eye gaze morphs, etc.) plus full humanoid bone hierarchy.
- **License**: **MIT License** (`https://github.com/met4citizen/TalkingHead/blob/main/LICENSE`).

## 3. Runtime 3D & Audio Dependencies
- **`three`** (`^0.169.0`): MIT License
- **`@react-three/fiber`** (`^8.17.10`): MIT License
