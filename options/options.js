// 选项页逻辑 — API Key 配置 + 自定义 Skill CRUD

import { getApiKey, setApiKey, getCustomSkills, addCustomSkill, updateCustomSkill, deleteCustomSkill } from '../lib/storage.js';
import { getAllSkills, validateSkill } from '../lib/skills.js';
import { queryWord } from '../lib/deepseek.js';

// --- DOM 元素 ---
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
const visibilityIcon = document.getElementById('visibilityIcon');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const testKeyBtn = document.getElementById('testKeyBtn');
const apiStatus = document.getElementById('apiStatus');
const addSkillBtn = document.getElementById('addSkillBtn');
const skillList = document.getElementById('skillList');
const skillForm = document.getElementById('skillForm');
const formTitle = document.getElementById('formTitle');
const skillIdEl = document.getElementById('skillId');
const skillNameEl = document.getElementById('skillName');
const skillDescEl = document.getElementById('skillDesc');
const skillIconEl = document.getElementById('skillIcon');
const skillPromptEl = document.getElementById('skillPrompt');
const outputFieldsContainer = document.getElementById('outputFieldsContainer');
const addFieldBtn = document.getElementById('addFieldBtn');
const saveSkillBtn = document.getElementById('saveSkillBtn');
const cancelSkillBtn = document.getElementById('cancelSkillBtn');

// --- 状态 ---
let editingSkillId = null; // null = 新增模式，非 null = 编辑模式
let isPasswordVisible = false;

// --- 初始化 ---
async function init() {
  // 加载 API Key
  const key = await getApiKey();
  apiKeyInput.value = key;

  // 加载 Skill 列表
  await renderSkillList();

  // 事件绑定
  saveKeyBtn.addEventListener('click', saveApiKey);
  testKeyBtn.addEventListener('click', testConnection);
  toggleVisibilityBtn.addEventListener('click', toggleVisibility);
  addSkillBtn.addEventListener('click', openAddForm);
  cancelSkillBtn.addEventListener('click', closeForm);
  saveSkillBtn.addEventListener('click', saveSkill);
  addFieldBtn.addEventListener('click', () => addOutputField());
}

// --- API Key ---
async function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showStatus('请输入 API Key', 'error');
    return;
  }
  try {
    await setApiKey(key);
    showStatus('API Key 已保存', 'success');
  } catch (err) {
    showStatus(`保存失败: ${err.message}`, 'error');
  }
}

async function testConnection() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showStatus('请先输入 API Key', 'error');
    return;
  }

  showStatus('正在测试连接...', 'info');

  try {
    // 使用简单 JSON prompt 测试连通性（DeepSeek 要求 prompt 包含 "json" 字样）
    await queryWord('hello', '请用 JSON 格式返回: {"test": "ok"}', key);
    showStatus('连接成功！API Key 有效', 'success');
  } catch (err) {
    showStatus(`连接失败: ${err.message}`, 'error');
  }
}

function toggleVisibility() {
  isPasswordVisible = !isPasswordVisible;
  apiKeyInput.type = isPasswordVisible ? 'text' : 'password';
  visibilityIcon.textContent = isPasswordVisible ? '🙈' : '👁️';
}

function showStatus(message, type) {
  apiStatus.textContent = message;
  apiStatus.className = `status-text ${type}`;
  apiStatus.classList.remove('hidden');
}

// --- Skill 列表渲染 ---
async function renderSkillList() {
  const skills = await getAllSkills();
  skillList.innerHTML = '';

  if (skills.length === 0) {
    skillList.innerHTML = '<p class="empty-hint">暂无 Skill</p>';
    return;
  }

  skills.forEach((skill) => {
    const card = document.createElement('div');
    card.className = `skill-card${skill.isBuiltin ? ' builtin' : ''}`;
    card.innerHTML = `
      <div class="skill-card-info">
        <span class="skill-card-icon">${skill.icon || '📋'}</span>
        <div>
          <span class="skill-card-name">${escapeHtml(skill.name)}</span>
          ${skill.isBuiltin ? '<span class="skill-card-badge">内置</span>' : ''}
          <div class="skill-card-desc">${escapeHtml(skill.description || '')}</div>
        </div>
      </div>
      <div class="skill-card-actions">
        ${!skill.isBuiltin ? `
          <button class="btn-outline btn-sm edit-skill" data-id="${escapeHtml(skill.id)}">编辑</button>
          <button class="btn-danger delete-skill" data-id="${escapeHtml(skill.id)}">删除</button>
        ` : ''}
      </div>
    `;
    skillList.appendChild(card);
  });

  // 绑定编辑/删除事件
  document.querySelectorAll('.edit-skill').forEach((btn) => {
    btn.addEventListener('click', () => openEditForm(btn.dataset.id));
  });
  document.querySelectorAll('.delete-skill').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id));
  });
}

