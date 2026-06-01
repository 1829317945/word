# Word

Chrome 扩展，输入英文单词，DeepSeek AI 返回音标、释义、例句及科技百科总结。

[English](README.en.md)

<p align="center">
  <img src="images/screenshot-popup.png" alt="查词弹窗" width="400" />
  <img src="images/screenshot-options.png" alt="Skill 配置" width="400" />
</p>

## 安装

### 第一步：获取代码

**方式 A — 从 GitHub 下载（推荐）**

1. 打开本仓库的 GitHub 页面
2. 点击页面右上角绿色的 **Code** 按钮
3. 选择 **Download ZIP**
4. 下载完成后，将 zip 文件解压到你电脑上的任意文件夹（比如桌面上的 `word` 文件夹）

**方式 B — 使用 Git 克隆**

```bash
git clone https://github.com/1829317945/word.git
```

### 第二步：加载到 Chrome 浏览器

1. 打开 Chrome 浏览器
2. 在地址栏输入 `chrome://extensions`，然后按回车键
3. 你会看到扩展管理页面，找到页面右上角的 **「开发者模式」** 开关，把它打开
   - 如果你用的是 Edge 浏览器，地址是 `edge://extensions`，操作步骤完全相同
4. 打开开发者模式后，页面左上角会出现三个按钮，点击 **「加载已解压的扩展程序」**
5. 系统会弹出一个文件夹选择窗口。找到第一步解压出来的 `word` 文件夹，**单击选中它**（不要双击进入），然后点击右下角的「选择文件夹」
   - 注意：一定要选择包含 `manifest.json` 文件的那个文件夹。如果不小心选了上一层目录，Chrome 会提示找不到清单文件
6. 看到页面中出现 Word 扩展卡片，说明加载成功

> **把图标固定到工具栏**：加载完成后，点击 Chrome 工具栏右侧的拼图块图标 🧩，在弹出的列表中找到 Word，点击旁边的图钉 📌。固定后 Word 图标会一直显示在工具栏上，不用每次去菜单里找。

### 第三步：获取并配置 API Key

Word 使用 DeepSeek 的 AI 模型来查询单词，需要你有一个 DeepSeek 的 API Key。

1. 打开浏览器，访问 [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)
2. 如果你还没有 DeepSeek 账号，先注册（支持手机号或邮箱注册），然后登录
3. 登录后点击页面上的 **「创建 API Key」** 按钮
4. 系统会生成一串以 `sk-` 开头的密钥，点击旁边的复制按钮把它复制下来
5. 回到 Chrome，点击工具栏上的 Word 图标，弹出查词窗口
6. 点击窗口右上角的齿轮图标 ⚙️，进入选项设置页面
7. 在 **API Key** 输入框中粘贴刚才复制的密钥，点击下方的 **「保存」** 按钮
8. 然后点击旁边的 **「测试连接」** 按钮
9. 如果看到绿色的「连接成功」提示，说明配置完成，可以开始使用了

> **关于费用**：DeepSeek Chat API 按 token（词元）数量计费。单次查词消耗的 token 极少，DeepSeek 的定价约为每百万 token 1-2 元人民币，日常使用花费极低，甚至可以忽略不计。

### 常见问题

<details>
<summary><b>加载扩展后浏览器工具栏看不到 Word 图标？</b></summary>
点击工具栏右侧的拼图块图标 🧩，在扩展列表中找到 Word，点击图钉 📌 即可固定到工具栏。如果列表中也看不到，回到 <code>chrome://extensions</code> 页面确认扩展状态为「已启用」。
</details>

<details>
<summary><b>测试连接提示"API Key 无效"？</b></summary>
检查以下几点：① API Key 是否完整复制（以 <code>sk-</code> 开头，包含所有字符）；② DeepSeek 账户是否为新注册，新用户通常有免费额度；③ 如果账号已使用较久，检查账户余额是否耗尽。
</details>

<details>
<summary><b>查词时提示"网络请求失败"？</b></summary>
确认电脑已连接互联网。部分公司或学校网络可能屏蔽了 <code>api.deepseek.com</code> 域名，可以尝试切换到手机热点或其他网络环境。
</details>

<details>
<summary><b>查词时一直转圈加载？</b></summary>
可能是 API 响应较慢（通常 3-10 秒），稍等即可。如果超过 30 秒仍未返回，关闭弹窗重新打开再试一次。
</details>

## 使用

1. 点击 Chrome 工具栏上的 Word 图标，弹窗出现
2. 在下拉菜单中选择 Skill 模板（默认为「详细查询」）
3. 在输入框中输入要查的英文单词，按 **Enter** 键或点击右侧的搜索按钮 🔍
4. 等待 3-10 秒，AI 返回结果后自动展示在窗口中
5. 点击 🔊 按钮可以用浏览器朗读单词发音
6. 窗口底部的「查询历史」记录了最近查过的 20 个单词，点击可以回看结果

## 内置 Skill

| ID | 名称 | 输出内容 |
|----|------|----------|
| `detailed` | 详细查询 | 音标 · 释义 · 词条类别 · 技术百科 · 例句（含真实来源） · 近义词 · 搭配 |
| `quick` | 快速查询 | 音标 · 中文释义 |

### 科技词汇识别

详细查询模式会判断每个单词的类别：

- **普通词汇**（`general`）→ 标准词典释义
- **科技词汇**（`tech`）→ 额外生成 80–150 字的维基百科风格技术总结，涵盖背景、概念和应用场景
- **学术术语**（`academic`）→ 同样附带学术方向的技术总结

所有例句均要求 AI 标注真实来源（如 The New York Times、BBC、TED 演讲等），方便你验证和深入学习。

## 自定义 Skill

选项设置页面（通过弹窗右上角 ⚙️ 进入）支持完整的 Skill 管理：

- **新建 Skill**：点击「+ 新增 Skill」→ 填写 ID、名称、System Prompt → 添加输出字段 → 保存
- **编辑 Skill**：点击自定义 Skill 卡片上的「编辑」→ 修改后保存
- **删除 Skill**：点击「删除」→ 确认

每个 Skill 的核心是 **System Prompt**——它告诉 AI 以什么角色、输出什么内容。使用 `{word}` 作为单词占位符，查询时会被自动替换为实际单词。

## 项目结构

```
├── manifest.json          # Chrome 扩展清单 (MV3)
├── popup/                 # 弹窗界面
├── options/               # 选项页 (API Key + Skill CRUD)
├── lib/
│   ├── deepseek.js        # DeepSeek API 调用
│   ├── storage.js         # chrome.storage.local 读写
│   ├── skills.js          # Skill 合并与校验
│   └── tts.js             # Web Speech API (TTS)
├── skills/presets.js      # 内置 Skill (2 个)
└── icons/                 # 扩展图标 (16/48/128)
```

## 技术栈

- **平台**：Chrome Extension Manifest V3
- **语言**：纯 JavaScript ES Module，无构建工具，零外部依赖
- **API**：DeepSeek Chat API，`deepseek-chat` 模型，temperature 0.3，`response_format: json_object`
- **存储**：`chrome.storage.local`，存储 API Key、自定义 Skill、查询历史（FIFO，上限 20 条）
- **朗读**：Web Speech API（`SpeechSynthesisUtterance`），语速 0.9x

## License

MIT
