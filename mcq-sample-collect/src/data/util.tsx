export function getRandomItem<T>(list: T[]): T | undefined {
  if (list.length === 0) return undefined;
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomChoicesFromOptions(options: { [key: string]: string }): { [key: string]: boolean } {
  let choices;
  do {
    choices = Object.keys(options).reduce((o, k) => ({ ...o, [k]: Math.random() < 0.5 }), {});
  } while (Object.values(choices).every((v) => !v));
  return choices;
}
