# OpenClaw Skill Management

通过 HTTP API 管理 OpenClaw 技能的插件，支持技能的增删查改和远程同步。

## 安装

```bash
openclaw plugins install /path/to/openclaw-skill-management
```

## 接口列表

所有接口均以 `/skill` 为前缀，默认端口为 `18789`。

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/skill` | 列出所有技能 |
| `POST` | `/skill` | 创建新技能 |
| `GET` | `/skill/:name` | 获取指定技能 |
| `PUT` | `/skill/:name` | 更新指定技能 |
| `DELETE` | `/skill/:name` | 删除指定技能 |
| `POST` | `/skill/sync` | 从远程同步技能 |

---

## 接口详情

### 1. 列出所有技能

```bash
GET /skill
```

**响应示例：**

```json
{
  "list": [
    {
      "name": "my-skill",
      "description": "这是一个示例技能",
      "content": "# My Skill\n\n技能内容...",
      "createdAt": "2026-03-30T10:00:00.000Z",
      "updatedAt": "2026-03-30T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 2. 创建技能

```bash
POST /skill
Content-Type: application/json

{
  "name": "my-skill",
  "content": "# My Skill\n\n这是技能内容"
}
```

**响应示例：**

```json
{
  "name": "my-skill",
  "description": "这是技能内容",
  "content": "# My Skill\n\n这是技能内容",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:00:00.000Z"
}
```

---

### 3. 获取指定技能

```bash
GET /skill/:name
```

**响应示例：**

```json
{
  "name": "my-skill",
  "description": "这是一个示例技能",
  "content": "# My Skill\n\n技能内容...",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T10:00:00.000Z"
}
```

---

### 4. 更新技能

```bash
PUT /skill/:name
Content-Type: application/json

{
  "content": "# Updated Skill\n\n更新后的内容"
}
```

**响应示例：**

```json
{
  "name": "my-skill",
  "description": "更新后的内容",
  "content": "# Updated Skill\n\n更新后的内容",
  "createdAt": "2026-03-30T10:00:00.000Z",
  "updatedAt": "2026-03-30T12:00:00.000Z"
}
```

---

### 5. 删除技能

```bash
DELETE /skill/:name
```

**响应示例：**

```json
{
  "success": true,
  "name": "my-skill"
}
```

---

### 6. 同步远程技能

```bash
POST /skill/sync
Content-Type: application/json

{
  "url": "https://example.com/skills.json",
  "outdir": "~/.agents/skills"
}
```

**请求参数：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `url` | string | 是 | 远程技能 JSON 的 URL |
| `outdir` | string | 是 | 技能保存目录，支持 `~` 展开为用户主目录 |

**远程 JSON 格式要求：**

```json
[
  {
    "name": "skill-name",
    "content": "# Skill Content\n\nSkill description...",
    "source": "remote"
  }
]
```

- `source` 为 `builtin` 的技能会被过滤掉
- 每个技能会保存为 `{outdir}/{skill-name}/SKILL.md`

**响应示例：**

```json
{
  "success": true,
  "synced": 10,
  "filtered": 2,
  "errors": []
}
```

---

## 技能存储位置

默认技能存储在：`~/.agents/skills`

每个技能的目录结构：

```
~/.agents/skills/
├── my-skill/
│   └── SKILL.md
└── another-skill/
    └── SKILL.md
```

---

## 使用示例

### 使用 curl

```bash
# 列出所有技能
curl http://localhost:18789/skill

# 创建技能
curl -X POST http://localhost:18789/skill \
  -H "Content-Type: application/json" \
  -d '{"name": "hello-world", "content": "# Hello World\n\nA simple skill"}'

# 获取技能
curl http://localhost:18789/skill/hello-world

# 更新技能
curl -X PUT http://localhost:18789/skill/hello-world \
  -H "Content-Type: application/json" \
  -d '{"content": "# Updated Hello World\n\nUpdated content"}'

# 删除技能
curl -X DELETE http://localhost:18789/skill/hello-world

# 同步远程技能
curl -X POST http://localhost:18789/skill/sync \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/skills.json", "outdir": "~/.agents/skills"}'
```

---

## 错误响应

所有接口在出错时返回统一的错误格式：

```json
{
  "error": "错误信息描述"
}
```

常见错误码：
- `400` - 请求参数错误
- `Skill xxx already exists` - 技能已存在
- `Skill xxx not found` - 技能不存在

---

## 配置说明

### 技能描述提取

系统会自动从 SKILL.md 中提取描述，提取规则：
1. 首先查找 `description:` 字段
2. 如果没有，则使用第一行非标题内容

### 文件过滤

- 跳过以 `.` 开头的目录
- 只读取包含 `SKILL.md` 文件的目录
