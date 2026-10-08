
(function () {
  const root = document.getElementById("sudoku-game");
  if (!root) return;

  const SOLUTION_ROWS = [
    "534678912",
    "672195348",
    "198342567",
    "859761423",
    "426853791",
    "713924856",
    "961537284",
    "287419635",
    "345286179"
  ];

  const PUZZLE_ROWS = [
    "534.7..1.",
    "6.2195..8",
    "198.4..6.",
    "85..61..3",
    "42.8.3..1",
    "71..24..6",
    "96..3.28.",
    "2..419.35",
    "3...86.79"
  ];

  const toGrid = (rows) => rows.join("").split("").map((ch) => (ch === "." ? 0 : Number(ch)));

  const solution = toGrid(SOLUTION_ROWS);
  const puzzle = toGrid(PUZZLE_ROWS);
  let grid = puzzle.slice();
  let selected = -1;
  let solved = false;

  const rowOf = (i) => Math.floor(i / 9);
  const colOf = (i) => i % 9;
  const boxOf = (i) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
  const sees = (a, b) => rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b);

  root.innerHTML = `
    <div class="sdk-toolbar">
      <button type="button" class="sdk-btn sdk-new">Restart</button>
      <button type="button" class="sdk-btn sdk-check">Check</button>
    </div>
    <div class="sdk-board" role="grid" aria-label="Sudoku board"></div>
    <div class="sdk-pad"></div>
    <p class="sdk-message" aria-live="polite"></p>
  `;

  const boardEl = root.querySelector(".sdk-board");
  const padEl = root.querySelector(".sdk-pad");
  const msgEl = root.querySelector(".sdk-message");
  const cells = [];

  for (let i = 0; i < 81; i++) {
    const c = document.createElement("button");
    c.type = "button";
    c.className = "sdk-cell";
    c.setAttribute("aria-label", `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}`);
    c.addEventListener("click", () => select(i));
    boardEl.appendChild(c);
    cells.push(c);
  }

  for (let n = 1; n <= 9; n++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sdk-btn sdk-num";
    b.textContent = n;
    b.addEventListener("click", () => enter(n));
    padEl.appendChild(b);
  }
  const erase = document.createElement("button");
  erase.type = "button";
  erase.className = "sdk-btn sdk-num sdk-erase";
  erase.textContent = "Erase";
  erase.addEventListener("click", () => enter(0));
  padEl.appendChild(erase);

  function say(text, kind) {
    msgEl.textContent = text;
    msgEl.className = "sdk-message" + (kind ? " " + kind : "");
  }

  function conflicts() {
    const bad = new Set();
    for (let i = 0; i < 81; i++) {
      if (!grid[i]) continue;
      for (let k = 0; k < 81; k++) {
        if (k !== i && grid[k] === grid[i] && sees(i, k)) {
          bad.add(i);
          break;
        }
      }
    }
    return bad;
  }

  function select(i) {
    selected = i;
    render();
    cells[i].focus();
  }

  function enter(n) {
    if (solved || selected < 0 || puzzle[selected]) return; // givens are locked
    grid[selected] = n;
    say("");
    render();
    if (grid.every((v, i) => v === solution[i])) {
      solved = true;
      say("Solved! Nice work.", "sdk-good");
    }
  }

  function check() {
    if (solved) return;
    const wrong = grid.filter((v, i) => v && v !== solution[i]).length;
    const empty = grid.filter((v) => !v).length;
    if (wrong) {
      say(`${wrong} number${wrong > 1 ? "s are" : " is"} wrong. Keep going!`, "sdk-bad");
    } else if (empty) {
      say(`Looking good so far. ${empty} cells left.`, "sdk-good");
    }
  }

  function restart() {
    grid = puzzle.slice();
    selected = -1;
    solved = false;
    say("");
    render();
  }

  function render() {
    const bad = conflicts();
    const selVal = selected >= 0 ? grid[selected] : 0;
    for (let i = 0; i < 81; i++) {
      const c = cells[i];
      c.textContent = grid[i] || "";
      let cls = "sdk-cell";
      if (colOf(i) % 3 === 2 && colOf(i) !== 8) cls += " sdk-right";
      if (rowOf(i) % 3 === 2 && rowOf(i) !== 8) cls += " sdk-bottom";
      if (puzzle[i]) cls += " sdk-given";
      if (selected >= 0) {
        if (sees(i, selected)) cls += " sdk-peer";
        if (selVal && grid[i] === selVal) cls += " sdk-same";
        if (i === selected) cls += " sdk-selected";
      }
      if (bad.has(i) && !puzzle[i]) cls += " sdk-conflict";
      c.className = cls;
    }
  }

  root.querySelector(".sdk-new").addEventListener("click", restart);
  root.querySelector(".sdk-check").addEventListener("click", check);

  root.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key >= "1" && e.key <= "9") {
      enter(Number(e.key));
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      enter(0);
      e.preventDefault();
    } else if (selected >= 0 && e.key.startsWith("Arrow")) {
      let r = rowOf(selected), c = colOf(selected);
      if (e.key === "ArrowUp") r = Math.max(0, r - 1);
      if (e.key === "ArrowDown") r = Math.min(8, r + 1);
      if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
      if (e.key === "ArrowRight") c = Math.min(8, c + 1);
      select(r * 9 + c);
      e.preventDefault();
    }
  });

  render();
})();


