export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic';
export type ItemType = 'weapon' | 'armor' | 'shield' | 'amulet' | 'consumable' | 'material';
export interface ItemStats { atk?: number; def?: number; crit?: number; speed?: number; hp?: number; }
export interface ItemLook { color?: number; accent?: number; scale?: number; style?: string; }
export interface ItemDef {
  id: string; name: string; type: ItemType; rarity: Rarity; description: string; stats?: ItemStats; look?: ItemLook; value: number;
}

export const PALETTE = {
  skyTop: 0x1f2b4a, skyHorizon: 0xd98d68, fog: 0xc88767,
  grass: 0x5c8749, grassWarm: 0x8f9b49, dirt: 0x8a6948, stone: 0x77736c,
  amber: 0xffb347, teal: 0x65e1cf, violet: 0xae78ff,
};

export const RARITIES: Record<Rarity, { name: string; color: string; hex: number; multiplier: number }> = {
  common: { name: 'Common', color: '#a9b2bf', hex: 0xa9b2bf, multiplier: 1 },
  uncommon: { name: 'Uncommon', color: '#58c477', hex: 0x58c477, multiplier: 1.2 },
  rare: { name: 'Rare', color: '#59a7ff', hex: 0x59a7ff, multiplier: 1.55 },
  epic: { name: 'Epic', color: '#c77dff', hex: 0xc77dff, multiplier: 2.15 },
};

export const ITEMS: Record<string, ItemDef> = {
  rusty_blade: { id: 'rusty_blade', name: 'Wayfarer Blade', type: 'weapon', rarity: 'common', value: 14, description: 'A balanced iron sword from Emberhaven.', stats: { atk: 2 }, look: { color: 0xbec5c9, accent: 0x75543b } },
  oakbrand: { id: 'oakbrand', name: 'Oakbrand', type: 'weapon', rarity: 'uncommon', value: 36, description: 'Warm sap-light runs beneath its carved guard.', stats: { atk: 4, speed: .03 }, look: { color: 0xd6e0c7, accent: 0x9ac46a, scale: 1.04 } },
  emberedge: { id: 'emberedge', name: 'Emberedge', type: 'weapon', rarity: 'rare', value: 86, description: 'A dusk-forged blade that remembers wildfire.', stats: { atk: 7, crit: .04 }, look: { color: 0xffab66, accent: 0xff6f45, scale: 1.08 } },
  moonfang: { id: 'moonfang', name: 'Moonfang', type: 'weapon', rarity: 'rare', value: 92, description: 'A cool blue blade recovered from Watchers’ Rise.', stats: { atk: 8, speed: .05 }, look: { color: 0x8ed8ff, accent: 0x5069ff, scale: 1.1 } },
  heartcleaver: { id: 'heartcleaver', name: 'Heartcleaver', type: 'weapon', rarity: 'epic', value: 220, description: 'Elderheart amber sings through its oversized edge.', stats: { atk: 12, crit: .06 }, look: { color: 0xffd16a, accent: 0xff7b36, scale: 1.22 } },

  traveler_mail: { id: 'traveler_mail', name: 'Traveler Mail', type: 'armor', rarity: 'common', value: 16, description: 'Layered leather and travel-worn plates.', stats: { def: 2 }, look: { color: 0x547b63, accent: 0xc9a76a } },
  sentinel_mail: { id: 'sentinel_mail', name: 'Sentinel Mail', type: 'armor', rarity: 'uncommon', value: 44, description: 'The old bridge watch once wore this green steel.', stats: { def: 4 }, look: { color: 0x456b61, accent: 0xe0b65d } },
  warden_mail: { id: 'warden_mail', name: 'Warden Plate', type: 'armor', rarity: 'rare', value: 96, description: 'Ceremonial field plate, practical beneath the gold.', stats: { def: 7, speed: .02 }, look: { color: 0x304f5a, accent: 0xffcc76 } },
  elderbark_mail: { id: 'elderbark_mail', name: 'Elderbark Mantle', type: 'armor', rarity: 'epic', value: 240, description: 'Living bark plates answer to the wearer’s heartbeat.', stats: { def: 10, hp: 14 }, look: { color: 0x5b6739, accent: 0xffbd4d } },

  timber_shield: { id: 'timber_shield', name: 'Timber Shield', type: 'shield', rarity: 'common', value: 12, description: 'Thick maple boards bound in iron.', stats: { def: 1 }, look: { color: 0x7c5535, accent: 0x9da7aa } },
  thorn_guard: { id: 'thorn_guard', name: 'Thorn Guard', type: 'shield', rarity: 'uncommon', value: 40, description: 'A hooked shield that punishes careless attackers.', stats: { def: 3 }, look: { color: 0x4d6948, accent: 0xbaa669, style: 'kite' } },
  dawn_aegis: { id: 'dawn_aegis', name: 'Dawn Aegis', type: 'shield', rarity: 'rare', value: 90, description: 'Warm light traces the rim at the edge of danger.', stats: { def: 5, crit: .02 }, look: { color: 0x4d6078, accent: 0xffc166, style: 'round' } },

  maple_charm: { id: 'maple_charm', name: 'Maple Charm', type: 'amulet', rarity: 'common', value: 18, description: 'A small carved leaf, polished smooth by years.', stats: { crit: .02 }, look: { color: 0xdc8b3a } },
  wisp_charm: { id: 'wisp_charm', name: 'Wisplight Charm', type: 'amulet', rarity: 'uncommon', value: 48, description: 'Cold motes orbit its glass center.', stats: { speed: .05 }, look: { color: 0x65e1cf } },
  storm_charm: { id: 'storm_charm', name: 'Stormglass Sigil', type: 'amulet', rarity: 'rare', value: 104, description: 'Crackling light gathers before every decisive strike.', stats: { crit: .06 }, look: { color: 0x8db4ff } },
  elderheart_charm: { id: 'elderheart_charm', name: 'Elderheart Sigil', type: 'amulet', rarity: 'epic', value: 250, description: 'A fragment of the guardian’s restored will.', stats: { crit: .08, atk: 3 }, look: { color: 0xffb347 } },

  potion: { id: 'potion', name: 'Hearth Tonic', type: 'consumable', rarity: 'common', value: 25, description: 'Restores 45 health.', look: { color: 0xe45858 } },
  amber_shard: { id: 'amber_shard', name: 'Amber Shard', type: 'material', rarity: 'uncommon', value: 12, description: 'Warm crystal used to enhance equipment.', look: { color: 0xffb347 } },
  elderheart_amber: { id: 'elderheart_amber', name: 'Elderheart Amber', type: 'material', rarity: 'epic', value: 0, description: 'A living ember from the heart of the Sunken Court.', look: { color: 0xffd36a } },
};

