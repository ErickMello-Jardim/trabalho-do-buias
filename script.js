const starsCanvas = document.getElementById("starsCanvas");
const starsCtx = starsCanvas.getContext("2d");
const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");
const panel = document.getElementById("goalPanel");
const railButtons = [...document.querySelectorAll(".mission-rail button")];

const goals = [
  {
    hour: 2,
    target: "2026-06-21T19:00:00",
    title: "Acender a Chama de Pegasus",
    chip: "Missao 02",
    color: "#ff344f",
    description:
      "Iniciar o treinamento de um cavaleiro escolhido pela constelacao de Pegasus. A missao e despertar o primeiro brilho do cosmo, resistir ao teste da queda das estrelas e provar coragem diante do portao do Santuario.",
    steps: ["Completar 7 noites de treino sob as estrelas", "Forjar o primeiro medalhao de bronze", "Vencer o desafio da constelacao guia"],
    progress: 18,
  },
  {
    hour: 5,
    target: "2026-08-14T22:30:00",
    title: "Reconstruir a Armadura de Dragao",
    chip: "Missao 05",
    color: "#29f6ff",
    description:
      "Recuperar os fragmentos de uma armadura sagrada partida em batalha. O objetivo e encontrar cristais de oricalco, purificar a energia antiga e devolver defesa ao cavaleiro guardiao da cascata.",
    steps: ["Coletar 3 fragmentos no Vale dos Ecos", "Purificar o escudo na agua lunar", "Selar a armadura com sangue estelar"],
    progress: 32,
  },
  {
    hour: 8,
    target: "2026-10-03T18:00:00",
    title: "Atravessar a Casa de Gemeos",
    chip: "Missao 08",
    color: "#46ff9a",
    description:
      "Enfrentar uma ilusao criada no corredor duplo do Santuario. A missao e separar verdade e reflexo, encontrar a saida correta e impedir que o grupo perca horas preciosas dentro do labirinto astral.",
    steps: ["Mapear os dois caminhos ilusorios", "Quebrar o espelho do falso mestre", "Abrir a passagem com cosmo sincronizado"],
    progress: 27,
  },
  {
    hour: 10,
    target: "2027-01-12T20:00:00",
    title: "Defender o Relogio de Fogo",
    chip: "Missao 10",
    color: "#ff2fd1",
    description:
      "Proteger a torre do relogio enquanto as chamas sagradas ainda queimam. Invasores espectrais tentam apagar as doze luzes, e a equipe precisa manter o tempo vivo ate a chegada da aurora.",
    steps: ["Reforcar os selos das 12 chamas", "Patrulhar a torre a cada ciclo", "Derrotar o espectro da ampulheta negra"],
    progress: 46,
  },
  {
    hour: 12,
    target: "2027-04-30T23:59:00",
    title: "Despertar a Armadura de Ouro",
    chip: "Missao 12",
    color: "#ffd166",
    description:
      "Concluir a saga elevando o cosmo ao ponto maximo e conquistando uma armadura dourada ficticia. A prova final exige dominio, sacrificio e a capacidade de proteger o Santuario sem perder a propria luz.",
    steps: ["Reunir os signos no altar central", "Superar o golpe final do Grande Mestre", "Erguer a armadura dourada ao nascer do sol"],
    progress: 12,
  },
];

let activeHour = null;
let markers = [];
let particles = [];
let pulse = 0;

function resizeStars() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  starsCanvas.width = window.innerWidth * dpr;
  starsCanvas.height = window.innerHeight * dpr;
  starsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(140, Math.floor(window.innerWidth / 9)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.24,
    vy: Math.random() * 0.24 + 0.04,
    r: Math.random() * 1.8 + 0.35,
    hue: Math.random() > 0.55 ? "41, 246, 255" : "255, 47, 209",
  }));
}