// --- Skill 表单 ---
async function openAddForm() {
  editingSkillId = null;
  formTitle.textContent = '新增 Skill';
  skillIdEl.value = '';
  skillIdEl.disabled = false;
  skillNameEl.value = '';
  skillDescEl.value = '';
  skillIconEl.value = '';
  skillPromptEl.value = '';

  // 默认添加两个空字段
  outputFieldsContainer.innerHTML = '';
  addOutputField();
  addOutputField();

  skillForm.classList.remove('hidden');
  skillForm.scrollIntoView({ behavior: 'smooth' });
}

async function openEditForm(id) {
  const skills = await getCustomSkills();
  const skill = skills.find((s) => s.id === id);
  if (!skill) return;

  editingSkillId = id;
  formTitle.textContent = '编辑 Skill';
  skillIdEl.value = skill.id;
  skillIdEl.disabled = true; // 编辑时不允许修改 ID
  skillNameEl.value = skill.name;
  skillDescEl.value = skill.description || '';
  skillIconEl.value = skill.icon || '';
  skillPromptEl.value = skill.systemPrompt;

  // 填充输出字段
  outputFieldsContainer.innerHTML = '';
  (skill.outputFields || []).forEach((field) => {
    addOutputField(field.key, field.label);
  });
  if ((skill.outputFields || []).length === 0) {
    addOutputField();
  }

  skillForm.classList.remove('hidden');
  skillForm.scrollIntoView({ behavior: 'smooth' });
}

function closeForm() {
  skillForm.classList.add('hidden');
  editingSkillId = null;
}

// --- 输出字段编辑 ---
function addOutputField(key = '', label = '') {
  const row = document.createElement('div');
  row.className = 'output-field-row';
  row.innerHTML = `
    <input type="text" class="field-key" placeholder="字段 key (如 phonetic)" value="${escapeHtml(key)}" />
    <input type="text" class="field-label" placeholder="显示名称 (如 音标)" value="${escapeHtml(label)}" />
    <button class="btn-remove-field" title="移除">✕</button>
  `;
  row.querySelector('.btn-remove-field').addEventListener('click', () => row.remove());
  outputFieldsContainer.appendChild(row);
}

function getOutputFields() {
  const rows = outputFieldsContainer.querySelectorAll('.output-field-row');
  const fields = [];
  rows.forEach((row) => {
    const key = row.querySelector('.field-key').value.trim();
    const label = row.querySelector('.field-label').value.trim();
    if (key || label) {
      fields.push({ key, label });
    }
  });
  return fields;
}

// --- 保存/删除 Skill ---
async function saveSkill() {
  const skill = {
    id: skillIdEl.value.trim(),
    name: skillNameEl.value.trim(),
    description: skillDescEl.value.trim(),
    icon: skillIconEl.value.trim() || '📋',
    systemPrompt: skillPromptEl.value.trim(),
    outputFields: getOutputFields(),
    isBuiltin: false,
  };

  // 校验
  const { valid, errors } = validateSkill(skill);
  if (!valid) {
    alert(`校验失败:\n${errors.join('\n')}`);
    return;
  }

  try {
    if (editingSkillId) {
      await updateCustomSkill(editingSkillId, skill);
    } else {
      // 检查 ID 是否已存在
      const existing = await getCustomSkills();
      if (existing.some((s) => s.id === skill.id)) {
        alert(`Skill ID "${skill.id}" 已存在，请使用其他 ID`);
        return;
      }
      await addCustomSkill(skill);
    }
    closeForm();
    await renderSkillList();
  } catch (err) {
    alert(`保存失败: ${err.message}`);
  }
}

async function handleDelete(id) {
  if (!confirm(`确定要删除 Skill "${id}" 吗？此操作不可撤销。`)) return;
  try {
    await deleteCustomSkill(id);
    await renderSkillList();
    if (editingSkillId === id) closeForm();
  } catch (err) {
    alert(`删除失败: ${err.message}`);
  }
}

// --- 工具函数 ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// 启动
init();
