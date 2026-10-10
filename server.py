#!/usr/bin/env python3
"""
Advent of Code Solution Explorer - Backend Server
A lightweight, dependency-free HTTP server that serves AoC day solutions,
file metadata, search capabilities, and the web frontend.
"""

import http.server
import json
import mimetypes
import os
import re
import sys
import urllib.parse
from pathlib import Path

# Resolve base directories
BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "web"
PORT = int(os.environ.get("PORT", 8000))
HOST = os.environ.get("HOST", "0.0.0.0")


def get_all_days_data():
    """Scan the repository for day folders and collect files."""
    days = []
    day_dirs = []

    for entry in BASE_DIR.iterdir():
        if entry.is_dir():
            match = re.match(r"^day_(\d+)$", entry.name, re.IGNORECASE)
            if match:
                day_dirs.append((int(match.group(1)), entry))

    # Sort numerically by day
    day_dirs.sort(key=lambda x: x[0])

    for day_num, d_path in day_dirs:
        py_files = []
        other_files = []

        for item in sorted(d_path.iterdir(), key=lambda p: p.name.lower()):
            if item.is_file():
                ext = item.suffix.lower()
                size = item.stat().st_size
                line_count = 0

                # Count lines safely
                try:
                    with open(item, "r", encoding="utf-8", errors="replace") as f:
                        line_count = sum(1 for _ in f)
                except Exception:
                    line_count = 0

                file_info = {
                    "name": item.name,
                    "extension": ext,
                    "size": size,
                    "lines": line_count,
                    "is_python": ext == ".py",
                }

                if ext == ".py":
                    py_files.append(file_info)
                else:
                    other_files.append(file_info)

        days.append({
            "id": d_path.name,
            "day_number": day_num,
            "title": f"Day {day_num}",
            "python_files": py_files,
            "other_files": other_files,
            "total_files": len(py_files) + len(other_files),
        })

    return days


def read_file_safely(day_id, filename):
    """Safely validate path and read file content."""
    # Strict validation to prevent directory traversal
    if not re.match(r"^day_\d+$", day_id):
        return None, "Invalid day parameter"

    # Only allow safe filename characters (alphanumeric, underscore, dash, dot)
    if not re.match(r"^[\w\.\-]+$", filename):
        return None, "Invalid filename parameter"

    file_path = (BASE_DIR / day_id / filename).resolve()

    # Ensure the path is strictly within the expected day directory
    expected_parent = (BASE_DIR / day_id).resolve()
    try:
        file_path.relative_to(expected_parent)
    except ValueError:
        return None, "Access denied: outside directory boundary"

    if not file_path.is_file():
        return None, f"File '{filename}' in '{day_id}' not found"

    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        return content, None
    except Exception as e:
        return None, f"Error reading file: {str(e)}"


def search_code(query):
    """Search for query across all python files in day directories."""
    if not query or len(query.strip()) < 2:
        return []

    q_lower = query.lower().strip()
    results = []
    days = get_all_days_data()

    for day in days:
        for py_file in day["python_files"]:
            content, err = read_file_safely(day["id"], py_file["name"])
            if err or content is None:
                continue

            lines = content.splitlines()
            for idx, line in enumerate(lines, start=1):
                if q_lower in line.lower():
                    results.append({
                        "day": day["id"],
                        "day_number": day["day_number"],
                        "filename": py_file["name"],
                        "line_number": idx,
                        "line_content": line.strip(),
                    })
                    if len(results) >= 100:  # Cap at 100 results
                        return results

    return results


class AoCRequestHandler(http.server.BaseHTTPRequestHandler):
    server_version = "AoC-Server/1.0"

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def send_text(self, text, status=200, content_type="text/plain; charset=utf-8"):
        body = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def serve_static_file(self, file_path):
        """Serve a static file from the web directory."""
        if not file_path.is_file():
            self.send_error(404, "File not found")
            return

        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type is None:
            mime_type = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Internal server error: {e}")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # API: list all days
        if path == "/api/days":
            days = get_all_days_data()
            self.send_json({"days": days, "total_days": len(days)})
            return

        # API: fetch single file content as JSON
        if path == "/api/file":
            day = params.get("day", [None])[0]
            filename = params.get("filename", [None])[0]

            if not day or not filename:
                self.send_json({"error": "Missing 'day' or 'filename' query parameter"}, 400)
                return

            content, err = read_file_safely(day, filename)
            if err:
                self.send_json({"error": err}, 404)
                return

            ext = Path(filename).suffix.lower()
            lines = content.splitlines()

            self.send_json({
                "day": day,
                "filename": filename,
                "content": content,
                "line_count": len(lines),
                "size_bytes": len(content.encode("utf-8")),
                "extension": ext,
                "is_python": ext == ".py",
            })
            return

        # API: fetch raw text
        if path == "/api/raw":
            day = params.get("day", [None])[0]
            filename = params.get("filename", [None])[0]

            if not day or not filename:
                self.send_text("Missing 'day' or 'filename' parameter", 400)
                return

            content, err = read_file_safely(day, filename)
            if err:
                self.send_text(err, 404)
                return

            self.send_text(content, 200, "text/plain; charset=utf-8")
            return

        # API: search code across files
        if path == "/api/search":
            q = params.get("q", [""])[0]
            results = search_code(q)
            self.send_json({"query": q, "results": results, "count": len(results)})
            return

        # Serve static web frontend
        if path == "/" or path == "/index.html":
            target = WEB_DIR / "index.html"
            self.serve_static_file(target)
            return

        # Strip leading slash and resolve against WEB_DIR
        rel_path = path.lstrip("/")
        target = (WEB_DIR / rel_path).resolve()

        # Security check: must be inside WEB_DIR
        try:
            target.relative_to(WEB_DIR.resolve())
            if target.is_file():
                self.serve_static_file(target)
                return
        except ValueError:
            pass

        self.send_error(404, "Page not found")

    def log_message(self, format, *args):
        # Format clean console logs
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} - {args[1]} {args[2]}\n")


def run():
    # Ensure web directory exists
    WEB_DIR.mkdir(exist_ok=True)

    port = int(os.environ.get("PORT", 8000))
    host_env = os.environ.get("HOST", "").strip()
    bind_target = host_env if host_env else None

    try:
        family, sockaddr = http.server._get_best_family(bind_target, port)
    except Exception:
        # Fallback to standard IPv4 if getaddrinfo fails
        import socket
        family = socket.AF_INET
        sockaddr = ("0.0.0.0", port)

    class DualStackHTTPServer(http.server.ThreadingHTTPServer):
        address_family = family
        daemon_threads = True

    httpd = DualStackHTTPServer(sockaddr, AoCRequestHandler)
    print(f"==================================================", flush=True)
    print(f"🎄 Advent of Code Explorer server running on port {port}", flush=True)
    print(f"👉 Bound to address: {sockaddr}", flush=True)
    print(f"==================================================", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...", flush=True)
        httpd.server_close()


if __name__ == "__main__":
    run()
