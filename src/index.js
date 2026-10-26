/**
 * Advent of Code Solutions Explorer - Cloudflare Worker
 *
 * Implements the REST API endpoints and delegates static asset requests
 * to Cloudflare Workers Static Assets (env.ASSETS).
 */

import solutionsData from './solutions.data.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function textResponse(text, status = 200, contentType = 'text/plain; charset=utf-8') {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': contentType,
      ...CORS_HEADERS,
    },
  });
}

function handleSearch(query) {
  if (!query || query.trim().length < 2) {
    return { query: query || '', results: [], count: 0 };
  }

  const qLower = query.toLowerCase().trim();
  const results = [];

  for (const day of solutionsData.days) {
    for (const pyFile of day.python_files) {
      const fileData = solutionsData.files[`${day.id}/${pyFile.name}`];
      if (!fileData || !fileData.content) continue;

      const lines = fileData.content.split(/\r?\n/);
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (line.toLowerCase().includes(qLower)) {
          results.push({
            day: day.id,
            day_number: day.day_number,
            filename: pyFile.name,
            line_number: idx + 1,
            line_content: line.trim(),
          });
          if (results.length >= 100) {
            return { query, results, count: results.length };
          }
        }
      }
    }
  }

  return { query, results, count: results.length };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const params = url.searchParams;

    // API: list all days
    if (pathname === '/api/days') {
      return jsonResponse({
        days: solutionsData.days,
        total_days: solutionsData.total_days,
      });
    }

    // API: get single file content
    if (pathname === '/api/file') {
      const day = params.get('day');
      const filename = params.get('filename');

      if (!day || !filename) {
        return jsonResponse({ error: "Missing 'day' or 'filename' query parameter" }, 400);
      }

      if (!/^day_\d+$/.test(day)) {
        return jsonResponse({ error: 'Invalid day parameter' }, 404);
      }

      if (!/^[\w.\-]+$/.test(filename)) {
        return jsonResponse({ error: 'Invalid filename parameter' }, 404);
      }

      const fileData = solutionsData.files[`${day}/${filename}`];
      if (!fileData) {
        return jsonResponse({ error: `File '${filename}' in '${day}' not found` }, 404);
      }

      return jsonResponse({
        day: fileData.day,
        filename: fileData.filename,
        content: fileData.content,
        line_count: fileData.line_count,
        size_bytes: fileData.size_bytes,
        extension: fileData.extension,
        is_python: fileData.is_python,
      });
    }

    // API: get raw file content
    if (pathname === '/api/raw') {
      const day = params.get('day');
      const filename = params.get('filename');

      if (!day || !filename) {
        return textResponse("Missing 'day' or 'filename' parameter", 400);
      }

      if (!/^day_\d+$/.test(day)) {
        return textResponse('Invalid day parameter', 404);
      }

      if (!/^[\w.\-]+$/.test(filename)) {
        return textResponse('Invalid filename parameter', 404);
      }

      const fileData = solutionsData.files[`${day}/${filename}`];
      if (!fileData) {
        return textResponse(`File '${filename}' in '${day}' not found`, 404);
      }

      return textResponse(fileData.content, 200, 'text/plain; charset=utf-8');
    }

    // API: search code across files
    if (pathname === '/api/search') {
      const q = params.get('q') || '';
      const result = handleSearch(q);
      return jsonResponse(result);
    }

    // Static assets handling via Workers Assets
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
