// Web Speech API 封装 — 文本朗读

/**
 * 朗读单词（使用浏览器内置 TTS）
 * @param {string} word - 要朗读的单词
 * @param {string} [lang='en-US'] - 发音语言
 * @returns {Promise<void>}
 */
export function speakWord(word, lang = 'en-US') {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    // 取消当前正在播放的语音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.9; // 稍慢一点，适合学习
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`语音合成失败: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}
