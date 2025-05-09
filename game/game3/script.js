let ctx;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let player;
let achievements;
let timerInterval;
let elapsedTime = 0;
let currentLevel = 1;
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
    mazeHeight = this.rows * this.cellSize;
    mazeWidth = this.cols * this.cellSize;
    canvas.height = mazeHeight;
    canvas.width = mazeWidth;
    canvas.style.height = mazeHeight + 'px';
    canvas.style.width = mazeWidth + 'px';

    this.cells = [];
    for (let col = 0; col < this.cols; col++) {
      this.cells[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[col][row] = new MazeCell(col, row);
      }
    }

    let rndCol = Math.floor(Math.random() * this.cols);
    let rndRow = Math.floor(Math.random() * this.rows);
    let stack = [];
    stack.push(this.cells[rndCol][rndRow]);

    let currCell;
    let dir;
    let foundNeighbor;
    let nextCell;

    while (this.hasUnvisited(this.cells)) {
      currCell = stack[stack.length - 1];
      currCell.visited = true;
      if (this.hasUnvisitedNeighbor(currCell)) {
        nextCell = null;
        foundNeighbor = false;
        do {
          dir = Math.floor(Math.random() * 4);
          switch (dir) {
            case 0:
              if (currCell.col !== (this.cols - 1) && !this.cells[currCell.col + 1][currCell.row].visited) {
                currCell.eastWall = false;
                nextCell = this.cells[currCell.col + 1][currCell.row];
                nextCell.westWall = false;
                foundNeighbor = true;
              }
              break;
            case 1:
              if (currCell.row !== 0 && !this.cells[currCell.col][currCell.row - 1].visited) {
                currCell.northWall = false;
                nextCell = this.cells[currCell.col][currCell.row - 1];
                nextCell.southWall = false;
                foundNeighbor = true;
              }
              break;
            case 2:
              if (currCell.row !== (this.rows - 1) && !this.cells[currCell.col][currCell.row + 1].visited) {
                currCell.southWall = false;
                nextCell = this.cells[currCell.col][currCell.row + 1];
                nextCell.northWall = false;
                foundNeighbor = true;
              }
              break;
            case 3:
              if (currCell.col !== 0 && !this.cells[currCell.col - 1][currCell.row].visited) {
                currCell.westWall = false;
                nextCell = this.cells[currCell.col - 1][currCell.row];
                nextCell.eastWall = false;
                foundNeighbor = true;
              }
              break;
          }
          if (foundNeighbor) {
            stack.push(nextCell);
          }
        } while (!foundNeighbor)
      } else {
        currCell = stack.pop();
      }
    }
    this.redraw();
  }

  hasUnvisited(cells) {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!cells[col][row].visited) {
          return true;
        }
      }
    }
    return false;
  }

  hasUnvisitedNeighbor(currCell) {
    let col = currCell.col;
    let row = currCell.row;
    return (
      (col < this.cols - 1 && !this.cells[col + 1][row].visited) ||
      (row > 0 && !this.cells[col][row - 1].visited) ||
      (row < this.rows - 1 && !this.cells[col][row + 1].visited) ||
      (col > 0 && !this.cells[col - 1][row].visited)
    );
  }

  increaseLevel() {
    currentLevel++;
    this.cols = 10 + currentLevel;
    this.rows = 10 + currentLevel;
    this.generate();
  }

  redraw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, mazeWidth, mazeHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect((this.cols - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, mazeWidth, mazeHeight);

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[col][row].eastWall) {
          ctx.beginPath();
          ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].northWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].southWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
        if (this.cells[col][row].westWall) {
          ctx.beginPath();
          ctx.moveTo(col * this.cellSize, row * this.cellSize);
          ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = 'blue';
    ctx.fillRect((player.col * this.cellSize) + 2, (player.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
  }
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

  unlockAchievement(achievementName) {
    if (!this.achievements[achievementName]) {
      this.achievements[achievementName] = true;
      console.log(`Achievement Unlocked: ${achievementName}`);
    }
  }

  checkFirstMove() {
    if (!this.achievements.firstMove) {
      this.unlockAchievement('firstMove');
    }
  }

  checkMazeCompletion() {
    if (player.col === maze.cols - 1 && player.row === maze.rows - 1 && !this.achievements.mazeCompletion) {
      this.unlockAchievement('mazeCompletion');
      levelCompleted = true;
    }
  }

  checkSpeedRun() {
    const timeTaken = (Date.now() - this.startTime) / 1000;
    if (timeTaken < 60 && !this.achievements.speedRun) {
      this.unlockAchievement('speedRun');
    }
  }

  checkExploration() {
    const cellId = `${player.col},${player.row}`;
    this.visitedCells.add(cellId);
    if (this.visitedCells.size >= 100 && !this.achievements.exploration) {
      this.unlockAchievement('exploration');
    }
  }

  checkNoDeath() {
    if (this.achievements.mazeCompletion && player.col === maze.cols - 1 && player.row === maze.rows - 1 && !this.achievements.noDeath) {
      this.unlockAchievement('noDeath');
    }
  }
}

function displayAchievements() {
  const achievementList = document.getElementById('achievementList');
  achievementList.innerHTML = '';
  for (let achievement in achievements.achievements) {
    if (achievements.achievements[achievement]) {
      const li = document.createElement('li');
      li.textContent = achievement;
      achievementList.appendChild(li);
    }
  }
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 37: // left arrow or 'A'
    case 65:
      if (!maze.cells[player.col][player.row].westWall) {
        player.col -= 1;
      }
      break;
    case 39: // right arrow or 'D'
    case 68:
      if (!maze.cells[player.col][player.row].eastWall) {
        player.col += 1;
      }
      break;
    case 40: // down arrow or 'S'
    case 83:
      if (!maze.cells[player.col][player.row].southWall) {
        player.row += 1;
      }
      break;
    case 38: // up arrow or 'W'
    case 87:
      if (!maze.cells[player.col][player.row].northWall) {
        player.row -= 1;
      }
      break;
    default:
      break;
  }

  achievements.checkFirstMove();
  achievements.checkMazeCompletion();
  achievements.checkSpeedRun();
  achievements.checkExploration();
  achievements.checkNoDeath();

  if (levelCompleted) {
    stopTimer();
    player.reset();  
    maze.increaseLevel();  
    levelCompleted = false; 
  }

  maze.redraw();
  displayAchievements();
}

