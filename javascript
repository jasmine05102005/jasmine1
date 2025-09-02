// Agent Table (percept → action)
const agentTable = {
  "Clean,A": "MoveRight",
  "Clean,B": "MoveLeft",
  "Dirty,A": "Suck",
  "Dirty,B": "Suck",
};

// State
let rooms = { A: "Clean", B: "Dirty" };
let agentLoc = "A";
let remainingAuto = 0;
let autoTimer = null;

// DOM elements
const el = (id) => document.getElementById(id);
const roomASelect = el("roomA");
const roomBSelect = el("roomB");
const startLocSelect = el("startLoc");
const stepsInput = el("steps");
const statusA = el("statusA");
const statusB = el("statusB");
const agentA = el("agentA");
const agentB = el("agentB");
const log = el("log");

// Render world
function render() {
  statusA.textContent = rooms.A;
  statusB.textContent = rooms.B;
  statusA.className = "status " + (rooms.A === "Clean" ? "clean" : "dirty");
  statusB.className = "status " + (rooms.B === "Clean" ? "clean" : "dirty");
  agentA.style.display = agentLoc === "A" ? "block" : "none";
  agentB.style.display = agentLoc === "B" ? "block" : "none";
}

// Log output
function appendLog(html) {
  const p = document.createElement("p");
  p.innerHTML = html;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

// Percept
function percept() {
  return rooms[agentLoc];
}

// Lookup action
function lookupAction(status, location) {
  return agentTable[`${status},${location}`] ?? "NoOp";
}

// Perform action
function act(action) {
  if (action === "MoveRight") agentLoc = "B";
  else if (action === "MoveLeft") agentLoc = "A";
  else if (action === "Suck") rooms[agentLoc] = "Clean";
  render();
}

// One step
function step(stepIdx) {
  const p = percept();
  const action = lookupAction(p, agentLoc);
  appendLog(
    `<span class="step">Step ${stepIdx}:</span> Percept: <b>${p}</b>, Location: <b>${agentLoc}</b>, ` +
      `Action: <span class="act">${action}</span> <br>` +
      `<span class="state">World → A: ${rooms.A}, B: ${rooms.B}, Agent at: ${agentLoc}</span>`
  );
  if (action !== "NoOp") act(action);
}

// Reset world from input
function resetFromInputs() {
  rooms = { A: roomASelect.value, B: roomBSelect.value };
  agentLoc = startLocSelect.value;
  clearInterval(autoTimer);
  autoTimer = null;
  remainingAuto = 0;
  render();
}

// Button events
el("run").addEventListener("click", () => {
  resetFromInputs();
  let n = Math.max(1, Math.min(50, parseInt(stepsInput.value || "1", 10)));
  remainingAuto = n;
  log.innerHTML = "";
  let i = 1;
  step(i++);
  remainingAuto--;
  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    if (remainingAuto <= 0) {
      clearInterval(autoTimer);
      autoTimer = null;
      return;
    }
    step(i++);
    remainingAuto--;
  }, 600);
});

el("stepOnce").addEventListener("click", () => {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  if (log.children.length === 0) {
    resetFromInputs();
  }
  const stepIdx = log.querySelectorAll("p").length + 1;
  step(stepIdx);
});

el("reset").addEventListener("click", () => {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  log.innerHTML = "";
  resetFromInputs();
});

el("clearLog").addEventListener("click", () => {
  log.innerHTML = "";
});

// Init
resetFromInputs();

