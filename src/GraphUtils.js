

const CELL_SIZE = 30;

const CELL_STATE = {
   // DEFAULT
   EMPTY: 'EMPTY',

   // USER INPUT
   START: 'START',
   END: 'END',
   WALL: 'WALL',

   PATH: 'PATH',
   VISITED: 'VISITED',
};

const CELL_STATE_COLOR = {
   [CELL_STATE.EMPTY]: 'white',
   [CELL_STATE.START]: 'green',
   [CELL_STATE.END]: 'red',
   [CELL_STATE.WALL]: 'black',
   [CELL_STATE.PATH]: 'blue',
   [CELL_STATE.VISITED]: 'yellow',
};


const SEARCH_ALGOS = {
   BFS: 'BFS',
   DFS: 'DFS',
   DIJKSTRA: 'DIJKSTRA',
};

export {
   CELL_SIZE,
   CELL_STATE_COLOR,
   CELL_STATE,
   SEARCH_ALGOS
};
