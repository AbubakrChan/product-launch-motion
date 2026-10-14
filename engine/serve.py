# serve.py: static server for the film folder with caching off.  python3 engine/serve.py <dir> [port]
# Binds 127.0.0.1 only. Use this rather than a plain http.server: a cached film.js silently renders old code.
import http.server, functools, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8765
print(f'http://127.0.0.1:{port}/', flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(H, directory=sys.argv[1] if len(sys.argv) > 1 else '.')).serve_forever()
