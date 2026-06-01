// 内置预设 Skill 定义

export const BUILTIN_SKILLS = [
  {
    id: 'detailed',
    name: '详细查询',
    description: '音标+释义+真实例句+技术百科+近义词+搭配',
    icon: '📚',
    isBuiltin: true,
    systemPrompt: `你是一个专业的英语词典和科技百科助手。请用 JSON 格式返回以下单词的详细信息。

单词: {word}

首先判断该单词是否属于 IT、AI、计算机科学、互联网、软件工程等科技领域词汇或专业术语。

请返回以下字段的 JSON 对象（严格 JSON，不要 markdown 代码块）：
- phonetic: 美式音标（使用 IPA 国际音标）
- definition: 中文释义，包含词性和详细解释
- category: 词条类型，"general"（普通词汇）、"tech"（科技词汇）或 "academic"（学术术语）
- tech_summary: 如果属于科技/IT/AI/专业术语，请基于维基百科风格给出简明的中文技术总结（80-150字），涵盖背景定义、核心概念、实际应用场景和相关技术。如果是普通词汇，此字段返回空字符串 ""。
- examples: JSON 数组，每个元素为 {"en": "英文例句", "zh": "中文翻译", "source": "来源"}。例句必须取材自真实场景（新闻、电影台词、TED演讲等），source 字段标注具体来源名称。例如: {"en": "The algorithm outperformed all benchmarks.", "zh": "该算法在所有基准测试中表现优异。", "source": "MIT Technology Review"}
- synonyms: 3-5 个近义词或相关术语，用逗号分隔的字符串
- collocations: JSON 数组，每个元素为 {"en": "英文搭配短语", "zh": "中文翻译"}。例如: {"en": "cutting-edge technology", "zh": "尖端技术"}`,
    outputFields: [
      { key: 'phonetic', label: '音标' },
      { key: 'definition', label: '释义' },
      { key: 'category', label: '词条类型' },
      { key: 'tech_summary', label: '技术百科' },
      { key: 'examples', label: '例句' },
      { key: 'synonyms', label: '近义词' },
      { key: 'collocations', label: '常见搭配' },
    ],
  },
  {
    id: 'quick',
    name: '快速查询',
    description: '音标+中文释义',
    icon: '⚡',
    isBuiltin: true,
    systemPrompt: `你是一个简洁的英语词典。请用 JSON 格式返回以下单词的核心信息。

单词: {word}

请返回以下字段的 JSON 对象（严格 JSON，不要 markdown 代码块）：
- phonetic: 美式音标
- definition: 简洁的中文释义（含词性）`,
    outputFields: [
      { key: 'phonetic', label: '音标' },
      { key: 'definition', label: '释义' },
    ],
  },
];
