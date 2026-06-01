// Chrome 存储封装 — chrome.storage.local 的 Promise 化读写

const STORAGE_KEYS = {
  API_KEY: 'apiKey',
  CUSTOM_SKILLS: 'customSkills',
  HISTORY: 'history',
};

// --- API Key ---

export async function getApiKey() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.API_KEY);
  return result[STORAGE_KEYS.API_KEY] || '';
}

export async function setApiKey(key) {
  await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: key });
}

// --- Custom Skills ---

export async function getCustomSkills() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_SKILLS);
  return result[STORAGE_KEYS.CUSTOM_SKILLS] || [];
}

export async function addCustomSkill(skill) {
  const skills = await getCustomSkills();
  skills.push(skill);
  await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_SKILLS]: skills });
}

export async function updateCustomSkill(id, updated) {
  const skills = await getCustomSkills();
  const index = skills.findIndex((s) => s.id === id);
  if (index === -1) throw new Error(`Skill "${id}" not found`);
  skills[index] = { ...skills[index], ...updated };
  await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_SKILLS]: skills });
}

export async function deleteCustomSkill(id) {
  const skills = await getCustomSkills();
  const filtered = skills.filter((s) => s.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_SKILLS]: filtered });
}

// --- Query History ---

const MAX_HISTORY = 20;

export async function getHistory() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  return result[STORAGE_KEYS.HISTORY] || [];
}

export async function addHistory(word, result) {
  const history = await getHistory();
  // 移除已存在的同单词记录
  const filtered = history.filter((h) => h.word !== word);
  // 插入到最前面
  filtered.unshift({ word, result, timestamp: Date.now() });
  // FIFO 上限 20 条
  if (filtered.length > MAX_HISTORY) {
    filtered.pop();
  }
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: filtered });
}
