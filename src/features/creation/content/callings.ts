// TOR-DATA-GAP: full calling data per PRD §7 (calling skills, shadow paths).
// v0 stub: minimal viable shape so the wizard can flow.

import type { Calling } from '../../../domain/types';

export type CallingData = {
  shadow_path: string;
  calling_skills: [string, string, string];
};

export const CALLINGS_DATA: Record<Calling, CallingData> = {
  CAPTAIN: {
    shadow_path: 'Lure of Power',
    calling_skills: ['Battle', 'Enhearten', 'Persuade'],
  },
  CHAMPION: {
    shadow_path: 'Curse of Vainglory',
    calling_skills: ['Athletics', 'Awe', 'Hunting'],
  },
  MESSENGER: {
    shadow_path: 'Path of Despair',
    calling_skills: ['Athletics', 'Travel', 'Scan'],
  },
  SCHOLAR: {
    shadow_path: 'Path of Doubt',
    calling_skills: ['Insight', 'Lore', 'Riddle'],
  },
  TREASURE_HUNTER: {
    shadow_path: 'Dragon-Sickness',
    calling_skills: ['Explore', 'Scan', 'Stealth'],
  },
  WARDEN: {
    shadow_path: 'Wandering-Madness',
    calling_skills: ['Awareness', 'Hunting', 'Travel'],
  },
};
