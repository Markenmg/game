let ctx, canvas, maze, player, achievements, timerInterval;
let currentLevel = 1;
let elapsedTime = 0;
let levelCompleted = false;

class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.col = 0;
    this.row = 0;
  }
}

class MazeCell {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.eastWall = true;
    this.northWall = true;
    this.southWall = true;
    this.westWall = true;
    this.visited = false;
  }
}

class Maze {
  constructor(cols, rows, cellSize) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.cells = [];
    this.generate();
  }

  generate() {
    canvas.height = this.rows * this.cellSize;
    canvas.width = this.cols * this.cellSize;

    this.cells = [];
    for (let col = 0; col < this.cols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[col][row] = new MazeCell(col, row);
      }
    }

    let rndCol = Math.floor(Math.random() * this.cols);
    let rndRow = Math.floor(Math.random() * this.rows);
    let stack = [this.cells[rndCol][rndRow]];

    while (this.hasUnvisited(this.cells)) {
      let currCell = stack[stack.length - 1];
      currCell.visited = true;

      if (this.hasUnvisitedNeighbor(currCell)) {
        let dir, foundNeighbor = false, nextCell = null;
        do {
          dir = Math.floor(Math.random() * 4);
          switch (dir) {
            case 0:
              if (currCell.col < this.cols - 1 && !this.cells[currCell.col + 1][currCell.row].visited) {
                currCell.eastWall = false;
                nextCell = this.cells[currCell.col + 1][currCell.row];
                nextCell.westWall = false;
                foundNeighbor = true;
              }
              break;
            case 1:
              if (currCell.row > 0 && !this.cells[currCell.col][currCell.row - 1].visited) {
                currCell.northWall = false;
                nextCell = this.cells[currCell.col][currCell.row - 1];
                nextCell.southWall = false;
                foundNeighbor = true;
              }
              break;
            case 2:
              if (currCell.row < this.rows - 1 && !this.cells[currCell.col][currCell.row + 1].visited) {
                currCell.southWall = false;
                nextCell = this.cells[currCell.col][currCell.row + 1];
                nextCell.northWall = false;
                foundNeighbor = true;
              }
              break;
            case 3:
              if (currCell.col > 0 && !this.cells[currCell.col - 1][currCell.row].visited) {
                currCell.westWall = false;
                nextCell = this.cells[currCell.col - 1][currCell.row];
                nextCell.eastWall = false;
                foundNeighbor = true;
              }
              break;
          }
          if (foundNeighbor) stack.push(nextCell);
        } while (!foundNeighbor);
      } else {
        stack.pop();
      }
    }
    this.redraw();
  }

  hasUnvisited(cells) {
    return cells.flat().some(cell => !cell.visited);
  }

  hasUnvisitedNeighbor(cell) {
    const { col, row } = cell;
    return (
      (col < this.cols - 1 && !this.cells[col + 1][row].visited) ||
      (row > 0 && !this.cells[col][row - 1].visited) ||
      (row < this.rows - 1 && !this.cells[col][row + 1].visited) ||
      (col > 0 && !this.cells[col - 1][row].visited)
    );
  }

  increaseLevel() {
    currentLevel++;
    updateLevelDisplay();
    this.generate();
  }

  redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'green';
    ctx.fillRect((this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        const cell = this.cells[col][row];
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        ctx.strokeStyle = 'black';

        if (cell.northWall) drawLine(x, y, x + this.cellSize, y);
        if (cell.southWall) drawLine(x, y + this.cellSize, x + this.cellSize, y + this.cellSize);
        if (cell.eastWall) drawLine(x + this.cellSize, y, x + this.cellSize, y + this.cellSize);
        if (cell.westWall) drawLine(x, y, x, y + this.cellSize);
      }
    }

    ctx.fillStyle = 'blue';
    ctx.fillRect(
      player.col * this.cellSize + 2,
      player.row * this.cellSize + 2,
      this.cellSize - 4,
      this.cellSize - 4
    );
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

class Achievements {
  constructor() {
    this.achievements = {
      firstMove: false,
      mazeCompletion: false,
      speedRun: false,
      exploration: false,
      noDeath: false
    };
    this.startTime = Date.now();
    this.visitedCells = new Set();
  }

  unlockAchievement(name) {
    if (!this.achievements[name]) {
      this.achievements[name] = true;
      console.log(`Achievement unlocked: ${name}`);
    }
  }

  checkFirstMove() {
    this.unlockAchievement('firstMove');
  }

  checkMazeCompletion() {
    if (player.col === maze.cols - 1 && player.row === maze.rows - 1) {
      this.unlockAchievement('mazeCompletion');
      levelCompleted = true;
    }
  }

  checkSpeedRun() {
    const time = (Date.now() - this.startTime) / 1000;
    if (time < 60) this.unlockAchievement('speedRun');
  }

  checkExploration() {
    const cellId = `${player.col},${player.row}`;
    this.visitedCells.add(cellId);
    if (this.visitedCells.size >= 100) {
      this.unlockAchievement('exploration');
    }
  }

  checkNoDeath() {
    if (this.achievements.mazeCompletion) {
      this.unlockAchievement('noDeath');
    }
  }
}

function updateLevelDisplay() {
  document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
}

function displayAchievements() {
  const list = document.getElementById('achievementList');
  list.innerHTML = '';
  for (let key in achievements.achievements) {
    if (achievements.achievements[key]) {
      const li = document.createElement('li');
      li.textContent = key;
      list.appendChild(li);
    }
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('timerDisplay').textContent = `Time: ${elapsedTime}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function onKeyDown(event) {
  let moved = false;
  const c = player.col;
  const r = player.row;

  switch (event.key) {
    case 'ArrowLeft': case 'a':
      if (!maze.cells[c][r].westWall) { player.col--; moved = true; } break;
    case 'ArrowRight': case 'd':
      if (!maze.cells[c][r].eastWall) { player.col++; moved = true; } break;
    case 'ArrowUp': case 'w':
      if (!maze.cells[c][r].northWall) { player.row--; moved = true; } break;
    case 'ArrowDown': case 's':
      if (!maze.cells[c][r].southWall) { player.row++; moved = true; } break;
  }

  if (moved) {
    achievements.checkFirstMove();
    achievements.checkMazeCompletion();
    achievements.checkSpeedRun();
    achievements.checkExploration();
    achievements.checkNoDeath();
    maze.redraw();
    displayAchievements();
  }

  if (levelCompleted) {
    stopTimer();
    player.reset();
    maze.increaseLevel();
    achievements = new Achievements();
    levelCompleted = false;
    elapsedTime = 0;
    startTimer();
  }
}

function onLoad() {
  canvas = document.getElementById('mainForm');
  ctx = canvas.getContext('2d');

  player = new Player();
  maze = new Maze(10, 10, 25);
  achievements = new Achievements();

  document.addEventListener('keydown', onKeyDown);

  document.getElementById('generate').addEventListener('click', () => {
    player.reset();
    maze.generate();
    maze.redraw();
    achievements = new Achievements();
    elapsedTime = 0;
    startTimer();
  });

  maze.redraw();
  startTimer();
}

document.addEventListener('DOMContentLoaded', onLoad);
