// 内置预设 Skill 定义

export const BUILTIN_SKILLS = [
  {
    id: 'detailed',
    name: '详细查询',
    description: '音标+释义+例句+同义词+搭配+词源',
    icon: '📚',
    isBuiltin: true,
    systemPrompt: `你是一个专业的英语词典。请用 JSON 格式返回以下单词的详细信息。

单词: {word}

请返回以下字段的 JSON 对象:
- phonetic: 音标（美式音标，使用 KK 音标或 IPA）
- definition: 中文释义，包含词性和详细解释
- examples: 2-3 个英文例句，附带中文翻译
- synonyms: 3-5 个近义词，用逗号分隔
- collocations: 2-3 个常见搭配，附带中文翻译
- etymology: 简短的中文词源说明

返回格式必须是严格的 JSON，不要包含 markdown 代码块标记。`,
    outputFields: [
      { key: 'phonetic', label: '音标' },
      { key: 'definition', label: '释义' },
      { key: 'examples', label: '例句' },
      { key: 'synonyms', label: '近义词' },
      { key: 'collocations', label: '常见搭配' },
      { key: 'etymology', label: '词源' },
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

请返回以下字段的 JSON 对象:
- phonetic: 美式音标
- definition: 简洁的中文释义（含词性）

返回格式必须是严格的 JSON，不要包含 markdown 代码块标记。`,
    outputFields: [
      { key: 'phonetic', label: '音标' },
      { key: 'definition', label: '释义' },
    ],
  },
  {
    id: 'exam',
    name: '考试模式',
    description: '音标+释义+近义词辨析+真题风格例句',
    icon: '📝',
    isBuiltin: true,
    systemPrompt: `你是一个英语考试辅导专家。请用 JSON 格式返回以下单词的备考信息。

单词: {word}

请返回以下字段的 JSON 对象:
- phonetic: 美式音标（IPA 格式）
- definition: 中文释义，包含词性和准确解释
- synonyms_analysis: 2-3 组近义词辨析，说明区别和用法
- exam_examples: 2-3 个真题风格的例句（类似 TOEFL/IELTS/GRE 难度），附带中文翻译

返回格式必须是严格的 JSON，不要包含 markdown 代码块标记。`,
    outputFields: [
      { key: 'phonetic', label: '音标' },
      { key: 'definition', label: '释义' },
      { key: 'synonyms_analysis', label: '近义词辨析' },
      { key: 'exam_examples', label: '真题例句' },
    ],
  },
];
