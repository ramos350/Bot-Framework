import fs from 'fs';
import path from 'path';

// @ts-ignore
globalThis.AVAILABLE_CONDITIONS = [];
export function loadConditions(): Record<string, any> {
  const conditions: Record<string, any> = {};
  const conditionsDirectory = path.join(__dirname, '../conditions');

  const files = fs.readdirSync(conditionsDirectory);

  files.forEach((file) => {
    if (file.endsWith('.ts')) {
      const conditionName = file.replace('.ts', '');
      const conditionModule = require(path.join(conditionsDirectory, file)).default;
      conditions[conditionName] = conditionModule;

      // @ts-ignore
      globalThis.AVAILABLE_CONDITIONS.push(conditionName);
    }
  });

  return conditions;
}
