# 🎄 Advent of Code - Python Solutions Explorer

A modern, high-performance web dashboard to explore, read, compare, and search Advent of Code Python solutions day-by-day.

![AoC Solutions Explorer](https://img.shields.io/badge/Advent_of_Code-Python_Solutions-00e699?style=flat-square&logo=python&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Ready-f38020?style=flat-square&logo=cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-ffd166?style=flat-square)

---

## ✨ Features

- **Daily Code Viewing**: Browse Python solutions for Day 1 through Day 12 with syntax highlighting.
- **Part 1 & Part 2 Tabs**: Instant switching between `attempt.py` (Part 1) and `attempt2.py` (Part 2).
- **Side-by-Side Comparison**: Side-by-side diff view to see what logic changed between Part 1 and Part 2.
- **Global Code Search (`Ctrl+K`)**: Search keywords across all solution files and jump directly to matches.
- **Input Data Drawer**: Collapsible preview for `input.in` and `test.in` data files.
- **Zero External Dependencies**: Built with Python standard library (`http.server`) and vanilla CSS/JS.
- **Docker Ready**: Preconfigured `Dockerfile` and `docker-compose.yml` for instant container deployment.

---

## 🚀 Running Locally (No Docker Required)

Requires **Python 3.8+** (no pip dependencies needed).

```bash
# Start the web server
python server.py
```

Then open your browser at **[http://localhost:8000](http://localhost:8000)**.

To customize the port or host:
```bash
PORT=5000 HOST=127.0.0.1 python server.py
```

---

## 🐳 Running with Docker

### 1. Build and Run via Docker Compose (Recommended)

```bash
docker compose up -d --build
```
Access the application at **[http://localhost:8000](http://localhost:8000)**.

To stop the container:
```bash
docker compose down
```

### 2. Build and Run via Docker CLI

```bash
# Build Docker image
docker build -t aoc-explorer .

# Run container on port 8000
docker run -d -p 8000:8000 --name aoc-explorer aoc-explorer
```

## ⚡ Running with Cloudflare Workers (Wrangler)

Run locally using Wrangler:

```bash
# Start local development server
npx wrangler dev
```

Deploy globally to Cloudflare Workers:

```bash
npx wrangler deploy
```

---

## 📁 Project Structure

```text
├── day_1/               # Daily problem folders containing
│   ├── attempt.py       # - Part 1 Python solution
│   ├── attempt2.py      # - Part 2 Python solution
│   └── input.in         # - Puzzle input
├── ...
├── day_12/
├── web/                 # Web Application Frontend
│   ├── index.html       # Single Page Application
│   ├── style.css        # Responsive dark theme & styling
│   └── app.js           # Client-side routing, API fetching & Prism highlight
├── src/                 # Cloudflare Worker implementation
│   ├── index.js         # Worker entry point (REST API & ASSETS delegation)
│   ├── solutions.data.js# Bundled day metadata and solutions
│   └── solutions.json   # Solutions dataset JSON
├── scripts/
│   └── build-data.js    # Data bundler script (runs on build/watch)
├── wrangler.json        # Cloudflare Wrangler configuration
├── package.json         # Node.js project manifest & scripts
├── server.py            # Backend Python server (REST API & static file server)
├── Dockerfile           # Production Docker container definition
├── docker-compose.yml   # Multi-environment container orchestration
├── .dockerignore        # Exclusions for lean container builds
└── README.md
```

---

## 📡 REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/days` | `GET` | Returns list of all solved days with metadata and file lists |
| `/api/file?day={day}&filename={file}` | `GET` | Returns file text content, line count, and byte size as JSON |
| `/api/raw?day={day}&filename={file}` | `GET` | Returns raw plaintext file content |
| `/api/search?q={query}` | `GET` | Searches code across all Python files and returns snippets |
