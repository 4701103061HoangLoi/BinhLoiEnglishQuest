import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { rules, integer } from './validation.mjs';
export function createStore(dataFile) {
  const file = resolve(dataFile);
  let players = {};
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (
      data.version !== 1 ||
      !data.players ||
      Array.isArray(data.players) ||
      typeof data.players !== 'object'
    )
      throw new Error('Invalid leaderboard file');
    for (const [id, player] of Object.entries(data.players)) {
      if (
        !/^[a-f0-9]{64}$/.test(id) ||
        !player ||
        typeof player.nickname !== 'string' ||
        !player.nickname.trim() ||
        player.nickname.length > 40 ||
        !player.scores ||
        typeof player.scores !== 'object' ||
        Array.isArray(player.scores) ||
        Object.entries(player.scores).some(([key, score]) => {
          const [topic, game, extra] = key.split(':');
          return (
            extra !== undefined ||
            !rules.topics.includes(topic) ||
            !Object.hasOwn(rules.games, game) ||
            !integer(score, 60)
          );
        })
      )
        throw new Error('Invalid leaderboard record');
    }
    players = data.players;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error; // Preserve a damaged file for recovery.
  }
  const persist = (next) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      `${file}.tmp`,
      JSON.stringify({ version: 1, players: next }),
      { mode: 0o600, flush: true },
    );
    renameSync(`${file}.tmp`, file);
    players = next;
  };
  return {
    get players() {
      return players;
    },
    persist,
  };
}
