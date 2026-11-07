import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rules, fail, validateSubmission } from './validation.mjs';
import { createStore } from './store.mjs';
const cookieName = 'bleq_player';
const hash = (value) => createHash('sha256').update(value).digest('hex');
export function createQuestServer({
  dataFile,
  distDir = fileURLToPath(new URL('../../frontend/dist', import.meta.url)),
  publicOrigin = '',
}) {
  const root = resolve(distDir);
  const store = createStore(dataFile);
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
          const rows = Object.entries(store.players)
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
            hasPublished: Boolean(store.players[id]),
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
        const rateKey = store.players[id] ? id : req.socket.remoteAddress;
        const now = Date.now();
        const rate = rates.get(rateKey);
        if (rate && now - rate.start < 60000 && rate.count >= 120)
          throw fail(429, 'Bạn thao tác hơi nhanh. Hãy thử lại sau một phút.');
        if (!rate || now - rate.start >= 60000) {
          if (rates.size >= 10000) rates.delete(rates.keys().next().value);
          rates.set(rateKey, { start: now, count: 1 });
        } else rate.count++;
        if (req.method === 'DELETE') {
          if (store.players[id]) {
            const next = { ...store.players };
            delete next[id];
            store.persist(next);
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
        if (!store.players[id] && Object.keys(store.players).length >= 5000)
          throw fail(503, 'Bảng xếp hạng đã đầy. Vui lòng báo giáo viên.');
        const nextToken = store.players[id]
          ? token
          : randomBytes(24).toString('hex');
        const nextId = hash(nextToken);
        const previous = store.players[nextId];
        store.persist({
          ...store.players,
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
