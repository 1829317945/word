# 🔤 Word — Chrome 单词查询插件

一个简洁优雅的 Chrome 浏览器扩展，调用 DeepSeek AI 模型返回英语单词的音标、释义、例句等内容。通过 **Skill 模板系统** 灵活切换查询模式，满足从快速查词到深度学习的多种场景。

## ✨ 功能特性

- **🤖 AI 驱动** — 基于 DeepSeek Chat API，返回结构化、高质量的单词释义
- **🎨 Skill 模板系统** — 内置详细/快速两种模式 + 无限自定义模板
- **🔊 发音朗读** — 使用浏览器原生 Web Speech API，一键朗读单词
- **📋 查询历史** — 自动保存最近 20 条查询，支持离线回看
- **🔬 科技百科** — 自动识别 IT/AI/科技词汇，提供维基百科风格技术总结
- **⚡ 轻量无依赖** — 纯 JavaScript (ES Module)，零构建工具，零第三方依赖

## 📸 效果展示

<p align="center">
  <img src="images/screenshot-popup.png" alt="弹窗查询" width="400" />
  <img src="images/screenshot-options.png" alt="选项设置" width="400" />
</p>

## 🚀 快速开始

### 前置条件

- Chrome / Edge 浏览器（支持 Manifest V3）
- [DeepSeek API Key](https://platform.deepseek.com/api_keys)

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/1829317945/word.git
cd word
```

2. **加载扩展到 Chrome**

- 打开 `chrome://extensions`
- 开启右上角「开发者模式」
- 点击「加载已解压的扩展程序」
- 选择 `word` 目录

3. **配置 API Key**

- 点击扩展图标弹出窗口
- 点击右上角 ⚙️ 齿轮图标进入选项页
- 输入 DeepSeek API Key → 点击「保存」
- 点击「测试连接」确认 API Key 有效

4. **开始查词**

- 点击工具栏扩展图标
- 选择 Skill 模板（默认：详细查询）
- 输入英文单词 → 按 Enter 或点击 🔍
- 点击 🔊 朗读发音

## 🎨 Skill 模板

### 内置预设

| Skill | 图标 | 说明 | 输出内容 |
|-------|------|------|----------|
| `detailed` | 📚 | 详细查询 | 音标 + 释义 + 科技百科 + 真实例句（含来源） + 近义词 + 搭配 |
| `quick` | ⚡ | 快速查询 | 音标 + 中文释义 |

### 科技词汇增强

详细模式会自动识别单词类型：
- **普通词汇** → 标准词典释义
- **科技词汇**（IT/AI/CS 等）→ 额外输出维基百科风格技术总结
- **例句真实来源** → 标注出处（The New York Times、BBC、TED 等）

### 自定义 Skill

在选项页可以创建无限自定义 Skill，每个 Skill 包含：

- **System Prompt** — 定义 AI 的角色和输出格式，使用 `{word}` 作为单词占位符
- **输出字段** — 指定期望的 JSON 字段名和中文显示标题
- **图标 + 描述** — 在弹窗下拉菜单中清晰辨识

## 🏗️ 项目结构

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
│   └── presets.js               # 内置预设 Skill (2个)
├── images/
│   ├── screenshot-popup.png     # 弹窗截图
│   └── screenshot-options.png   # 选项页截图
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🔧 技术栈

- **平台**: Chrome Extension Manifest V3
- **语言**: 纯 JavaScript (ES Module)，无构建工具
- **UI**: 原生 HTML + CSS
- **API**: [DeepSeek Chat API](https://api.deepseek.com/v1/chat/completions) (`deepseek-chat` 模型)
- **存储**: `chrome.storage.local`
- **TTS**: Web Speech API (`SpeechSynthesisUtterance`)

## 📊 数据流

```
用户输入单词 → 选择 Skill
  → popup.js 组装 Prompt (word + skill.systemPrompt)
  → deepseek.js → POST https://api.deepseek.com/v1/chat/completions
  → 解析 JSON 响应 → 按 outputFields 顺序渲染
  → 点击 🔊 → tts.js → Web Speech API 朗读
  → 自动保存到 chrome.storage.local (FIFO, max 20)
```

## 📄 License

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
