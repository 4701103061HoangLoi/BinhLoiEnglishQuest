import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rules = JSON.parse(
  readFileSync(new URL('./rules.json', import.meta.url)),
);
const cookieName = 'bleq_player';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const integer = (value, max) =>
  Number.isInteger(value) && value >= 0 && value <= max;
const fail = (status, message) => Object.assign(new Error(message), { status });

export function validateSubmission(value) {
  if (!value || typeof value !== 'object')
    throw fail(400, 'Dữ liệu không hợp lệ.');
  const { nickname, run } = value;
  if (
    typeof nickname !== 'string' ||
    !nickname.trim() ||
    nickname.trim().length > 40 ||
    /[\p{Cc}\p{Cf}]/u.test(nickname)
  )
    throw fail(
      400,
      'Biệt danh cần từ 1 đến 40 ký tự, không chứa ký tự điều khiển.',
    );
  if (
    !run ||
    typeof run !== 'object' ||
    typeof run.gameId !== 'string' ||
    !rules.topics.includes(run.topicId) ||
    !Object.hasOwn(rules.games, run.gameId) ||
    run.mode !== 'challenge' ||
    !['completed', 'timeout'].includes(run.finishedBy) ||
    !integer(run.correctCount, 5) ||
    !integer(run.wrongCount, 100000) ||
    !integer(run.elapsedSeconds, 86400) ||
    !integer(run.score, 60)
  )
    throw fail(400, 'Chỉ đăng kết quả thử thách hợp lệ.');
  const duration = rules.games[run.gameId];
  if (
    (run.finishedBy === 'timeout' && run.elapsedSeconds < duration) ||
    (run.gameId !== 'word-match' && run.correctCount + run.wrongCount > 5) ||
    (run.finishedBy === 'completed' &&
      (run.gameId === 'word-match'
        ? run.correctCount !== 5
        : run.correctCount + run.wrongCount !== 5))
  )
    throw fail(400, 'Kết quả và thời gian không khớp.');
  const base = Math.max(
    0,
    run.correctCount * 10 -
      (run.gameId === 'word-match' ? run.wrongCount * 5 : 0),
  );
  const bonus =
    run.finishedBy === 'completed'
      ? Math.min(
          10,
          Math.floor(Math.max(0, duration - run.elapsedSeconds) / 15),
        )
      : 0;
  if (run.score !== base + bonus) throw fail(400, 'Điểm không khớp kết quả.');
  return {
    nickname: nickname.trim(),
    key: `${run.topicId}:${run.gameId}`,
    score: run.score,
  };
}