function startTimer() {
  timerInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('timerDisplay').textContent = `Time: ${elapsedTime}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function onLoad() {
  canvas = document.getElementById('mainForm');
  ctx = canvas.getContext('2d');

  player = new Player();
  maze = new Maze(10, 10, 25);
  achievements = new Achievements();

  startTimer(); 

  document.addEventListener('keydown', onKeyDown);
  document.getElementById('generate').addEventListener('click', onClick);
  document.getElementById('up').addEventListener('click', onControlClick);
  document.getElementById('right').addEventListener('click', onControlClick);
  document.getElementById('down').addEventListener('click', onControlClick);
  document.getElementById('left').addEventListener('click', onControlClick);
}

function onControlClick(event) {
  const direction = event.target.id;
  switch (direction) {
    case 'up':
      if (!maze.cells[player.col][player.row].northWall) {
        player.row -= 1;
      }
      break;
    case 'right':
      if (!maze.cells[player.col][player.row].eastWall) {
        player.col += 1;
      }
      break;
    case 'down':
      if (!maze.cells[player.col][player.row].southWall) {
        player.row += 1;
      }
      break;
    case 'left':
      if (!maze.cells[player.col][player.row].westWall) {
        player.col -= 1;
      }
      break;
    default:
      break;
  }

  achievements.checkFirstMove();
  achievements.checkMazeCompletion();
  achievements.checkSpeedRun();
  achievements.checkExploration();
  achievements.checkNoDeath();

  if (levelCompleted) {
    stopTimer();
    player.reset();
    maze.increaseLevel();
    levelCompleted = false;
  }

  maze.redraw();
  displayAchievements();
}

document.addEventListener('DOMContentLoaded', onLoad);
