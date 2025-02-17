import { DevLevel } from './types';

/**
 * Takes in a list of items and returns a random item from the list.
 * @param {T[]} list - The `list` with items.
 * @returns A random item from `list` or `undefined` if the list is empty.
 */
export function getRandomItem<T>(list: T[]): T | undefined {
  if (list.length === 0) return undefined;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Generates random choices from a given set of MCQ options.
 * @param options - The options at `MCQ['options']`.
 * @returns An object with the option keys and boolean values indicating if the option is selected.
 */
export function getRandomChoicesFromOptions(options: { [key: string]: string }): { [key: string]: boolean } {
  let choices;
  do {
    choices = Object.keys(options).reduce((o, k) => ({ ...o, [k]: Math.random() < 0.5 }), {});
  } while (Object.values(choices).every((v) => !v));
  return choices;
}

/**
 * Converts DevLevel to integer for database storage.
 * @param {DevLevel} devLevel - The development level.
 * @returns The mapping is as follows:
 * - 'none' → `null`
 * - 'remedial' → 1
 * - 'early-developing' → 2
 * - 'developing' → 3
 * - 'entrustable' → 4
 */
export function getDevLevelInt(devLevel: DevLevel): number | null {
  switch (devLevel) {
    case 'remedial':
      return 1;
    case 'early-developing':
      return 2;
    case 'developing':
      return 3;
    case 'entrustable':
      return 4;
    default:
      return null;
  }
}
