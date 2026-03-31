import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SyncResult, SkillInfo, SkillListResult, Skill } from '../types';

export class SkillService {
  async syncSkills(url: string, outdir: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      filtered: 0,
      errors: [],
    };
    const filterSource = 'builtin';
    const resolvedOutdir = outdir.replace(/^~/, os.homedir());

    let skills: Skill[];
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch skills: ${response.status} ${response.statusText}`,
        );
      }
      skills = (await response.json()) as Skill[];
    } catch (error) {
      throw new Error(
        `Failed to fetch or parse skills: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    if (!Array.isArray(skills)) {
      throw new Error('Skills response must be an array');
    }

    if (!fs.existsSync(resolvedOutdir)) {
      fs.mkdirSync(resolvedOutdir, { recursive: true });
    }

    for (const skill of skills) {
      if (filterSource && skill.source === filterSource) {
        result.filtered++;
        continue;
      }

      if (!skill.name || !skill.content) {
        result.errors.push(
          `Skill missing name or content: ${skill.name || 'unknown'}`,
        );
        continue;
      }

      const skillDir = path.join(resolvedOutdir, skill.name);
      const skillFile = path.join(skillDir, 'SKILL.md');

      try {
        if (!fs.existsSync(skillDir)) {
          fs.mkdirSync(skillDir, { recursive: true });
        }
        fs.writeFileSync(skillFile, skill.content, 'utf-8');
        result.synced++;
      } catch (error) {
        result.errors.push(
          `Failed to write skill ${skill.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
  }

  private getSkillsDir(): string {
    return path.join(os.homedir(), '.agents', 'skills');
  }

  listSkills(): SkillListResult {
    const skillsDir = this.getSkillsDir();
    if (!fs.existsSync(skillsDir)) {
      return { list: [], total: 0 };
    }

    const dirs = fs.readdirSync(skillsDir, { withFileTypes: true });
    const list: SkillInfo[] = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      if (dir.name.startsWith('.')) continue;

      const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      try {
        const content = fs.readFileSync(skillFile, 'utf-8');
        const description = this.extractDescription(content);
        const stats = fs.statSync(skillFile);

        list.push({
          name: dir.name,
          description,
          content,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
        });
      } catch {
        continue;
      }
    }

    return { list, total: list.length };
  }

  getSkill(name: string): SkillInfo {
    const skillsDir = this.getSkillsDir();
    const skillFile = path.join(skillsDir, name, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      throw new Error(`Skill ${name} not found`);
    }

    const content = fs.readFileSync(skillFile, 'utf-8');
    const description = this.extractDescription(content);
    const stats = fs.statSync(skillFile);

    return {
      name,
      description,
      content,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    };
  }

  createSkill(name: string, content: string): SkillInfo {
    const skillsDir = this.getSkillsDir();
    const skillDir = path.join(skillsDir, name);
    const skillFile = path.join(skillDir, 'SKILL.md');

    if (fs.existsSync(skillFile)) {
      throw new Error(`Skill ${name} already exists`);
    }

    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(skillFile, content, 'utf-8');

    const stats = fs.statSync(skillFile);
    return {
      name,
      description: this.extractDescription(content),
      content,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    };
  }

  updateSkill(name: string, content: string): SkillInfo {
    const skillsDir = this.getSkillsDir();
    const skillFile = path.join(skillsDir, name, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      throw new Error(`Skill ${name} not found`);
    }

    fs.writeFileSync(skillFile, content, 'utf-8');
    const stats = fs.statSync(skillFile);

    return {
      name,
      description: this.extractDescription(content),
      content,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    };
  }

  deleteSkill(name: string): void {
    const skillsDir = this.getSkillsDir();
    const skillDir = path.join(skillsDir, name);

    if (!fs.existsSync(skillDir)) {
      throw new Error(`Skill ${name} not found`);
    }

    fs.rmSync(skillDir, { recursive: true, force: true });
  }

  upsertSkill(name: string, content: string): SkillInfo {
    const skillsDir = this.getSkillsDir();
    const skillDir = path.join(skillsDir, name);
    const skillFile = path.join(skillDir, 'SKILL.md');

    const isExisting = fs.existsSync(skillFile);

    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    fs.writeFileSync(skillFile, content, 'utf-8');

    const stats = fs.statSync(skillFile);
    return {
      name,
      description: this.extractDescription(content),
      content,
      createdAt: isExisting ? stats.birthtime : stats.mtime,
      updatedAt: stats.mtime,
    };
  }

  private extractDescription(content: string): string {
    const match = content.match(/description:\s*(.+)/);
    if (match) {
      return match[1].trim();
    }
    const firstLine = content
      .split('\n')
      .find((line) => line.trim() && !line.startsWith('#'));
    return firstLine?.trim() || '';
  }
}
