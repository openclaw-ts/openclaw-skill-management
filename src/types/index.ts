export interface Skill {
  name: string;
  content: string;
  source?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  filtered: number;
  errors: string[];
}

export interface SkillInfo {
  name: string;
  description: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillListResult {
  list: SkillInfo[];
  total: number;
}
