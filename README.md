# Maples — The Sunken Court

A polished Three.js browser action-RPG vertical slice built from procedural geometry, runtime-generated effects, and WebAudio synthesis. There are no external game-art or audio asset dependencies.

## Run

```bash
npm install
npm run dev
```

For a production bundle:

```bash
npm run build
npm run preview
```

## Included vertical slice

- Emberhaven village at dusk with the Great Maple, Warden Bram, lore stones, caches, ambient leaves/fireflies/birds, and authored paths.
- Maplewild wilderness, river, Old Crossing bridge, Watchers' Rise, waterfall, Northreach Pines, Gloam Hollow, and the Sunken Court.
- Procedural hero rig with visible weapon, armor, shield, and amulet changes.
- Light combo, chargeable heavy attack, dodge i-frames, Bramble Shockwave, and level-3 Emberleaf Nova.
- Sprigling, Thornshell, Wispling, and Mossfang enemy families with distinct combat behavior, plus elite variants.
- Multi-phase Elderheart Colossus boss with slam, sweep, root hazards, nova pressure, telegraphs, stagger, phase change, and repeat challenge shrine.
- Loot rarity tiers, rarity beams, inventory/equipment, stat comparison, enhancement with Amber Shards, coins, potions, XP and levels.
- Desktop and mobile controls, third-person orbit/follow camera, obstruction pull-in, damage numbers, hit pause, camera trauma/shake, particles and shockwaves.
- Procedural synthesized SFX and adaptive exploration/combat/boss music via WebAudio.
- Persistent save/continue support via `window.persistentStorage` with `localStorage` fallback.
- Adaptive pixel ratio and mobile density reductions for browser performance.

## Controls

Desktop: WASD move, Shift sprint, mouse drag camera, J or click light attack, K hold/release heavy attack, Space dodge, Q/E abilities, R tonic, F interact, I/B inventory, Esc pause.

Mobile: left virtual stick, drag open world area to rotate camera, right-side attack/ability/dodge controls, contextual interact button, bag button.
