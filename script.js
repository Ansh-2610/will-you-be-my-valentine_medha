const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");
const buttonsBox = document.querySelector(".buttons");
const heartsContainer = document.getElementById("hearts");

const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

// ----- Helpers -----
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// =====================================================
//  NO BUTTON: GLIDE AWAY + SHRINK ON TOUCH (desktop + mobile)
// =====================================================
let lastMove = 0;
const REPEL_RADIUS = 110;   // bigger = harder to catch
const MOVE_COOLDOWN = 70;   // smaller = faster response
const PAD = 10;

function getBtnCenter(rect) {
  return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
}

function ensureNoBtnInitialized() {
  const left = parseFloat(noBtn.style.left);
  const top = parseFloat(noBtn.style.top);
  if (Number.isFinite(left) && Number.isFinite(top)) return;

  const boxRect = buttonsBox.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = boxRect.width - btnRect.width - PAD * 2;
  const maxY = boxRect.height - btnRect.height - PAD * 2;

  noBtn.style.left = `${PAD + maxX * 0.62}px`;
  noBtn.style.top = `${PAD + maxY * 0.20}px`;
}

function setNearState(isNear) {
  noBtn.classList.toggle("near", isNear);
}

function shrinkMomentarily() {
  noBtn.classList.add("shrink");
  setTimeout(() => noBtn.classList.remove("shrink"), 260);
}

function glideNoButtonAway(pointerX, pointerY) {
  const now = Date.now();
  if (now - lastMove < MOVE_COOLDOWN) return;
  lastMove = now;

  ensureNoBtnInitialized();

  const boxRect = buttonsBox.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = PAD;
  const maxX = boxRect.width - btnRect.width - pad * 2;
  const maxY = boxRect.height - btnRect.height - pad * 2;

  const { cx: btnCx, cy: btnCy } = getBtnCenter(btnRect);
  const dist = Math.hypot(btnCx - pointerX, btnCy - pointerY);

  setNearState(dist < REPEL_RADIUS + 20);
  if (dist > REPEL_RADIUS) return;

  // direction away from pointer (normalized)
  let dx = btnCx - pointerX;
  let dy = btnCy - pointerY;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  const currentLeft = parseFloat(noBtn.style.left) || 0;
  const currentTop = parseFloat(noBtn.style.top) || 0;

  // glide feel: jump scales with closeness
  const closeness = clamp((REPEL_RADIUS - dist) / REPEL_RADIUS, 0, 1);
  const jump = 60 + 90 * closeness; // 60..150 px

  let newLeft = currentLeft + dx * jump;
  let newTop = currentTop + dy * jump;

  // occasional random hop to stay uncatchable
  if (Math.random() < 0.08) {
    newLeft = pad + Math.random() * maxX;
    newTop = pad + Math.random() * maxY;
  }

  newLeft = clamp(newLeft, pad, pad + maxX);
  newTop = clamp(newTop, pad, pad + maxY);

  // CSS transitions handle the glide
  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top = `${newTop}px`;
}

function handlePointer(clientX, clientY) {
  glideNoButtonAway(clientX, clientY);
}

// unified for mouse + touch + pen
buttonsBox.addEventListener("pointermove", (e) => {
  handlePointer(e.clientX, e.clientY);
});

// if user tries to tap/click NO: shrink + escape immediately
noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  shrinkMomentarily();
  glideNoButtonAway(e.clientX, e.clientY);
});

// if NO somehow gets focus
noBtn.addEventListener("focus", () => {
  const boxRect = buttonsBox.getBoundingClientRect();
  shrinkMomentarily();
  glideNoButtonAway(boxRect.left + boxRect.width / 2, boxRect.top + boxRect.height / 2);
});

// extra safety: if cursor lands on it
noBtn.addEventListener("pointerenter", (e) => {
  shrinkMomentarily();
  glideNoButtonAway(e.clientX, e.clientY);
});

// ----- Floating hearts -----
function createHeart() {
  const heart = document.createElement("span");
  heart.textContent = Math.random() > 0.5 ? "❤️" : "💗";

  const left = Math.random() * 100;
  const size = 14 + Math.random() * 14;
  const duration = 3.2 + Math.random() * 2.6;
  const drift = (Math.random() * 160 - 80).toFixed(0) + "px";

  heart.style.left = left + "vw";
  heart.style.fontSize = size + "px";
  heart.style.animationDuration = duration + "s";
  heart.style.setProperty("--drift", drift);

  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 200);
}
setInterval(createHeart, 420);

// ----- Modal controls -----
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  closeModalBtn.focus();
}
function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  yesBtn.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target && e.target.dataset && e.target.dataset.close) closeModal();
});
closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
});

// ----- Confetti -----
let confetti = [];
let confettiRunning = false;

function spawnConfetti() {
  const count = 160;
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 2.2 + Math.random() * 3.2,
      r: 2 + Math.random() * 4,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.25,
      life: 160 + Math.random() * 80
    });
  }
}

function drawConfetti() {
  if (!confettiRunning) return;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confetti.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.a += p.va;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.globalAlpha = clamp(p.life / 220, 0, 1);

    ctx.beginPath();
    ctx.roundRect(-p.r, -p.r, p.r * 2.2, p.r * 1.6, 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-p.r, -p.r, p.r * 2.0, p.r * 1.4, 2);
    ctx.fillStyle = "rgba(255, 77, 109, 0.35)";
    ctx.fill();
    ctx.restore();
  });

  confetti = confetti.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 40);
  if (confetti.length === 0) {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }

  requestAnimationFrame(drawConfetti);
}

// ----- YES action -----
yesBtn.addEventListener("click", () => {
  openModal();

  spawnConfetti();
  confettiRunning = true;
  drawConfetti();

  document.querySelector(".card").animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.015)" }, { transform: "scale(1)" }],
    { duration: 520, easing: "ease-out" }
  );
});
