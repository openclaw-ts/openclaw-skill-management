import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { SkillService } from './services/skill.service';

const skillService = new SkillService();

function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function respondJson(res: any, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default definePluginEntry({
  id: 'openclaw-skill-management',
  name: 'Openclaw Skill Management',
  description: 'HTTP-based skill CRUD operations - list, get, create, update, delete, and sync skills',
  register(api) {
    api.registerHttpRoute({
      path: '/skill',
      auth: 'plugin',
      match: 'prefix',
      handler: async (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const pathParts = url.pathname.split('/').filter(Boolean);

        if (pathParts[0] !== 'skill') {
          return false;
        }

        try {
          if (req.method === 'GET' && pathParts.length === 1) {
            const result = skillService.listSkills();
            respondJson(res, 200, result);
            return true;
          }

          if (req.method === 'POST' && pathParts.length === 1) {
            const body = await parseJsonBody(req);
            const result = skillService.createSkill(body.name, body.content);
            respondJson(res, 201, result);
            return true;
          }

          if (req.method === 'GET' && pathParts.length === 2) {
            const name = pathParts[1];
            const result = skillService.getSkill(name);
            respondJson(res, 200, result);
            return true;
          }

          if (req.method === 'PUT' && pathParts.length === 2) {
            const name = pathParts[1];
            const body = await parseJsonBody(req);
            if (!body.content) {
              const result = skillService.getSkill(name);
              respondJson(res, 200, result);
              return true;
            }
            const result = skillService.updateSkill(name, body.content);
            respondJson(res, 200, result);
            return true;
          }

          if (req.method === 'DELETE' && pathParts.length === 2) {
            const name = pathParts[1];
            skillService.deleteSkill(name);
            respondJson(res, 200, { success: true, name });
            return true;
          }

          if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'sync') {
            const body = await parseJsonBody(req);
            const result = await skillService.syncSkills(body.url, body.outdir);
            respondJson(res, 200, result);
            return true;
          }

          return false;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          respondJson(res, 400, { error: message });
          return true;
        }
      },
    });
  },
});
