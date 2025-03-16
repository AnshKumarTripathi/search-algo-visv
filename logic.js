async function solveMaze(
  mazeSize,
  cells,
  startPoint,
  targetPoint,
  algorithm,
  timerDisplay,
  tilesDisplay
) {
  const startTime = performance.now();
  let tilesExplored = 0;

  function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / mazeSize);
    const col = index % mazeSize;

    if (row > 0) neighbors.push(index - mazeSize);
    if (row < mazeSize - 1) neighbors.push(index + mazeSize);
    if (col > 0) neighbors.push(index - 1);
    if (col < mazeSize - 1) neighbors.push(index + 1);

    return neighbors.filter(
      (neighbor) => !cells[neighbor].classList.contains("wall")
    );
  }

  function heuristic(index) {
    const currentRow = Math.floor(index / mazeSize);
    const currentCol = index % mazeSize;
    const targetRow = Math.floor(targetPoint / mazeSize);
    const targetCol = targetPoint % mazeSize;
    return Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
  }

  async function bfs() {
    const queue = [startPoint];
    const visited = new Set();
    visited.add(startPoint);

    while (queue.length > 0) {
      const current = queue.shift();
      tilesExplored++;

      cells.forEach((cell) => cell.classList.remove("head"));
      cells[current].classList.add("head");
      cells[current].classList.add("visited");
      await new Promise((r) => setTimeout(r, 20));

      if (current === targetPoint) return true;

      for (const neighbor of getNeighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return false;
  }

  async function dfs() {
    const stack = [startPoint];
    const visited = new Set();
    visited.add(startPoint);

    while (stack.length > 0) {
      const current = stack.pop();
      tilesExplored++;

      cells.forEach((cell) => cell.classList.remove("head"));
      cells[current].classList.add("head");
      cells[current].classList.add("visited");
      await new Promise((r) => setTimeout(r, 20));

      if (current === targetPoint) return true;

      for (const neighbor of getNeighbors(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
    return false;
  }

  async function aStar() {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(startPoint, 0);
    fScore.set(startPoint, heuristic(startPoint));
    openSet.enqueue(startPoint, fScore.get(startPoint));

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();
      tilesExplored++;

      cells.forEach((cell) => {
        cell.classList.remove("head");
        if (
          !cell.classList.contains("start") &&
          !cell.classList.contains("target")
        ) {
          cell.textContent = "";
        }
      });
      cells[current].classList.add("head");
      cells[current].classList.add("visited");
      await new Promise((r) => setTimeout(r, 20));

      if (current === targetPoint) {
        reconstructPath(cameFrom, current);
        return true;
      }

      for (const neighbor of getNeighbors(current)) {
        const tentativeGScore = gScore.get(current) + 1;

        if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeGScore);
          fScore.set(neighbor, tentativeGScore + heuristic(neighbor));
          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(neighbor));
            if (
              !cells[neighbor].classList.contains("start") &&
              !cells[neighbor].classList.contains("target")
            ) {
              cells[neighbor].textContent = fScore.get(neighbor).toString();
            }
          }
        }
      }
    }
    return false;
  }

  async function greedyBestFirstSearch() {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const fScore = new Map();

    fScore.set(startPoint, heuristic(startPoint));
    openSet.enqueue(startPoint, fScore.get(startPoint));

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();
      tilesExplored++;

      cells.forEach((cell) => {
        cell.classList.remove("head");
      });
      cells[current].classList.add("head");
      cells[current].classList.add("visited");
      await new Promise((r) => setTimeout(r, 20));

      if (current === targetPoint) {
        reconstructPath(cameFrom, current);
        return true;
      }

      for (const neighbor of getNeighbors(current)) {
        if (
          !fScore.has(neighbor) ||
          heuristic(neighbor) < fScore.get(neighbor)
        ) {
          cameFrom.set(neighbor, current);
          fScore.set(neighbor, heuristic(neighbor));
          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(neighbor));
          }
        }
      }
    }
    return false;
  }

  function reconstructPath(cameFrom, current) {
    let path = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      path.unshift(current);
    }
    path.forEach((index) => cells[index].classList.add("path"));
  }

  class PriorityQueue {
    constructor() {
      this.elements = [];
    }

    isEmpty() {
      return this.elements.length === 0;
    }

    enqueue(item, priority) {
      this.elements.push({ item, priority });
      this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
      return this.elements.shift().item;
    }

    contains(item) {
      return this.elements.some((element) => element.item === item);
    }
  }

  function getDirection(dx, dy) {
    if (dx !== 0 && dy !== 0) return { dx, dy };
    if (dx !== 0) return { dx, dy: 0 };
    return { dx: 0, dy };
  }

  function isWall(cells, index, mazeSize) {
    if (index < 0 || index >= cells.length) return true;
    return cells[index].classList.contains("wall");
  }

  function getIndex(x, y, mazeSize) {
    return y * mazeSize + x;
  }

  function getCoordinates(index, mazeSize) {
    return { x: index % mazeSize, y: Math.floor(index / mazeSize) };
  }

  function jump(cells, current, dx, dy, startPoint, targetPoint, mazeSize) {
    const nextX = current.x + dx;
    const nextY = current.y + dy;
    const nextIndex = getIndex(nextX, nextY, mazeSize);

    if (isWall(cells, nextIndex, mazeSize)) return null;
    if (nextIndex === targetPoint) return nextIndex;

    if (dx !== 0 && dy !== 0) {
      if (
        (!isWall(
          cells,
          getIndex(current.x + dx, current.y, mazeSize),
          mazeSize
        ) &&
          isWall(
            cells,
            getIndex(current.x + dx, current.y + dy, mazeSize),
            mazeSize
          )) ||
        (isWall(
          cells,
          getIndex(current.x, current.y + dy, mazeSize),
          mazeSize
        ) &&
          !isWall(
            cells,
            getIndex(current.x + dx, current.y + dy, mazeSize),
            mazeSize
          ))
      ) {
        return nextIndex;
      }
    } else {
      if (dx !== 0) {
        if (
          (!isWall(
            cells,
            getIndex(current.x, current.y - 1, mazeSize),
            mazeSize
          ) &&
            isWall(
              cells,
              getIndex(current.x + dx, current.y - 1, mazeSize),
              mazeSize
            )) ||
          (!isWall(
            cells,
            getIndex(current.x, current.y + 1, mazeSize),
            mazeSize
          ) &&
            isWall(
              cells,
              getIndex(current.x + dx, current.y + 1, mazeSize),
              mazeSize
            ))
        ) {
          return nextIndex;
        }
      } else {
        if (
          (!isWall(
            cells,
            getIndex(current.x - 1, current.y, mazeSize),
            mazeSize
          ) &&
            isWall(
              cells,
              getIndex(current.x - 1, current.y + dy, mazeSize),
              mazeSize
            )) ||
          (!isWall(
            cells,
            getIndex(current.x + 1, current.y, mazeSize),
            mazeSize
          ) &&
            isWall(
              cells,
              getIndex(current.x + 1, current.y + dy, mazeSize),
              mazeSize
            ))
        ) {
          return nextIndex;
        }
      }
    }

    const jumpResult = jump(
      cells,
      { x: nextX, y: nextY },
      dx,
      dy,
      startPoint,
      targetPoint,
      mazeSize
    );
    if (jumpResult !== null) return nextIndex;

    return null;
  }

  async function jps(cells, startPoint, targetPoint, mazeSize) {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(startPoint, 0);
    fScore.set(startPoint, heuristic(startPoint));
    openSet.enqueue(startPoint, fScore.get(startPoint));

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();
      tilesExplored++;

      cells.forEach((cell) => cell.classList.remove("head"));
      cells[current].classList.add("head");
      cells[current].classList.add("visited");
      await new Promise((r) => setTimeout(r, 20));

      if (current === targetPoint) {
        reconstructPath(cameFrom, current);
        return true;
      }

      const currentCoords = getCoordinates(current, mazeSize);
      const neighbors = getNeighbors(current);

      for (const neighbor of neighbors) {
        const neighborCoords = getCoordinates(neighbor, mazeSize);
        const dir = getDirection(
          neighborCoords.x - currentCoords.x,
          neighborCoords.y - currentCoords.y
        );
        const jumpPoint = jump(
          cells,
          currentCoords,
          dir.dx,
          dir.dy,
          startPoint,
          targetPoint,
          mazeSize
        );

        if (jumpPoint !== null) {
          const tentativeGScore =
            gScore.get(current) +
            Math.abs(currentCoords.x - getCoordinates(jumpPoint, mazeSize).x) +
            Math.abs(currentCoords.y - getCoordinates(jumpPoint, mazeSize).y);

          if (
            !gScore.has(jumpPoint) ||
            tentativeGScore < gScore.get(jumpPoint)
          ) {
            cameFrom.set(jumpPoint, current);
            gScore.set(jumpPoint, tentativeGScore);
            fScore.set(jumpPoint, tentativeGScore + heuristic(jumpPoint));

            if (!openSet.contains(jumpPoint)) {
              openSet.enqueue(jumpPoint, fScore.get(jumpPoint));
            }
          }
        }
      }
    }
    return false;
  }

  let found = false;
  if (algorithm === "bfs") {
    found = await bfs();
  } else if (algorithm === "dfs") {
    found = await dfs();
  } else if (algorithm === "a_star") {
    found = await aStar();
  } else if (algorithm === "greedy") {
    found = await greedyBestFirstSearch();
  } else if (algorithm === "jps") {
    found = await jps(cells, startPoint, targetPoint, mazeSize);
  } else {
    alert("Algorithm not implemented yet!");
  }

  const endTime = performance.now();
  timerDisplay.textContent = `${Math.round(endTime - startTime)} ms`;
  tilesDisplay.textContent = tilesExplored;

  if (!found) {
    alert("Path not found!");
  }
}