export interface EnemyDef {
  id: string; name: string; hp: number; damage: number; speed: number; radius: number; range: number; detect: number; xp: number; poise: number; color: number;
}
export const ENEMIES: Record<string, EnemyDef> = {
  sprigling: { id: 'sprigling', name: 'Sprigling', hp: 28, damage: 7, speed: 4.3, radius: .55, range: 1.4, detect: 13, xp: 14, poise: 26, color: 0x7ca84d },
  thornshell: { id: 'thornshell', name: 'Thornshell', hp: 72, damage: 12, speed: 2.15, radius: .85, range: 1.7, detect: 12, xp: 30, poise: 70, color: 0x567245 },
  wispling: { id: 'wispling', name: 'Wispling', hp: 36, damage: 10, speed: 3.1, radius: .48, range: 8, detect: 15, xp: 26, poise: 30, color: 0x66d9df },
  mossfang: { id: 'mossfang', name: 'Mossfang', hp: 46, damage: 11, speed: 5.25, radius: .65, range: 1.55, detect: 16, xp: 32, poise: 42, color: 0x476b4e },
};

export const ABILITIES = {
  shockwave: { id: 'shockwave', name: 'Bramble Shockwave', key: 'Q', cooldown: 8, description: 'Leap and slam, staggering enemies in a wide ring.' },
  nova: { id: 'nova', name: 'Emberleaf Nova', key: 'E', cooldown: 20, description: 'Level 3: release a burning storm around Rowan.' },
  dodge: { id: 'dodge', name: 'Dodge', key: 'Space', cooldown: .8, description: 'Invulnerable during the center of the roll.' },
};

export const OBJECTIVES = [
  'Speak with Warden Bram beneath the Great Maple.',
  'Clear the three corrupted camps in the Maplewild.',
  'Cross the Old Bridge and reach the Sunken Court.',
  'Defeat the Elderheart Colossus.',
  'The haven breathes easier. Explore, hunt, and grow strong.',
];