export function createQuestServer({
  dataFile,
  distDir = 'dist',
  publicOrigin = '',
}) {
  const file = resolve(dataFile);
  const root = resolve(distDir);
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
  const rates = new Map();
  const json = (res, status, data) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify(data));
  };
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        if (url.pathname !== '/api/leaderboard')
          throw fail(404, 'Không tìm thấy API.');
        const token = req.headers.cookie
          ?.split(';')
          .map((part) => part.trim())
          .find((part) => part.startsWith(`${cookieName}=`))
          ?.slice(cookieName.length + 1);
        const id = token && /^[a-f0-9]{48}$/.test(token) ? hash(token) : '';
        if (req.method === 'GET') {
          const topic = url.searchParams.get('topic') || 'all';
          const game = url.searchParams.get('game') || 'all';
          if (
            (topic !== 'all' && !rules.topics.includes(topic)) ||
            (game !== 'all' && !Object.hasOwn(rules.games, game))
          )
            throw fail(400, 'Bộ lọc không hợp lệ.');
          const rows = Object.entries(players)
            .flatMap(([key, player]) => {
              const scores = Object.entries(player.scores).filter(
                ([category]) => {
                  const [t, g] = category.split(':');
                  return (
                    (topic === 'all' || topic === t) &&
                    (game === 'all' || game === g)
                  );
                },
              );
              return scores.length
                ? [
                    {
                      nickname: player.nickname,
                      score: scores.reduce(
                        (total, [, score]) => total + score,
                        0,
                      ),
                      played: scores.length,
                      mine: key === id,
                    },
                  ]
                : [];
            })
            .sort(
              (a, b) =>
                b.score - a.score || a.nickname.localeCompare(b.nickname, 'vi'),
            );
          let rank = 0;
          const ranked = rows.map((row, i) => {
            if (!i || row.score !== rows[i - 1].score) rank = i + 1;
            return { ...row, rank };
          });
          return json(res, 200, {
            entries: ranked.slice(0, 50),
            own: ranked.find((row) => row.mine) ?? null,
            total: ranked.length,
            hasPublished: Boolean(players[id]),
          });
        }
        if (!['POST', 'DELETE'].includes(req.method))
          throw fail(405, 'Phương thức không hỗ trợ.');
        const origin = publicOrigin || `http://${req.headers.host}`;
        if (
          req.headers.origin !== origin ||
          req.headers['content-type']?.split(';')[0] !== 'application/json'
        )
          throw fail(403, 'Yêu cầu phải gửi từ website này.');
        const rateKey = players[id] ? id : req.socket.remoteAddress;
        const now = Date.now();
        const rate = rates.get(rateKey);
        if (rate && now - rate.start < 60000 && rate.count >= 120)
          throw fail(429, 'Bạn thao tác hơi nhanh. Hãy thử lại sau một phút.');
        if (!rate || now - rate.start >= 60000) {
          if (rates.size >= 10000) rates.delete(rates.keys().next().value);
          rates.set(rateKey, { start: now, count: 1 });
        } else rate.count++;
        if (req.method === 'DELETE') {
          if (players[id]) {
            const next = { ...players };
            delete next[id];
            persist(next);
          }
          res.setHeader(
            'Set-Cookie',
            `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${origin.startsWith('https:') ? '; Secure' : ''}`,
          );
          return json(res, 200, { ok: true });
        }
        let body = '';
        let oversized = false;
        req.setEncoding('utf8');
        for await (const chunk of req) {
          if (!oversized) body += chunk;
          if (Buffer.byteLength(body) > 4096) {
            oversized = true;
            body = '';
          }
        }
        if (oversized) throw fail(413, 'Dữ liệu quá lớn.');
        let value;
        try {
          value = JSON.parse(body);
        } catch {
          throw fail(400, 'Dữ liệu JSON không hợp lệ.');
        }
        const submission = validateSubmission(value);
        if (!players[id] && Object.keys(players).length >= 5000)
          throw fail(503, 'Bảng xếp hạng đã đầy. Vui lòng báo giáo viên.');
        const nextToken = players[id] ? token : randomBytes(24).toString('hex');
        const nextId = hash(nextToken);
        const previous = players[nextId];
        persist({
          ...players,
          [nextId]: {
            nickname: submission.nickname,
            scores: {
              ...previous?.scores,
              [submission.key]: Math.max(
                previous?.scores[submission.key] ?? 0,
                submission.score,
              ),
            },
          },
        });
        res.setHeader(
          'Set-Cookie',
          `${cookieName}=${nextToken}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=31536000${origin.startsWith('https:') ? '; Secure' : ''}`,
        );
        return json(res, 200, { ok: true });
      }
      if (!['GET', 'HEAD'].includes(req.method))
        throw fail(405, 'Phương thức không hỗ trợ.');
      const pathname = decodeURIComponent(url.pathname);
      let target = resolve(root, `.${pathname}`);
      if (!target.startsWith(root + sep) && target !== root)
        throw fail(404, 'Không tìm thấy trang.');
      if (!extname(pathname)) target = resolve(root, 'index.html');
      let body;
      try {
        body = readFileSync(target);
      } catch {
        throw fail(404, 'Không tìm thấy trang.');
      }
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.json': 'application/json',
        '.png': 'image/png',
        '.ico': 'image/x-icon',
      };
      res.writeHead(200, {
        'Content-Type': types[extname(target)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      if (!error.status)
        console.error('Leaderboard request failed:', error.message);
      if (!res.headersSent)
        json(res, error.status || 500, {
          error: error.status
            ? error.message
            : 'Chưa lưu được điểm. Hãy thử lại sau.',
        });
      else res.end();
    }
  });
  server.requestTimeout = 15000;
  return server;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const server = createQuestServer({
    dataFile: process.env.LEADERBOARD_FILE || 'data/leaderboard.json',
    publicOrigin: process.env.PUBLIC_ORIGIN || '',
  });
  server.listen(
    Number(process.env.PORT || 3001),
    process.env.HOST || '127.0.0.1',
    () =>
      console.log(
        `English Quest: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 3001}`,
      ),
  );
}
