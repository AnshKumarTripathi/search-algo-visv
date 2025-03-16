# Pathfinding Algorithm Visualizer

This project is a web-based visualization tool that demonstrates five common pathfinding algorithms: Depth-First Search (DFS), Breadth-First Search (BFS), Greedy Best-First Search, Jump Point Search (JPS), and A*.

## Features

* **Interactive Grid:** Create custom mazes by toggling walls on a grid.
* **Start and Target Selection:** Easily define the start and target points for the algorithms.
* **Algorithm Selection:** Choose from DFS, BFS, Greedy Best-First, JPS, and A* algorithms.
* **Visualization:** Watch the step-by-step execution of each algorithm.
* **Clear Grid Functionality:** Reset the grid to its initial state.
* **Clear Path Functionality:** Clear the path found, but keep the walls.

## How to Use

1.  **Set Start and Target:** Click on cells to set the start and target points.
2.  **Create Walls:** Click on cells to toggle walls and create your maze.
3.  **Select Algorithm:** Choose an algorithm from the selection dropdown.
4.  **Run Algorithm:** Click the "Visualize" button to start the visualization.
5.  **Clear Path:** Click the "Clear Path" button to remove the path.
6.  **Reset Grid:** Click the "Reset Grid" button to clear the grid and reset the start and target.

## Algorithms Implemented

* **Depth-First Search (DFS):** Explores as far as possible along each branch before backtracking.
* **Breadth-First Search (BFS):** Explores all the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.
* **Greedy Best-First Search:** Uses a heuristic to estimate the cost to the goal and selects the node closest to the goal.
* **Jump Point Search (JPS):** An optimization of A* that reduces the number of nodes expanded by "jumping" over intermediate nodes.
* **A* Search:** Combines the heuristic of Greedy Best-First Search with the cost of reaching each node, guaranteeing an optimal path.

## Deployment

This project is designed to be easily deployed on platforms like Render's free tier.


## Files

* `index.html`: The main HTML file containing the grid, UI elements, and algorithm selection.
* `{maze,logic}.js` (or similar): The JavaScript file containing the pathfinding algorithms and visualization logic.
* `style.css`: The CSS file for styling the grid and UI.
* `README.md`: This file.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues.

## License

This project is licensed under the MIT License.
