<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Xenithra Editor</title>

<style>
:root {
  --neon: #00ffd1;
  --purple: #7a00ff;
  --bg: #050505;
  --glass: rgba(255,255,255,0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "JetBrains Mono", monospace;
}

body {
  background: radial-gradient(circle at top, #0a0a0a, #000);
  color: white;
  overflow-x: hidden;
}

/* ===== HERO ===== */
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  background: linear-gradient(90deg, var(--neon), var(--purple));
  -webkit-background-clip: text;
  color: transparent;
  animation: glow 2s infinite alternate;
}

.hero p {
  margin-top: 1rem;
  font-size: 1.2rem;
  opacity: 0.8;
}

@keyframes glow {
  from { text-shadow: 0 0 10px var(--neon); }
  to { text-shadow: 0 0 25px var(--purple); }
}

/* ===== BADGES ===== */
.badges {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.badge {
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  animation: float 4s ease-in-out infinite;
}

.badge:nth-child(2) { animation-delay: 1s; }
.badge:nth-child(3) { animation-delay: 2s; }

@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ===== SECTIONS ===== */
section {
  padding: 6rem 10vw;
}

section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--neon);
}

section p {
  max-width: 800px;
  line-height: 1.8;
  opacity: 0.85;
}

/* ===== CARDS ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.card {
  padding: 2rem;
  background: var(--glass);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 0 30px rgba(0,255,209,0.2);
}

/* ===== FOOTER ===== */
footer {
  padding: 3rem;
  text-align: center;
  opacity: 0.6;
}
</style>
</head>

<body>

<div class="hero">
  <h1>XENITHRA</h1>
  <p>Compiler-Style Code Editor • Faster Than VS Code • Zero Lag</p>

  <div class="badges">
    <div class="badge">⚡ Ultra Fast</div>
    <div class="badge">🧠 Low Memory</div>
    <div class="badge">🚀 Next-Gen Editor</div>
  </div>
</div>

<section>
  <h2>Why Xenithra?</h2>
  <p>
    Modern editors are bloated with plugins, background services,
    and memory-heavy abstractions. Xenithra is built like a compiler —
    precise, minimal, and brutally fast.
  </p>
</section>

<section>
  <h2>Core Principles</h2>

  <div class="grid">
    <div class="card">
      <h3>⚡ Speed First</h3>
      <p>Cold start under milliseconds. No unnecessary background processes.</p>
    </div>

    <div class="card">
      <h3>🧠 Smart Core</h3>
      <p>Compiler-inspired execution flow with predictive parsing.</p>
    </div>

    <div class="card">
      <h3>🎯 Focused Design</h3>
      <p>No bloat. No distraction. Just code and flow.</p>
    </div>
  </div>
</section>

<section>
  <h2>Performance Snapshot</h2>
  <p>
    VS Code is a Swiss Army knife. Xenithra is a scalpel.
    Faster launch, lower RAM, smoother large-file handling.
  </p>
</section>

<footer>
  Built for developers who hate lag ⚡
</footer>

</body>
</html>
