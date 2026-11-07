import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createQuestServer } from './app.mjs';
const server = createQuestServer({
  dataFile: resolve(
    fileURLToPath(new URL('../../', import.meta.url)),
    process.env.LEADERBOARD_FILE || 'data/leaderboard.json',
  ),
  publicOrigin: process.env.PUBLIC_ORIGIN || '',
});
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () =>
  console.log(`English Quest: http://${host}:${port}`),
);