// ... your existing solveMaze function ...

// document.getElementById("ultraInstinctButton").addEventListener("click", () => {
//   clearPath();
//   const path = ultraInstinct(mazeLayout, startPoint, targetPoint);
//   if (path) {
//     visualizePath(path, "path");
//   } else {
//     alert("Ultra Instinct failed to find a path.");
//   }
// });

// function ultraInstinct(grid, start, target) {
//   const rows = Math.sqrt(grid.length);
//   const cols = Math.sqrt(grid.length);
//   const visited = new Set();
//   const path = new Map();
//   const exploredNodes = [convertIndexToCoords(start, rows)];

//   visited.add(start.toString());
//   path.set(start.toString(), null);

//   let currentNode = convertIndexToCoords(start, rows);

//   while (true) {
//     if (convertCoordsToIndex(currentNode, rows) === target) {
//       return reconstructPath(path, target);
//     }

//     const validUnvisited = [];
//     for (let r = 0; r < rows; r++) {
//       for (let c = 0; c < cols; c++) {
//         const node = { row: r, col: c };
//         if (
//           grid[convertCoordsToIndex(node, rows)] !== "wall" &&
//           !visited.has(convertCoordsToIndex(node, rows).toString())
//         ) {
//           validUnvisited.push(node);
//         }
//       }
//     }

