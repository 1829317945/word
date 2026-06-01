// 弹窗交互逻辑

import { queryWord } from '../lib/deepseek.js';
import { getApiKey, getHistory, addHistory } from '../lib/storage.js';
import { getAllSkills } from '../lib/skills.js';
import { speakWord } from '../lib/tts.js';

// --- DOM 元素 ---
const skillSelect = document.getElementById('skillSelect');
const wordInput = document.getElementById('wordInput');
const searchBtn = document.getElementById('searchBtn');
const settingsBtn = document.getElementById('settingsBtn');
const loadingArea = document.getElementById('loadingArea');
const errorArea = document.getElementById('errorArea');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const resultArea = document.getElementById('resultArea');
const resultWord = document.getElementById('resultWord');
const speakBtn = document.getElementById('speakBtn');
const resultFields = document.getElementById('resultFields');
const historyToggle = document.getElementById('historyToggle');
const historyArrow = document.getElementById('historyArrow');
const historyList = document.getElementById('historyList');

// --- 状态 ---
let currentSkills = [];
let selectedSkill = null;
let lastWord = '';
let lastResult = null;
let isSpeaking = false;

// --- 初始化 ---
async function init() {
  await loadSkills();
  await loadHistory();
  updateSearchButton();

  // 事件绑定
  skillSelect.addEventListener('change', onSkillChange);
  wordInput.addEventListener('input', updateSearchButton);
  wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  searchBtn.addEventListener('click', doSearch);
  settingsBtn.addEventListener('click', openOptions);
  speakBtn.addEventListener('click', onSpeak);
  retryBtn.addEventListener('click', doSearch);
  historyToggle.addEventListener('click', toggleHistory);
}

// --- Skill 加载 ---
async function loadSkills() {
  try {
    currentSkills = await getAllSkills();
  } catch {
    currentSkills = [];
  }

  skillSelect.innerHTML = '';
  if (currentSkills.length === 0) {
    skillSelect.innerHTML = '<option value="">无可用 Skill</option>';
    return;
  }

  currentSkills.forEach((skill) => {
    const option = document.createElement('option');
    option.value = skill.id;
    option.textContent = `${skill.icon || ''} ${skill.name}`;
    skillSelect.appendChild(option);
  });

  // 默认选中第一个
  skillSelect.value = currentSkills[0].id;
  selectedSkill = currentSkills[0];
}

function onSkillChange() {
  const id = skillSelect.value;
  selectedSkill = currentSkills.find((s) => s.id === id) || null;
}

// --- 搜索按钮状态 ---
function updateSearchButton() {
  searchBtn.disabled = !wordInput.value.trim();
}

// --- 查询 ---
async function doSearch() {
  const word = wordInput.value.trim();
  if (!word) return;

  const apiKey = await getApiKey();
  if (!apiKey) {
    showError('请先在选项页中配置 DeepSeek API Key', false);
    return;
  }

  if (!selectedSkill) {
    showError('请先选择一个 Skill', false);
    return;
  }

  // 显示加载状态
  hideAll();
  loadingArea.classList.remove('hidden');
  searchBtn.disabled = true;

  try {
    const result = await queryWord(word, selectedSkill.systemPrompt, apiKey);
    lastWord = word;
    lastResult = result;
    showResult(word, result);
    // 保存到历史
    await addHistory(word, result);
    await loadHistory();
  } catch (err) {
    showError(err.message, err.type === 'NETWORK_ERROR' || err.type === 'API_ERROR');
  } finally {
    searchBtn.disabled = false;
    updateSearchButton();
  }
}

// --- 结果渲染 ---
function showResult(word, data) {
  hideAll();

  resultWord.textContent = word;
  resultFields.innerHTML = '';

  const fields = selectedSkill.outputFields;
  fields.forEach((field) => {
    const value = data[field.key];
    if (value === undefined || value === null || value === '') return;

    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'result-field';

    const label = document.createElement('div');
    label.className = 'field-label';
    label.textContent = field.label;

    const valueDiv = document.createElement('div');
    valueDiv.className = 'field-value';

    // 根据字段类型特殊渲染
    if (Array.isArray(value)) {
      // 数组 -> 每个元素一行
      valueDiv.innerHTML = value
        .map((item) => {
          if (typeof item === 'object') {
            // [{en: "...", zh: "..."}] 格式
            return `<div style="margin-bottom:4px;">${escapeHtml(item.en || item.english || '')}<br><span style="color:#888;font-style:normal;">${escapeHtml(item.zh || item.chinese || '')}</span></div>`;
          }
          return `<div style="margin-bottom:4px;">${escapeHtml(String(item))}</div>`;
        })
        .join('');
      if (field.key === 'examples' || field.key === 'exam_examples') {
        valueDiv.classList.add('examples');
      }
    } else if (typeof value === 'object') {
      // 对象 -> JSON 格式化
      valueDiv.textContent = JSON.stringify(value, null, 2);
    } else {
      // 字符串 -> 保留换行
      valueDiv.innerHTML = escapeHtml(String(value)).replace(/\n/g, '<br>');
    }

    fieldDiv.appendChild(label);
    fieldDiv.appendChild(valueDiv);
    resultFields.appendChild(fieldDiv);
  });

  resultArea.classList.remove('hidden');
}

// --- 错误显示 ---
function showError(message, retryable) {
  hideAll();
  errorMessage.textContent = message;
  errorArea.classList.remove('hidden');
  if (retryable) {
    retryBtn.classList.remove('hidden');
  } else {
    retryBtn.classList.add('hidden');
  }
}

// --- 隐藏所有面板 ---
function hideAll() {
  loadingArea.classList.add('hidden');
  errorArea.classList.add('hidden');
  resultArea.classList.add('hidden');
}

// --- TTS 朗读 ---
async function onSpeak() {
  if (isSpeaking) return;

  const word = lastWord;
  if (!word) return;

  isSpeaking = true;
  speakBtn.classList.add('playing');

  try {
    await speakWord(word);
  } catch {
    // TTS 失败静默处理
  } finally {
    isSpeaking = false;
    speakBtn.classList.remove('playing');
  }
}

// --- 历史 ---
async function loadHistory() {
  try {
    const history = await getHistory();
    renderHistory(history);
  } catch {
    renderHistory([]);
  }
}

function renderHistory(history) {
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<p class="history-empty">暂无查询记录</p>';
    return;
  }

  history.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <span class="history-word">${escapeHtml(item.word)}</span>
      <span class="history-time">${formatTime(item.timestamp)}</span>
    `;
    div.addEventListener('click', () => {
      wordInput.value = item.word;
      lastWord = item.word;
      lastResult = item.result;
      showResult(item.word, item.result);
    });
    historyList.appendChild(div);
  });
}

function toggleHistory() {
  const collapsed = historyList.classList.toggle('collapsed');
  if (collapsed) {
    historyArrow.classList.remove('open');
  } else {
    historyArrow.classList.add('open');
  }
}

// --- 工具函数 ---
function openOptions() {
  chrome.runtime.openOptionsPage();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 启动
init();
