const mazeSize = 20;
const mazeContainer = document.getElementById("maze");
const multiMazesContainer = document.getElementById("multiMazes");
const generateMazeButton = document.getElementById("generateMaze");
const useMazeButton = document.getElementById("useMaze");
// const gridSizeInput = document.getElementById("gridSize");
// let mazeSize = parseInt(gridSizeInput.value);
let startPoint = null;
let targetPoint = null;
let mazeLayout = [];

function createMazeGrid() {
  mazeContainer.innerHTML = "";
  mazeContainer.style.gridTemplateRows = `repeat(${mazeSize}, 25px)`;
  mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, 25px)`;

  mazeLayout = [];

  for (let i = 0; i < mazeSize * mazeSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.classList.add("wall");

    cell.addEventListener("click", () => {
      if (!startPoint) {
        cell.classList.add("start");
        startPoint = i;
      } else if (!targetPoint) {
        cell.classList.add("target");
        targetPoint = i;
      }
    });

    mazeContainer.appendChild(cell);
    mazeLayout.push("wall");
  }
}

async function generateMazeGraph() {
  createMazeGrid();
  const cells = Array.from(mazeContainer.children);
  const edges = [];

  // Create a graph of all cells and their potential edges
  for (let i = 0; i < mazeSize * mazeSize; i++) {
    const neighbors = getNeighbors(i);
    for (const neighbor of neighbors) {
      edges.push({ from: i, to: neighbor });
    }
  }

  // Shuffle edges to randomize the maze
  shuffleArray(edges);

  // Kruskal's algorithm to create a minimum spanning tree
  const parent = new Array(mazeSize * mazeSize);
  for (let i = 0; i < mazeSize * mazeSize; i++) {
    parent[i] = i;
  }

  function find(i) {
    if (parent[i] === i) return i;
    return (parent[i] = find(parent[i]));
  }

  function union(i, j) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  }

  for (const edge of edges) {
    if (union(edge.from, edge.to)) {
      removeWallBetween(edge.from, edge.to, cells);
      mazeLayout[edge.from] = "path";
      mazeLayout[edge.to] = "path";
      cells[edge.from].classList.remove("wall");
      cells[edge.to].classList.remove("wall");
    }
  }

  // Add some random walls back to increase complexity
  for (let i = 0; i < mazeSize * mazeSize; i++) {
    if (Math.random() < 0.2) {
      // 20% chance
      if (mazeLayout[i] === "path") {
        let neighbors = getNeighbors(i);
        for (let neighbor of neighbors) {
          if (Math.random() < 0.5) {
            if (mazeLayout[neighbor] === "path") {
              let rowCurrent = Math.floor(i / mazeSize);
              let colCurrent = i % mazeSize;
              let rowNeighbor = Math.floor(neighbor / mazeSize);
              let colNeighbor = neighbor % mazeSize;
              if (rowCurrent === rowNeighbor) {
                if (colCurrent < colNeighbor) {
                  cells[i + 1].classList.add("wall");
                } else {
                  cells[i - 1].classList.add("wall");
                }
              } else {
                if (rowCurrent < rowNeighbor) {
                  cells[i + mazeSize].classList.add("wall");
                } else {
                  cells[i - mazeSize].classList.add("wall");
                }
              }
            }
          }
        }
      }
    }
  }

  console.log("Graph-based maze generation complete.");
}

function getNeighbors(index) {
  const row = Math.floor(index / mazeSize);
  const col = index % mazeSize;
  const neighbors = [];

  if (row > 0) neighbors.push(index - mazeSize);
  if (row < mazeSize - 1) neighbors.push(index + mazeSize);
  if (col > 0) neighbors.push(index - 1);
  if (col < mazeSize - 1) neighbors.push(index + 1);

  return neighbors;
}

function removeWallBetween(current, next, cells) {
  const currentRow = Math.floor(current / mazeSize);
  const currentCol = current % mazeSize;
  const nextRow = Math.floor(next / mazeSize);
  const nextCol = next % mazeSize;

  if (currentRow === nextRow) {
    if (currentCol < nextCol) cells[current + 1].classList.remove("wall");
    else cells[current - 1].classList.remove("wall");
  } else {
    if (currentRow < nextRow)
      cells[current + mazeSize].classList.remove("wall");
    else cells[current - mazeSize].classList.remove("wall");
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function spawnAdditionalMazes() {
  multiMazesContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const mazeWrapper = document.createElement("div");
    mazeWrapper.classList.add("maze");
    mazeWrapper.style.gridTemplateRows = `repeat(${mazeSize}, 25px)`;
    mazeWrapper.style.gridTemplateColumns = `repeat(${mazeSize}, 25px)`;

    const originalCells = Array.from(mazeContainer.children);

    originalCells.forEach((originalCell) => {
      const newCell = document.createElement("div");
      newCell.classList.add("cell");

      originalCell.classList.forEach((className) => {
        if (className !== "cell") {
          newCell.classList.add(className);
        }
      });

      mazeWrapper.appendChild(newCell);
    });
    const algorithmName =
      i === 0
        ? "BFS"
        : i === 1
        ? "DFS"
        : i === 2
        ? "A* (A-Star)"
        : i === 3
        ? "Greedy Best-First"
        : "JPS";

    const algorithmDefinitions = {
      BFS: "Breadth-First Search: Explores layer by layer, guaranteeing the shortest path.",
      DFS: "Depth-First Search: Explores as far as possible along each branch before backtracking.",
      "A* (A-Star)":
        "A*: Uses heuristics to find the shortest path quickly, balancing path cost and estimated cost to the goal.",
      "Greedy Best-First":
        "Greedy: Uses heuristics to prioritize nodes closest to the goal, may not find the shortest path.",
      JPS: "Jump Point Search: Optimizes A* by eliminating symmetry and pruning nodes, enhancing speed.",
    };

    const statsDiv = document.createElement("div");
    statsDiv.classList.add("stats");
    statsDiv.innerHTML = `
    <p><strong>Algorithm:</strong> ${algorithmName}</p>
    <p><strong>Timer:</strong> <span id="timer${i}">0 ms</span></p>
    <p><strong>Tiles Explored:</strong> <span id="tiles${i}">0</span></p>
    <p class="algorithm-definition">${algorithmDefinitions[algorithmName]}</p>
`;

    multiMazesContainer.appendChild(mazeWrapper);
    multiMazesContainer.appendChild(statsDiv);

    solveMaze(
      mazeSize,
      Array.from(mazeWrapper.children),
      startPoint,
      targetPoint,
      i === 0
        ? "bfs"
        : i === 1
        ? "dfs"
        : i === 2
        ? "a_star"
        : i === 3
        ? "greedy"
        : "jps",
      document.getElementById(`timer${i}`),
      document.getElementById(`tiles${i}`)
    );
  }
}

generateMazeButton.addEventListener("click", async () => {
  await generateMazeGraph();
});

useMazeButton.addEventListener("click", () => {
  spawnAdditionalMazes();
});

createMazeGrid();
