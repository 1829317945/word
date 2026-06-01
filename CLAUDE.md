# Word — Chrome 单词查询插件

## 项目概述

一个 Chrome 浏览器扩展，点击插件图标弹出输入框，输入单词后调用 DeepSeek 模型返回音标、释义、例句等内容。通过 **Skill 系统** 切换/自定义查询模板，满足不同场景的查词需求（详细查询、快速释义、考试备考等）。

## 技术栈

- **平台**: Chrome Extension Manifest V3
- **语言**: 纯 JavaScript (ES Module)，无构建工具，零依赖
- **UI**: 原生 HTML + CSS，弹窗宽度 400px，高度自适应 (max 500px)
- **API**: DeepSeek Chat API (`deepseek-chat` 模型，`response_format: json_object`)
- **存储**: `chrome.storage.local`（API Key、自定义 Skill、查询历史）
- **读音**: Web Speech API (`SpeechSynthesisUtterance`，浏览器原生 TTS)

## 目录结构

```
word/
├── manifest.json                # Chrome 扩展清单 (MV3)
├── popup/
│   ├── popup.html               # 弹窗页面
│   ├── popup.js                 # 弹窗交互逻辑
│   └── popup.css                # 弹窗样式
├── options/
│   ├── options.html             # 选项页 (API Key + Skill 管理)
│   ├── options.js               # 选项页逻辑
│   └── options.css              # 选项页样式
├── lib/
│   ├── deepseek.js              # DeepSeek API 封装
│   ├── skills.js                # Skill 模板管理
│   ├── storage.js               # chrome.storage 读写封装
│   └── tts.js                   # Web Speech API 封装
├── skills/
│   └── presets.js               # 内置预设 Skill
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 核心架构

### 数据流

```
点击图标 → popup.html 弹出
  → 选择 Skill（下拉切换）
  → 输入单词 → 点击查询 (或 Enter)
  → popup.js 组装 prompt（word + skill.systemPrompt）
  → deepseek.js → fetch POST https://api.deepseek.com/v1/chat/completions
  → 解析 JSON 响应 → 按 outputFields 顺序渲染
  → 点击 🔊 → tts.js → Web Speech API 朗读单词
```

### Skill 系统

Skill 是控制查询深度和输出内容的 Prompt 模板。每个 Skill 对象结构：

```js
{
  id: 'detailed',            // 唯一标识
  name: '详细查询',           // 显示名称
  description: '音标+释义+例句+词源',
  icon: '📚',
  systemPrompt: `...`,       // 发给 DeepSeek 的 system message，要求 JSON 输出
  outputFields: [            // 期望输出字段，确定渲染顺序和标题
    { key: 'phonetic', label: '音标' },
    { key: 'definition', label: '释义' },
    { key: 'examples', label: '例句' },
    { key: 'etymology', label: '词源' },
  ],
  isBuiltin: true,           // true = 内置不可删，false = 用户自定义
}
```

**内置预设 (3个)**：

| id | 名称 | 输出内容 |
|----|------|----------|
| `detailed` | 详细查询 | 音标 + 释义 + 例句 + 同义词 + 搭配 + 词源 |
| `quick` | 快速查询 | 音标 + 中文释义 |
| `exam` | 考试模式 | 音标 + 释义 + 近义词辨析 + 真题风格例句 |

**自定义 Skill**：用户在选项页新增/编辑/删除，存储键名 `customSkills`。

### 弹窗 UI 布局

```
┌──────────────────────────┐
│  🔤 单词查询    [⚙️]     │  标题栏 + 齿轮图标跳转选项页
├──────────────────────────┤
│  Skill: [详细查询 ▼]     │  Skill 下拉选择器
├──────────────────────────┤
│  [________________] [🔍] │  输入框 + 搜索按钮
├──────────────────────────┤
│  📖 查询结果             │
│  /ˈsɜr.ənˈdɪp.ə.t̬i/ 🔊  │  音标 + TTS 发音按钮
│  n. 意外发现珍奇事物的   │  释义
│  本领；机缘巧合           │
│                          │
│  "It was pure serendipity│  例句
│  that we met."           │
│  ...                     │
├──────────────────────────┤
│  [查询历史 ▼]            │  最近 20 条，可折叠
└──────────────────────────┘
```

### 状态处理

- **Loading**: 查询中显示骨架屏或旋转动画，禁用按钮防重复提交
- **Empty**: 首次打开无历史，显示 placeholder 引导输入
- **Error**: API Key 未配置 → 提示去选项页设置；网络错误 → 显示重试按钮；API 返回错误 → 显示具体错误信息
- **Edge cases**: 输入为空时禁用搜索按钮；查询历史上限 20 条 FIFO

## 关键模块

### `lib/deepseek.js`
- `queryWord(word, systemPrompt, apiKey)` → 返回解析后的 JSON 对象
- 调用 `POST https://api.deepseek.com/v1/chat/completions`
- 参数: `model: 'deepseek-chat'`, `temperature: 0.3`, `response_format: { type: 'json_object' }`
- 错误处理: 网络异常、4xx/5xx、JSON 解析失败，统一抛出带类型的 Error

### `lib/storage.js`
- `getApiKey()` / `setApiKey(key)` — API Key 读写
- `getCustomSkills()` / `addCustomSkill(skill)` / `updateCustomSkill(id, skill)` / `deleteCustomSkill(id)` — 自定义 Skill CRUD
- `getHistory()` / `addHistory(word, result)` — 查询历史 FIFO 队列 (max 20)

### `lib/skills.js`
- `getAllSkills()` — 合并内置 skills + 自定义 skills
- `getSkillById(id)` — 按 ID 查找
- `validateSkill(skill)` — 校验自定义 skill 字段完整性

### `lib/tts.js`
- `speakWord(word, lang)` — 封装 `SpeechSynthesisUtterance`，默认 `lang='en-US'`

### `skills/presets.js`
- 导出 `BUILTIN_SKILLS` 数组，包含 detailed/quick/exam 三个预设

## 实现步骤

1. **项目骨架** — 目录结构、`manifest.json`（permissions: `storage`，host_permissions: `https://api.deepseek.com/*`，action.default_popup，options_page）
2. **基础库** — `storage.js`、`skills.js`、`presets.js`、`tts.js`
3. **DeepSeek 客户端** — `deepseek.js`（API 调用 + 错误处理 + JSON 解析）
4. **弹窗 UI** — `popup.html/css/js`（输入、查询、渲染结果、TTS、历史）
5. **选项页** — `options.html/css/js`（API Key 配置 + 测试连接 + Skill 管理 CRUD）
6. **图标** — 生成 16/48/128 尺寸图标
7. **测试** — 加载扩展到 Chrome，配置 API Key，覆盖正常/异常流程

## 验证方式

1. `chrome://extensions` → 开发者模式 → 加载已解压的扩展
2. 点击图标 → 弹窗正常弹出，UI 完整
3. 选项页 → 配置 DeepSeek API Key → 点击「测试连接」→ 返回成功
4. 弹窗中选择「详细查询」→ 输入 "serendipity" → 返回结构化结果（音标、释义、例句等）
5. 点击 🔊 → 浏览器朗读单词
6. 切换到「快速查询」→ 同一单词返回更简洁结果
7. 选项页 → 新增自定义 Skill → 弹窗下拉中出现新 Skill 并可正常使用
8. 查询历史 → 自动记录，点击历史项可回看结果
