import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createQuestServer, validateSubmission } from '../server/index.mjs';
const run = {
  topicId: 'my-new-school',
  gameId: 'quick-quiz',
  mode: 'challenge',
  correctCount: 5,
  wrongCount: 0,
  elapsedSeconds: 30,
  finishedBy: 'completed',
  score: 54,
};

test('validates score formula and rejects invalid, practice and impossible results', () => {
  assert.deepEqual(validateSubmission({ nickname: ' Mây ', run }), {
    nickname: 'Mây',
    key: 'my-new-school:quick-quiz',
    score: 54,
  });
  for (const change of [
    { score: 999 },
    { score: 60 },
    { mode: 'practice' },
    { topicId: 'invalid' },
    { gameId: '__proto__' },
    { correctCount: 6 },
    { elapsedSeconds: -1 },
    { wrongCount: 1 },
    { elapsedSeconds: 90 },
    { finishedBy: 'timeout' },
  ])
    assert.throws(() =>
      validateSubmission({ nickname: 'Mây', run: { ...run, ...change } }),
    );
  assert.equal(
    validateSubmission({
      nickname: 'Lan',
      run: { ...run, elapsedSeconds: 90, score: 50 },
    }).score,
    50,
  );
  for (const nickname of ['', ' ', 'x'.repeat(41), 'A\nB'])
    assert.throws(() => validateSubmission({ nickname, run }));
  assert.equal(
    validateSubmission({
      nickname: 'Lan',
      run: { ...run, gameId: 'word-match', wrongCount: 2, score: 44 },
    }).score,
    44,
  );
  assert.equal(
    validateSubmission({
      nickname: 'Lan',
      run: {
        ...run,
        correctCount: 2,
        elapsedSeconds: 90,
        finishedBy: 'timeout',
        score: 20,
      },
    }).score,
    20,
  );
});

test('two visitors share persistent best scores, filters, ties and private deletion', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'bleq-rank-'));
  const dataFile = join(dir, 'scores.json');
  const distDir = join(dir, 'dist');
  mkdirSync(distDir);
  writeFileSync(
    join(distDir, 'index.html'),
    '<!doctype html><title>Quest</title>',
  );
  const publicOrigin = 'https://english.example';
  let server;
  async function start() {
    server = createQuestServer({ dataFile, distDir, publicOrigin });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    return `http://127.0.0.1:${server.address().port}`;
  }
  let base = await start();
  t.after(async () => {
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  });
  const send = (method = 'GET', body, cookie, query = '') =>
    fetch(`${base}/api/leaderboard${query}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Origin: publicOrigin,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  assert.equal((await (await send()).json()).total, 0);
  const first = await send('POST', { nickname: 'Mây', run });
  assert.equal(first.status, 200);
  const alice = first.headers.get('set-cookie').split(';')[0];
  assert.match(first.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  assert.match(first.headers.get('set-cookie'), /Secure/);
  const second = await send('POST', { nickname: 'Lan', run });
  const bob = second.headers.get('set-cookie').split(';')[0];
  let board = await (await send('GET', undefined, alice)).json();
  assert.equal(board.total, 2);
  assert.deepEqual(
    board.entries.map((row) => row.rank),
    [1, 1],
  );
  assert.equal(board.own.nickname, 'Mây');
  assert.equal(board.own.score, 54);
  assert.equal(JSON.stringify(board).includes(alice.split('=')[1]), false);
  await send(
    'POST',
    {
      nickname: 'Mây',
      run: { ...run, correctCount: 3, wrongCount: 2, score: 34 },
    },
    alice,
  );
  await send('POST', { nickname: 'Mây', run }, alice);
  board = await (await send('GET', undefined, alice)).json();
  assert.equal(board.own.score, 54);
  await send(
    'POST',
    { nickname: 'Mây mới', run: { ...run, topicId: 'my-house' } },
    alice,
  );
  board = await (await send('GET', undefined, alice)).json();
  assert.equal(board.own.score, 108);
  assert.equal(board.own.played, 2);
  assert.equal(board.own.nickname, 'Mây mới');
  board = await (
    await send('GET', undefined, alice, '?topic=my-house&game=quick-quiz')
  ).json();
  assert.equal(board.total, 1);
  assert.equal(board.own.score, 54);
  assert.equal((await send('GET', undefined, alice, '?topic=bad')).status, 400);
  assert.equal(
    (
      await send(
        'POST',
        { nickname: 'Bad', run: { ...run, score: 999 } },
        alice,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await fetch(`${base}/api/leaderboard`, {
        method: 'DELETE',
        headers: {
          Origin: 'https://other.example',
          'Content-Type': 'application/json',
          Cookie: alice,
        },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(`${base}/api/leaderboard`, {
        method: 'POST',
        headers: { Origin: publicOrigin, 'Content-Type': 'text/plain' },
        body: '{}',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(`${base}/api/leaderboard`, {
        method: 'POST',
        headers: { Origin: publicOrigin, 'Content-Type': 'application/json' },
        body: '{',
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await fetch(`${base}/api/leaderboard`, {
        method: 'POST',
        headers: { Origin: publicOrigin, 'Content-Type': 'application/json' },
        body: 'x'.repeat(5000),
      })
    ).status,
    413,
  );
  assert.equal((await fetch(`${base}/api/missing`)).status, 404);
  assert.equal((await fetch(`${base}/leaderboard`)).status, 200);
  assert.equal((await fetch(`${base}/server/index.mjs`)).status, 404);
  await new Promise((resolve) => server.close(resolve));
  base = await start();
  board = await (await send('GET', undefined, alice)).json();
  assert.equal(board.own.score, 108);
  await send('DELETE', undefined, 'bleq_player=invalid');
  assert.equal((await (await send()).json()).total, 2);
  assert.equal((await send('DELETE', undefined, alice)).status, 200);
  board = await (await send('GET', undefined, bob)).json();
  assert.equal(board.total, 1);
  assert.equal(board.own.nickname, 'Lan');
  assert.equal(
    (await (await send('GET', undefined, alice)).json()).hasPublished,
    false,
  );
  assert.equal(
    Object.keys(JSON.parse(readFileSync(dataFile)).players).length,
    1,
  );
});

test('does not overwrite corrupt storage on startup', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bleq-corrupt-'));
  try {
    const dataFile = join(dir, 'scores.json');
    writeFileSync(dataFile, '{broken');
    assert.throws(() => createQuestServer({ dataFile }));
    assert.equal(readFileSync(dataFile, 'utf8'), '{broken');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
