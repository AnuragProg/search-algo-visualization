import { CELL_STATE } from './GraphUtils';


/** @typedef {import('./Types').Cell} Cell */

/**
   *
   * @param {Cell} start 
   * @param {Cell} end 
   * @param {string[][]} pathMatrix
   *
   */
function* DFS(start, end, pathMatrix){

}

/**
   *
   * @param {Cell} start 
   * @param {Cell} end 
   * @param {string[][]} pathMatrix
   *
   */
function* BFS(start, end, pathMatrix){
   const rows = pathMatrix.length;
   const cols = pathMatrix[0].length;

   const visited = Array.from({length: rows}, ()=>Array.from({length: cols}, ()=>false));
   
   /** @type {Cell[]} */
   const queue = [];

   queue.push(start);
   visited[start.row][start.col] = true;

   const dirs = [
      [-1, 0],
      [+1, 0],
      [0, -1],
      [0, +1],
   ];

   while(queue.length > 0){
      /** @type {Cell} */
      const cell = queue.shift();
      const {row, col} = cell;

      if(row == end.row && col == end.col){
         return;
      }

      for(const [dr, dc] of dirs){
         console.log(`dr:dc = ${dr}:${dc}`);
         const nr = row + dr;
         const nc = col + dc;

         if(nr < 0 || nr >= rows || nc < 0 || nc >= cols){
            continue;
         }

         if(nr==end.row && nc==end.col) return;

         if(visited[nr][nc] || pathMatrix[nr][nc]!==CELL_STATE.EMPTY){
            continue;
         }

         queue.push({row: nr, col: nc});
         visited[nr][nc] = true;

         yield {row: nr, col: nc};
      }
   }
}

/**
   *
   * @param {Cell} start 
   * @param {Cell} end 
   * @param {string[][]} pathMatrix
   *
   */
function* Dijkstra(start, end, pathMatrix){
   console.log('dijkstra algorithm started');

   const rows = pathMatrix.length;
   const cols = pathMatrix[0].length;
   console.log(`pathmatrix dim ${rows}x${cols}`);

   const dirs = [
      [-1, 0],
      [+1, 0],
      [0, -1],
      [0, +1],
   ];

   // Calculate row and col for idx of flattened 2d array
   const calcRowAndCol = (idx)=>({row: Math.floor(idx/cols), col: idx%cols});

   // Calculate idx of flattened 2d array for row and col of 2d array
   const calcIdx = (row, col)=>row*cols+col;

   console.log('calcrowandcol and calcidx created');

   const total = rows*cols;
   console.log(`total = ${total}`);
   const flatPathMatrix = Array.from({length: total})
      .map((_, idx)=>{
         const {row, col} = calcRowAndCol(idx);
         return {
            row: row,
            col: col,
            distance: Infinity,
            predecessor: null,
            visited: false,
         };
      });
   console.log(`flatpath matrix created: ${JSON.stringify(flatPathMatrix)}`);
   console.log(`flatpath matrix length: ${flatPathMatrix.length}`);
   console.log(`row, col: ${start.row}, ${start.col} | idx = ${calcIdx(start.row, start.col)}`);
   flatPathMatrix[calcIdx(start.row, start.col)].distance = 0;

   while(true){
      console.log('running loop');
      const current = flatPathMatrix.reduce((min, cur)=>{
         const isVisitedOrNotVisitable = 
            cur.visited ||
            ([CELL_STATE.START, CELL_STATE.END, CELL_STATE.EMPTY].indexOf(pathMatrix[cur.row][cur.col]) === -1);

         if(isVisitedOrNotVisitable) return min;

         if(min===null){ // if not selected then return current one
            return cur;
         }

         if(min.distance > cur.distance){ // return minimum distance one
            return cur;
         }

         return min;

      }, null);
      console.log(`Current = ${JSON.stringify(current)}`);

      if(current===null || current.distance===Infinity){
         return; // no more nodes left or all unreachable nodes left
      }

      current.visited = true;

      const isStartCell = current.row == start.row && current.col == start.col;
      const isEndCell = current.row == end.row && current.col == end.col;
      if(!isStartCell && !isEndCell){
         yield {row: current.row, col: current.col};
      }

      for(const [dr, dc] of dirs){
         const nr = current.row + dr;
         const nc = current.col + dc;
         const nidx = calcIdx(nr, nc);

         if(nr < 0 || nr >= rows || nc < 0 || nc >= cols){
            continue;
         }

         const isVisitable = [CELL_STATE.EMPTY, CELL_STATE.END].includes(pathMatrix[nr][nc]);
         if(!isVisitable) continue;

         const newDistance = current.distance + 1;
         if(newDistance < flatPathMatrix[nidx].distance){
            flatPathMatrix[nidx].distance = newDistance;
            flatPathMatrix[nidx].predecessor = calcIdx(current.row, current.col); 
         }
      }

   }

}


export {
   BFS,
   DFS,
   Dijkstra,
};
