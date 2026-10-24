"""
Local ML Model Service for Xenithra IDE
Loads the pre-trained GGUF model located in Machine_Learning_Model/
Provides real-time code auto-complete and auto-suggestion via HTTP API.
"""

import os
import sys
import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

# Set up model path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODEL_DIR = os.path.join(WORKSPACE_ROOT, "Machine_Learning_Model")
GGUF_FILENAME = "qwen3-4b-thinking-2507.Q4_K_M.gguf"
MODEL_PATH = os.path.join(MODEL_DIR, GGUF_FILENAME)

PORT = 11435
llm = None
model_status = "initializing"
model_error = None

def load_model():
    global llm, model_status, model_error
    try:
        if not os.path.exists(MODEL_PATH):
            model_status = "missing_model_file"
            model_error = f"Model file not found at: {MODEL_PATH}"
            print(f"[LocalML] Error: {model_error}", flush=True)
            return

        print(f"[LocalML] Loading GGUF model: {MODEL_PATH} ...", flush=True)
        from llama_cpp import Llama

        # Optimized for fast CPU inference and code completion
        llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=2048,
            n_threads=min(os.cpu_count() or 4, 8),
            verbose=False
        )
        model_status = "ready"
        print(f"[LocalML] Model loaded successfully! Status: {model_status}", flush=True)
    except Exception as e:
        model_status = "error"
        model_error = str(e)
        print(f"[LocalML] Failed to load model: {e}", flush=True)

class ModelAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == "/health":
            self._set_headers(200)
            data = {
                "status": model_status,
                "model": "qwen3-4b-thinking-2507",
                "modelPath": MODEL_PATH,
                "error": model_error
            }
            self.wfile.write(json.dumps(data).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            body = {}

        if self.path == "/complete":
            # Code auto-completion / suggestion
            if model_status != "ready" or llm is None:
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "suggestion": "",
                    "status": model_status,
                    "error": model_error or "Model is still loading"
                }).encode("utf-8"))
                return

            code = body.get("code", "")
            line_content = body.get("lineContent", "")
            lang = body.get("lang", "javascript")
            max_tokens = int(body.get("max_tokens", 30))

            # Build a focused completion prompt
            # Extract last ~500 characters of context up to cursor
            context = code[-500:] if len(code) > 500 else code
            prompt = context if context else line_content

            stop_tokens = ["\n\n", "```", "<|im_end|>", "<|endoftext|>"]

            try:
                output = llm(
                    prompt,
                    max_tokens=max_tokens,
                    temperature=0.2,
                    top_p=0.9,
                    stop=stop_tokens,
                    echo=False
                )
                raw_text = output["choices"][0]["text"]
                # Clean up suggestions: keep first line or continuous block
                lines = raw_text.split("\n")
                suggestion = lines[0] if lines else ""
                if not suggestion and len(lines) > 1:
                    suggestion = lines[1]

                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "suggestion": suggestion,
                    "fullText": raw_text,
                    "status": "success",
                    "type": "local-qwen3-model"
                }).encode("utf-8"))
            except Exception as e:
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "suggestion": "",
                    "status": "error",
                    "error": str(e)
                }).encode("utf-8"))

        elif self.path == "/chat":
            if model_status != "ready" or llm is None:
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "response": "Local ML Model is still loading or unavailable.",
                    "status": model_status
                }).encode("utf-8"))
                return

            prompt = body.get("prompt", "")
            code = body.get("code", "")
            lang = body.get("lang", "")

            system_prompt = f"You are Xenithra AI Code Assistant. Provide concise, expert code solutions for {lang}."
            user_content = f"Code:\n```\n{code[:1500]}\n```\n\nTask: {prompt}"
            full_prompt = f"{system_prompt}\nUser: {user_content}\nAssistant:"

            try:
                output = llm(
                    full_prompt,
                    max_tokens=256,
                    temperature=0.3,
                    top_p=0.95,
                    stop=["User:", "Assistant:", "<|im_end|>"],
                    echo=False
                )
                response_text = output["choices"][0]["text"].strip()
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "response": response_text,
                    "status": "success"
                }).encode("utf-8"))
            except Exception as e:
                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "response": f"Error running local model: {e}",
                    "status": "error"
                }).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))

def run_server():
    server = HTTPServer(("127.0.0.1", PORT), ModelAPIHandler)
    print(f"[LocalML] Server running at http://127.0.0.1:{PORT}", flush=True)
    server.serve_forever()

if __name__ == "__main__":
    # Start model loading in a background thread so HTTP server starts responding right away
    loader_thread = threading.Thread(target=load_model, daemon=True)
    loader_thread.start()
    run_server()
