

/**
    * for showing purpose we will not update the matrix but update it when user selects something
    * i.e.
    * - updates only for original matrix manipulation
    * - ui updates to be sent using generator with cell number and color
    *
    *
    *
    *
    */


import { CELL_STATE, CELL_SIZE, SEARCH_ALGOS, CELL_STATE_COLOR } from "./GraphUtils";
import { useRef } from "react";
import Graph from "./Graph";
import { useState , useCallback, useEffect } from "react";
import { AsyncChannel } from "./Channel";
import { BFS, Dijkstra } from "./SearchAlgorithm";


/**
    * @typedef {import('./Types').Cell} Cell
    *
    */

export default function(){

    // decide the number of cells
    const width = window.innerWidth;
    const height = window.innerHeight;

    const rows = Math.floor(height/CELL_SIZE);
    const cols = Math.floor(width/CELL_SIZE);

    const [selectedCellState, setSelectedCellState] = useState(CELL_STATE.START);

    const startCell = useRef(/** @type {Cell|null} */ (null));
    const endCell = useRef(/** @type {Cell|null} */ (null));

    const cellStateMatrix = useRef(
        Array.from({length: rows})
            .map(()=>Array.from({length: cols}).map(()=>CELL_STATE.EMPTY))
    );

    const [selectedSearchAlgo, setSelectedSearchAlgo] = useState(SEARCH_ALGOS.BFS);

    const cellColorChan = useRef(/** @type {AsyncChannel<{row: number, col: number, cellState: string}>} */(new AsyncChannel()));

    const onCellClick = useCallback((row, col)=>{
        switch(selectedCellState){
            case CELL_STATE.WALL:
                if(cellStateMatrix.current[row][col] === CELL_STATE.WALL) {
                    cellStateMatrix.current[row][col] = CELL_STATE.EMPTY;
                    cellColorChan.current.send({
                        row, col, cellState: cellStateMatrix.current[row][col],
                    });
                    return;
                }
                cellStateMatrix.current[row][col] = CELL_STATE.WALL;
                cellColorChan.current.send({
                    row, col, cellState: cellStateMatrix.current[row][col],
                });
                break;

            case CELL_STATE.START:
                if(startCell.current) {
                    const { row, col } = startCell.current;
                    cellStateMatrix.current[row][col] = CELL_STATE.EMPTY;
                    cellColorChan.current.send({
                        row, col, cellState: cellStateMatrix.current[row][col],
                    });
                }
                startCell.current = {row, col};
                cellStateMatrix.current[row][col] = CELL_STATE.START;
                cellColorChan.current.send({
                    row, col, cellState: cellStateMatrix.current[row][col],
                });
                break;

            case CELL_STATE.END:
                if(endCell.current) {
                    const { row, col } = endCell.current;
                    cellStateMatrix.current[row][col] = CELL_STATE.EMPTY;
                    cellColorChan.current.send({
                        row, col, cellState: cellStateMatrix.current[row][col],
                    });
                }
                endCell.current = {row, col};
                cellStateMatrix.current[row][col] = CELL_STATE.END;
                cellColorChan.current.send({
                    row, col, cellState: cellStateMatrix.current[row][col],
                });
                break;
        }
    }, [selectedCellState]);

    const [shouldStartSearchAlgo, setShouldStartSearchAlgo] = useState(false);

    useEffect(()=>{
        if(!shouldStartSearchAlgo) {
            return;
        }

        if(!startCell.current || !endCell.current){
            alert('Start and End Cell required to start algorithm visualization');
            return;
        }

        /** @type {Generator<{row: number, col: number}, void, unknown>} */
        let visitedCellGen;

        switch(selectedSearchAlgo){
            case SEARCH_ALGOS.BFS:
                visitedCellGen = BFS(startCell.current, endCell.current, cellStateMatrix.current);
                break;
            case SEARCH_ALGOS.DIJKSTRA:
                visitedCellGen = Dijkstra(startCell.current, endCell.current, cellStateMatrix.current);
                break;
        }


        (async()=>{
            let result = visitedCellGen.next();
            while(!result.done){
                const value = result.value;
                cellColorChan.current.send({
                    row: value.row,
                    col: value.col,
                    cellState: CELL_STATE.VISITED,
                });
                await new Promise(res=>setTimeout(res, 50));

                result = visitedCellGen.next();
            }
        })();

        return ()=>{
            console.log('cleared useeffect for running search algo');
            visitedCellGen.return();
        }


    }, [shouldStartSearchAlgo, selectedSearchAlgo]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                height: '100vh',
                width: '100vw',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10
                }}
            >

                <select
                   value={selectedCellState}
                   onChange={e=>setSelectedCellState(e.target.value)}
                >
                   <option value={CELL_STATE.START}>{CELL_STATE.START}</option>
                   <option value={CELL_STATE.END}>{CELL_STATE.END}</option>
                   <option value={CELL_STATE.WALL}>{CELL_STATE.WALL}</option>
                </select>

                <select
                   value={selectedSearchAlgo}
                   onChange={e=>setSelectedSearchAlgo(e.target.value)}
                >
                    {Object.keys(SEARCH_ALGOS).map(searchAlgo=>{
                        return (
                            <option value={searchAlgo}>{searchAlgo}</option>
                        );
                    })}
                </select>

                <button onClick={()=>{setShouldStartSearchAlgo(true)}}>Start</button>
                <button onClick={()=>{setShouldStartSearchAlgo(false)}}>Stop</button>
                <button onClick={()=>{}}>Clear</button>
            </div>

            <Graph 
                style={{
                    width: '100%',
                    height: '100%',
                }} 
                cellColorChan={cellColorChan.current}
                cellStateMatrix={cellStateMatrix.current/* for initial coloring only */} 
                cellHeight={CELL_SIZE}
                cellWidth={CELL_SIZE}
                onCellClick={onCellClick}
            />
        </div>
    );
}
