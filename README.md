# Word

Chrome 扩展，输入英文单词，DeepSeek AI 返回音标、释义、例句及科技百科总结。

<p align="center">
  <img src="images/screenshot-popup.png" alt="查词弹窗" width="400" />
  <img src="images/screenshot-options.png" alt="Skill 配置" width="400" />
</p>

## 安装

Chrome → `chrome://extensions` → 开发者模式 → 加载已解压的扩展程序 → 选择项目目录。

## 使用

1. 点击扩展图标，弹出查词窗口
2. 选择 Skill 模板（下拉切换，默认「详细查询」）
3. 输入单词，回车
4. 点 🔊 朗读发音

首次使用需要在选项页（⚙️）配置 [DeepSeek API Key](https://platform.deepseek.com/api_keys)。

## 内置 Skill

| ID | 名称 | 输出 |
|----|------|------|
| `detailed` | 详细查询 | 音标 + 释义 + 词条类别 + 技术百科 + 例句（含来源） + 近义词 + 搭配 |
| `quick` | 快速查询 | 音标 + 中文释义 |

**详细模式**会判定单词类型：普通词汇返回标准词典释义；IT/AI/计算机等科技词汇额外输出 80-150 字的维基百科风格技术总结。例句强制标注真实来源（The New York Times、BBC、TED 等）。

选项页支持新建、编辑、删除自定义 Skill。每个 Skill 由 system prompt 模板 + 输出字段定义组成，`{word}` 为单词占位符。

## 项目结构

```
├── manifest.json          # Chrome MV3 清单
├── popup/                 # 弹窗 (HTML/JS/CSS)
├── options/               # 选项页 (API Key + Skill CRUD)
├── lib/
│   ├── deepseek.js        # DeepSeek API 客户端
│   ├── storage.js         # chrome.storage.local 封装
│   ├── skills.js          # Skill 合并 & 校验
│   └── tts.js             # Web Speech API (TTS)
├── skills/presets.js      # 2 个内置 Skill
└── icons/                 # 扩展图标 (16/48/128)
```

## 技术栈

- Chrome Extension Manifest V3，ES Module，零构建工具
- `deepseek-chat` 模型，`response_format: json_object`，temperature 0.3
- `chrome.storage.local` 持久化 API Key、自定义 Skill、查询历史（FIFO 上限 20 条）
- Web Speech API (`SpeechSynthesisUtterance`)，语速 0.9x

## License

MIT
