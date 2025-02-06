import fsPromises from 'fs/promises';
import yaml from 'js-yaml';

export function getRandomItem<T>(list: T[]): T | undefined {
  if (list.length === 0) return undefined;
  return list[Math.floor(Math.random() * list.length)];
}
