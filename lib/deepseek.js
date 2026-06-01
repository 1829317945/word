// DeepSeek Chat API 封装

const API_BASE = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';
const TEMPERATURE = 0.3;

/**
 * 调用 DeepSeek API 查询单词
 * @param {string} word - 要查询的单词
 * @param {string} systemPrompt - Skill 的 system prompt 模板
 * @param {string} apiKey - DeepSeek API Key
 * @returns {Promise<Object>} 解析后的 JSON 结果
 */
export async function queryWord(word, systemPrompt, apiKey) {
  if (!apiKey) {
    throw createError('API Key 未配置，请在选项页中设置', 'NO_API_KEY');
  }

  if (!word || !word.trim()) {
    throw createError('请输入要查询的单词', 'EMPTY_WORD');
  }

  // 将 {word} 占位符替换为实际单词
  const systemMessage = systemPrompt.replace(/\{word\}/g, word);

  let response;
  try {
    response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: TEMPERATURE,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `请查询单词: ${word}` },
        ],
      }),
    });
  } catch (err) {
    throw createError(`网络请求失败: ${err.message}`, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    let errorMsg = `API 请求失败 (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody.error?.message) {
        errorMsg = errorBody.error.message;
      }
    } catch {
      // 无法解析错误响应体，使用默认错误信息
    }

    if (response.status === 401) {
      throw createError('API Key 无效，请检查选项页中的设置', 'INVALID_API_KEY');
    }
    if (response.status === 429) {
      throw createError('请求过于频繁，请稍后再试', 'RATE_LIMITED');
    }
    throw createError(errorMsg, 'API_ERROR', response.status);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw createError('无法解析 API 响应', 'PARSE_ERROR');
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw createError('API 返回内容为空', 'EMPTY_RESPONSE');
  }

  // 解析 JSON 内容
  try {
    // 清理可能的 markdown 代码块标记
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    return JSON.parse(jsonStr.trim());
  } catch {
    throw createError('API 返回的 JSON 格式有误', 'JSON_PARSE_ERROR');
  }
}

/**
 * 创建带类型的错误对象
 */
function createError(message, type, statusCode) {
  const error = new Error(message);
  error.type = type;
  if (statusCode) error.statusCode = statusCode;
  return error;
}