function drawStars() {
  pulse += 0.018;
  starsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((particle, index) => {
    const alpha = 0.28 + Math.sin(pulse + index * 0.7) * 0.18;
    starsCtx.fillStyle = `rgba(${particle.hue}, ${Math.max(0.14, alpha)})`;
    starsCtx.beginPath();
    starsCtx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    starsCtx.fill();
    if (index % 14 === 0) {
      starsCtx.strokeStyle = `rgba(${particle.hue}, 0.18)`;
      starsCtx.beginPath();
      starsCtx.moveTo(particle.x - 16, particle.y);
      starsCtx.lineTo(particle.x + 16, particle.y);
      starsCtx.stroke();
    }
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.y > window.innerHeight + 8 || particle.x < -12 || particle.x > window.innerWidth + 12) {
      particle.x = Math.random() * window.innerWidth;
      particle.y = -8;
    }
  });
  requestAnimationFrame(drawStars);
}

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const size = Math.floor(canvas.getBoundingClientRect().width);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawClock();
}

function goalByHour(hour) {
  return goals.find((goal) => goal.hour === hour);
}

function targetDate(goal) {
  return new Date(goal.target);
}

function remainingParts(target) {
  const total = Math.max(0, Math.floor((target - new Date()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function polygon(cx, cy, radius, sides, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function circle(x, y, r, fill, stroke = "#29f6ff", line = 2) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = line;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawNode(x, y, size, color, selected) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = selected ? 28 : 16;
  ctx.shadowColor = color;
  polygon(0, 0, size, 6, Math.PI / 6);
  ctx.fillStyle = selected ? color : "rgba(3, 8, 18, 0.84)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  ctx.stroke();
  circle(0, 0, size * 0.38, selected ? "#ffffff" : color, "#ffffff", 1.2);
  ctx.restore();
}

function drawHand(cx, cy, angle, length, width, fill) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-width, 16);
  ctx.lineTo(width, 16);
  ctx.lineTo(width * 0.7, -length);
  ctx.lineTo(0, -length - 16);
  ctx.lineTo(-width * 0.7, -length);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#e9fbff";
  ctx.stroke();
  ctx.restore();
}

function drawClock() {
  const size = canvas.getBoundingClientRect().width || 680;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.355;
  markers = [];
  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.shadowBlur = 38;
  ctx.shadowColor = "rgba(41, 246, 255, 0.28)";
  polygon(cx, cy, radius + 72, 6);
  ctx.fillStyle = "rgba(5, 14, 29, 0.72)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(41, 246, 255, 0.72)";
  ctx.stroke();
  ctx.restore();

  polygon(cx, cy, radius + 44, 12);
  ctx.fillStyle = "rgba(2, 6, 15, 0.88)";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255, 47, 209, 0.36)";
  ctx.stroke();

  circle(cx, cy, radius + 18, "rgba(4, 14, 32, 0.95)", "rgba(41, 246, 255, 0.78)", 4);
  circle(cx, cy, radius - 70, "rgba(5, 12, 28, 0.74)", "rgba(255, 47, 209, 0.42)", 2);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(41, 246, 255, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i += 1) {
    ctx.rotate(Math.PI / 9);
    ctx.beginPath();
    ctx.moveTo(0, -radius + 70);
    ctx.lineTo(0, radius - 24);
    ctx.stroke();
  }
  ctx.restore();

  for (let i = 0; i < 60; i += 1) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const outer = radius + 1;
    const inner = radius - (i % 5 === 0 ? 27 : 14);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.lineWidth = i % 5 === 0 ? 4 : 1.5;
    ctx.strokeStyle = i % 5 === 0 ? "#29f6ff" : "rgba(41, 246, 255, 0.35)";
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${Math.max(20, size * 0.046)}px Verdana, sans-serif`;
  for (let hour = 1; hour <= 12; hour += 1) {
    const goal = goalByHour(hour);
    const angle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (radius * 0.72);
    const y = cy + Math.sin(angle) * (radius * 0.72);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
    ctx.fillStyle = goal ? "#ff344f" : "#e9fbff";
    ctx.shadowBlur = goal ? 16 : 0;
    ctx.shadowColor = "#ff344f";
    ctx.strokeText(String(hour).padStart(2, "0"), x, y);
    ctx.fillText(String(hour).padStart(2, "0"), x, y);
    ctx.shadowBlur = 0;
    if (goal) {
      const nx = cx + Math.cos(angle) * (radius * 0.98);
      const ny = cy + Math.sin(angle) * (radius * 0.98);
      drawNode(nx, ny, Math.max(14, size * 0.026), goal.color, activeHour === hour);
      markers.push({ hour, x, y, nodeX: nx, nodeY: ny, radius: Math.max(44, size * 0.075) });
    }
  }

  const now = new Date();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  drawHand(cx, cy, (hours / 12) * Math.PI * 2, radius * 0.46, 10, "#ff2fd1");
  drawHand(cx, cy, (minutes / 60) * Math.PI * 2, radius * 0.72, 7, "#29f6ff");

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((seconds / 60) * Math.PI * 2);
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, -radius * 0.77);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#46ff9a";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#46ff9a";
  ctx.stroke();
  ctx.restore();

  circle(cx, cy, 18, "#020813", "#29f6ff", 4);
  circle(cx, cy, 7, "#ff2fd1", "#e9fbff", 2);
}

function setRailActive(hour) {
  railButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.hour) === hour);
  });
}

function openGoal(hour) {
  activeHour = hour;
  setRailActive(hour);
  const goal = goalByHour(hour);
  const target = targetDate(goal);
  const parts = remainingParts(target);
  const date = target.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  panel.hidden = false;
  document.body.classList.add("has-goal");
  panel.innerHTML = `
    <div>
      <span class="goal-chip">${goal.chip}</span>
      <h2>${goal.title}</h2>
    </div>
    <div>
      <p class="goal-date">Prazo: ${date}, ${String(target.getHours()).padStart(2, "0")}:${String(target.getMinutes()).padStart(2, "0")}</p>
      <p>${goal.description}</p>
    </div>
    <div>
      <ul class="steps">
        ${goal.steps.map((step) => `<li>${step}</li>`).join("")}
      </ul>
      <div class="progress">
        <strong>Avanco do protocolo</strong>
        <div class="progress-track"><span style="width: ${goal.progress}%"></span></div>
      </div>
      <div class="countdown">
        <span><strong>${parts.days}</strong><small>dias</small></span>
        <span><strong>${parts.hours}</strong><small>horas</small></span>
        <span><strong>${parts.minutes}</strong><small>min</small></span>
        <span><strong>${parts.seconds}</strong><small>seg</small></span>
      </div>
    </div>
    <button class="back-button" type="button" data-action="back" aria-label="Fechar objetivo">x</button>
  `;
  drawClock();
}

function resetGoal() {
  activeHour = null;
  setRailActive(null);
  panel.hidden = true;
  panel.innerHTML = "";
  document.body.classList.remove("has-goal");
  drawClock();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function hitMarker(point) {
  return markers.find((marker) => {
    const numberHit = Math.hypot(marker.x - point.x, marker.y - point.y) <= marker.radius;
    const nodeHit = Math.hypot(marker.nodeX - point.x, marker.nodeY - point.y) <= marker.radius;
    return numberHit || nodeHit;
  });
}

canvas.addEventListener("click", (event) => {
  const hit = hitMarker(canvasPoint(event));
  if (hit) openGoal(hit.hour);
});

canvas.addEventListener("mousemove", (event) => {
  canvas.style.cursor = hitMarker(canvasPoint(event)) ? "pointer" : "default";
});

railButtons.forEach((button) => {
  button.addEventListener("click", () => openGoal(Number(button.dataset.hour)));
});

panel.addEventListener("click", (event) => {
  if (event.target.closest("[data-action='back']")) resetGoal();
});

window.addEventListener("resize", () => {
  resizeStars();
  resizeCanvas();
});

resizeStars();
drawStars();
resizeCanvas();
resetGoal();

setInterval(() => {
  drawClock();
  if (activeHour !== null) openGoal(activeHour);
}, 1000);