(function () {
  const cards = Array.from(document.querySelectorAll(".card-stack .card"));
  const intro = document.querySelector(".placeholder-box");
  if (!cards.length || !intro) return;

  const SOLVED = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  const PROBLEMS = [
    {
      cls: "card-grey", level: "Easy", title: "One blank",
      boxRow: 0, boxCol: 0, blanks: [8],
      steps: [
        "A 3x3 box uses every digit from 1 to 9 exactly once.",
        "Read the digits already in the highlighted box: 1, 2, 3, 4, 5, 6, 7 and 9.",
        "Which digit from 1 to 9 is missing? That goes in the blank.",
        "Check the blank's row and column. The digit shouldn't appear there already."
      ],
      tip: "A digit that fits the box also has to fit its row and column."
    },
    {
      cls: "card-red", level: "Medium", title: "Two blanks",
      boxRow: 0, boxCol: 2, blanks: [1, 5],
      steps: [
        "Find the digits missing from the highlighted box: 1 and 8.",
        "Look along the top blank's row. The left side of that row already has an 8, so the top blank can't be 8. It must be 1.",
        "The other blank gets the last digit, 8. Check its row: no 8 there yet."
      ],
      tip: "When a box leaves two options, scan each blank's row and column. A digit that is already there is ruled out."
    },
    {
      cls: "card-dark", level: "Hard", title: "Three blanks",
      boxRow: 1, boxCol: 1, blanks: [0, 4, 8],
      steps: [
        "Find the digits missing from the highlighted box: 4, 5 and 7.",
        "Pick the blank whose row already holds the most of those digits. The top-left blank's row has a 4 and a 5 on the sides, so it must be 7.",
        "The middle blank's row has a 4 and a 7, so it must be 5.",
        "The bottom-right blank gets the last digit, 4. Its row has a 7 and a 5."
      ],
      tip: "Start with the blank that has the most digits ruled out. Solving it makes the others easier."
    }
  ];

  const boxIndex = (p, k) => ({
    r: p.boxRow * 3 + Math.floor(k / 3),
    c: p.boxCol * 3 + (k % 3)
  });

  intro.innerHTML = `
    <h3 class="tip-title">Try a practice box</h3>
    <p class="tip-goal">Click a card to open the full 9x9 board. Everything is filled in except the 3x3 box on the card. Use the rows and columns around that box to work out each blank.</p>
    <p class="tip-advice">Start with Easy, then try Medium and Hard.</p>
  `;

  cards.forEach((card) => {
    const p = PROBLEMS.find((x) => card.classList.contains(x.cls));
    if (!p) return;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${p.level} practice problem. Opens the full board.`);

    const label = document.createElement("div");
    label.className = "mini-label";
    label.textContent = p.level;

    const grid = document.createElement("div");
    grid.className = "mini-grid";
    for (let k = 0; k < 9; k++) {
      const { r, c } = boxIndex(p, k);
      const s = document.createElement("span");
      if (p.blanks.includes(k)) {
        s.className = "mini-cell mini-blank";
      } else {
        s.className = "mini-cell mini-given";
        s.textContent = SOLVED[r][c];
      }
      grid.appendChild(s);
    }
    card.append(label, grid);

    card.addEventListener("click", () => openPuzzle(p, card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPuzzle(p, card);
      }
    });
  });

  let backdrop = null;
  let opener = null;

  function openPuzzle(p, card) {
    closePuzzle(false);
    opener = card;

    let cellsHtml = "";
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const inBox = Math.floor(r / 3) === p.boxRow && Math.floor(c / 3) === p.boxCol;
        const k = (r % 3) * 3 + (c % 3);
        let cls = "pm-cell";
        if (c % 3 === 2 && c !== 8) cls += " pm-right";
        if (r % 3 === 2 && r !== 8) cls += " pm-bottom";
        if (inBox) cls += " pm-focus";
        if (inBox && p.blanks.includes(k)) {
          cellsHtml += `<input class="${cls} pm-input" type="text" inputmode="numeric" maxlength="1" data-r="${r}" data-c="${c}" aria-label="Blank, row ${r + 1}, column ${c + 1}">`;
        } else {
          cellsHtml += `<span class="${cls} pm-given">${SOLVED[r][c]}</span>`;
        }
      }
    }

    backdrop = document.createElement("div");
    backdrop.className = "pm-backdrop";
    backdrop.innerHTML = `
      <div class="pm-card" role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <div class="pm-head">
          <h3 id="pm-title" class="tip-title">${p.level}: ${p.title}</h3>
          <button type="button" class="sdk-btn pm-close" aria-label="Close">&#10005;</button>
        </div>
        <div class="pm-body">
          <div class="pm-board" aria-label="Sudoku board with a 3x3 box to solve">${cellsHtml}</div>
          <div class="pm-info">
            <p class="tip-goal">Fill the ${p.blanks.length === 1 ? "blank" : p.blanks.length + " blanks"} in the highlighted box. Every row, column and box needs 1 to 9 once.</p>
            <p class="tip-heading">How to think about it</p>
            <ol class="tip-steps">${p.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
            <p class="tip-advice">${p.tip}</p>
            <div class="tip-actions">
              <button type="button" class="sdk-btn pm-check">Check</button>
              <button type="button" class="sdk-btn pm-reveal">Show answer</button>
            </div>
            <p class="tip-message" aria-live="polite"></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const inputs = Array.from(backdrop.querySelectorAll(".pm-input"));
    const msg = backdrop.querySelector(".tip-message");
    const say = (text, kind) => { msg.textContent = text; msg.className = "tip-message" + (kind ? " " + kind : ""); };
    const answerOf = (inp) => String(SOLVED[inp.dataset.r][inp.dataset.c]);

    inputs.forEach((inp) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/[^1-9]/g, "").slice(-1);
        inp.classList.remove("pm-wrong", "pm-ok");
        say("");
      });
    });

    backdrop.querySelector(".pm-check").addEventListener("click", () => {
      let wrong = 0, empty = 0;
      inputs.forEach((inp) => {
        inp.classList.remove("pm-wrong", "pm-ok");
        if (!inp.value) empty++;
        else if (inp.value !== answerOf(inp)) { inp.classList.add("pm-wrong"); wrong++; }
        else inp.classList.add("pm-ok");
      });
      if (wrong) say(`${wrong} wrong. Re-read the steps and try again.`, "tip-bad");
      else if (empty) say(`So far so good. ${empty} blank${empty > 1 ? "s" : ""} left.`, "tip-good");
      else say("Solved! Close this and try the next card.", "tip-good");
    });

    backdrop.querySelector(".pm-reveal").addEventListener("click", () => {
      inputs.forEach((inp) => {
        inp.value = answerOf(inp);
        inp.classList.remove("pm-wrong");
        inp.classList.add("pm-ok");
      });
      say("Answer shown. Reread the steps to see why it works.", "tip-good");
    });

    backdrop.querySelector(".pm-close").addEventListener("click", () => closePuzzle(true));
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closePuzzle(true); });

    (inputs[0] || backdrop.querySelector(".pm-close")).focus();
  }

  function closePuzzle(returnFocus) {
    if (!backdrop) return;
    backdrop.remove();
    backdrop = null;
    document.body.style.overflow = "";
    if (returnFocus && opener) opener.focus();
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop) closePuzzle(true);
  });
})();