//     if (validUnvisited.length === 0) {
//       return null;
//     }

//     const jumpNode =
//       validUnvisited[Math.floor(Math.random() * validUnvisited.length)];

//     const nearestExplored = findNearestExplored(jumpNode, exploredNodes);
//     if (!nearestExplored) {
//       return null;
//     }

//     const connectingPath = connectNodes(grid, jumpNode, nearestExplored, rows);

//     for (const node of connectingPath) {
//       if (convertCoordsToIndex(node, rows) === target) {
//         for (const node2 of connectingPath) {
//           if (!path.has(convertCoordsToIndex(node2, rows).toString())) {
//             path.set(
//               convertCoordsToIndex(node2, rows).toString(),
//               path.get(convertCoordsToIndex(nearestExplored, rows).toString())
//             );
//           }
//         }
//         return reconstructPath(path, target);
//       }
//     }

//     for (const node of connectingPath) {
//       visited.add(convertCoordsToIndex(node, rows).toString());
//       exploredNodes.push(node);
//       if (!path.has(convertCoordsToIndex(node, rows).toString())) {
//         path.set(
//           convertCoordsToIndex(node, rows).toString(),
//           path.get(convertCoordsToIndex(nearestExplored, rows).toString())
//         );
//       }
//     }
//     currentNode = jumpNode;
//   }

