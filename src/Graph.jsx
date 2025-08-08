import { memo } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { CELL_STATE, CELL_STATE_COLOR } from "./GraphUtils";
import { useMemo } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import React from "react";
import { AsyncChannel } from "./Channel";







const Cell = memo(({ref, rowIdx, colIdx, cellHeight, cellWidth, color, onClick})=>{
   return(
      <Rect
        ref={ref}
        x={colIdx*cellWidth}
        y={rowIdx*cellHeight}
        width={cellWidth}
        height={cellHeight}
        stroke={'#ccc'}
        fill={color}
        strokeWidth={1}
        onClick={()=>{
            onClick(rowIdx, colIdx);
        }}
      />
   );
});


/**
    * @typedef {Object} GraphProps
    * @property {React.CSSProperties} style
    * @property {number} rows
    * @property {number} cols
    * @property {(row: number, col: number)=>void} onCellClick - Called when a cell is clicked
    * @property {string[][]} cellStateMatrix
    * @property {AsyncChannel<{row: number, col: number, cellState: string}>} cellColorChan
    */


/**
    * @param {GraphProps} props
    */
export default function({style, cellColorChan, cellStateMatrix, cellHeight, cellWidth, onCellClick}){

    const rows = cellStateMatrix.length;
    const cols = cellStateMatrix[0].length;


    const cellRefMatrix = useRef(
        Array
            .from({length: rows})
            .map(
                ()=>Array
                    .from({length: cols})
                    .map(()=>React.createRef())
            )
    );

    useEffect(()=>{
        const op = async()=>{
            while(true){
                const {value, done} = await cellColorChan.receive();
                if(done) return;
                const {row, col, cellState} = value;
                console.log(`Received: ${row}, ${col}, ${cellState}`);
                cellRefMatrix.current[row][col].current.fill(CELL_STATE_COLOR[cellState]);
            }
        }
        op();
    }, []);

    return (
        <Stage 
            style={style}
            height={rows*cellHeight} 
            width={cols*cellWidth}
        >
            <Layer>
                {cellStateMatrix.map((row, rowIdx)=>{
                    return row.map((cellState, colIdx)=>{
                        return (
                            <Cell 
                                ref={cellRefMatrix.current[rowIdx][colIdx]}
                                rowIdx={rowIdx}
                                colIdx={colIdx}
                                cellHeight={cellHeight}
                                cellWidth={cellWidth}
                                color={CELL_STATE_COLOR[cellState]} 
                                onClick={onCellClick}
                            />
                        );
                    })
                })}
            </Layer>
        </Stage>

    );
}
