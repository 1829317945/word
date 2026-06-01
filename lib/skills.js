// Skill 模板管理

import { BUILTIN_SKILLS } from '../skills/presets.js';
import { getCustomSkills } from './storage.js';

/**
 * 获取所有 Skills（内置 + 自定义）
 * @returns {Promise<Array>}
 */
export async function getAllSkills() {
  const customSkills = await getCustomSkills();
  return [...BUILTIN_SKILLS, ...customSkills];
}

/**
 * 按 ID 查找 Skill
 * @param {string} id
 * @returns {Promise<Object|undefined>}
 */
export async function getSkillById(id) {
  const skills = await getAllSkills();
  return skills.find((s) => s.id === id);
}

/**
 * 校验自定义 Skill 字段完整性
 * @param {Object} skill
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSkill(skill) {
  const errors = [];

  if (!skill.id || typeof skill.id !== 'string') {
    errors.push('Skill ID 不能为空');
  }
  if (!skill.name || typeof skill.name !== 'string') {
    errors.push('Skill 名称不能为空');
  }
  if (!skill.systemPrompt || typeof skill.systemPrompt !== 'string') {
    errors.push('System Prompt 不能为空');
  }
  if (!skill.outputFields || !Array.isArray(skill.outputFields) || skill.outputFields.length === 0) {
    errors.push('至少需要一个输出字段');
  } else {
    skill.outputFields.forEach((field, index) => {
      if (!field.key || !field.label) {
        errors.push(`输出字段 ${index + 1} 缺少 key 或 label`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