//   function findNearestExplored(node, explored) {
//     let nearest = null;
//     let minDistance = Infinity;

//     for (const exploredNode of explored) {
//       const dist =
//         Math.abs(node.row - exploredNode.row) +
//         Math.abs(node.col - exploredNode.col);
//       if (dist < minDistance) {
//         minDistance = dist;
//         nearest = exploredNode;
//       }
//     }
//     return nearest;
//   }

//   function connectNodes(grid, startNode, endNode, mazeSize) {
//     const path = [];
//     let currentRow = startNode.row;
//     let currentCol = startNode.col;

//     while (currentRow !== endNode.row || currentCol !== endNode.col) {
//       path.push({ row: currentRow, col: currentCol });

//       if (
//         currentRow < endNode.row &&
//         grid[
//           convertCoordsToIndex(
//             { row: currentRow + 1, col: currentCol },
//             mazeSize
//           )
//         ] !== "wall"
//       ) {
//         currentRow++;
//       } else if (
//         currentRow > endNode.row &&
//         grid[
//           convertCoordsToIndex(
//             { row: currentRow - 1, col: currentCol },
//             mazeSize
//           )
//         ] !== "wall"
//       ) {
//         currentRow--;
//       } else if (
//         currentCol < endNode.col &&
//         grid[
//           convertCoordsToIndex(
//             { row: currentRow, col: currentCol + 1 },
//             mazeSize
//           )
//         ] !== "wall"
//       ) {
//         currentCol++;
//       } else if (
//         currentCol > endNode.col &&
//         grid[
//           convertCoordsToIndex(
//             { row: currentRow, col: currentCol - 1 },
//             mazeSize
//           )
//         ] !== "wall"
//       ) {
//         currentCol--;
//       } else {
//         return [];
//       }
//     }
//     path.push({ row: currentRow, col: currentCol });
//     return path;
//   }

//   function reconstructPath(path, target) {
//     const result = [];
//     let current = target.toString();

//     while (current) {
//       const node = current.split(",").map(Number);
//       result.unshift({ row: node[0], col: node[1] });
//       current = path.get(current);
//     }
//     return result;
//   }
// }

// function convertIndexToCoords(index, mazeSize) {
//   return { row: Math.floor(index / mazeSize), col: index % mazeSize };
// }

// function convertCoordsToIndex(coords, mazeSize) {
//   return coords.row * mazeSize + coords.col;
// }
// function visualizePath(path, className) {
//   path.forEach((node) => {
//     const index = convertCoordsToIndex(node, Math.sqrt(mazeLayout.length));
//     const cell = document.querySelector(`[data-index="${index}"]`);
//     if (cell) {
//       cell.classList.add(className);
//     }
//   });
// }
// function clearPath() {
//   const pathCells = document.querySelectorAll(".path, .visited, .head");
//   pathCells.forEach((cell) => {
//     cell.classList.remove("path", "visited", "head");
//   });
// }
