'use client';

import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
    BoardWeights,
    addCurrentPlayerControlColours,
    addCentralControlColours,
    addWaitingPlayerControlColours
} from "@/utils/controlAnalysis";
import { Piece } from 'react-chessboard/dist/chessboard/types';
import { Square } from 'react-chessboard/dist/chessboard/types';

export const handleChessMove = (
    sourceSquare: Square, 
    targetSquare: Square, 
    chessInstance: Chess, 
    addMove: (move: string) => void
): boolean => {
    try {
        const move = chessInstance.move({
            from: sourceSquare,
            to: targetSquare
        });
        if (move) {
            addMove(move.san);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

interface MyChessboardProps {
    autoPromoteToQueen: boolean;
    boardWidth: number;
    boardOrientation: "white" | "black";
    centralImportanceIsOn: boolean;
    currentPlayerControlIsOn: boolean;
    waitingPlayerControlIsOn: boolean;
    reverseWeightsIsOn: boolean;
    removeShading: boolean;
    chessInstance: Chess;
    position: string;
    addMove: (move: string) => void;
}

const MyChessboard = ({
    autoPromoteToQueen,
    boardWidth,
    boardOrientation,
    centralImportanceIsOn,
    currentPlayerControlIsOn,
    waitingPlayerControlIsOn,
    reverseWeightsIsOn,
    removeShading,
    chessInstance,
    position,
    addMove } : MyChessboardProps) => {

    const [localCustomSquareStyles, setLocalCustomSquareStyles] = useState<{ [key: string]: { backgroundColor: string } }>({});

    const onDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
        return handleChessMove(sourceSquare, targetSquare, chessInstance, addMove);
    }

    useLayoutEffect(() => {
        if (!chessInstance) return;
        let currentColors = new BoardWeights();

        if (currentPlayerControlIsOn || waitingPlayerControlIsOn || centralImportanceIsOn) {

            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    const isDark = (rank + file) % 2 === 1;
                    currentColors.weights[rank][file] = (removeShading || isDark) ? "rgb(21, 21, 21)" : "rgb(31, 31, 31)";
                }
            }

            if (centralImportanceIsOn) {
                currentColors = addCentralControlColours(currentColors);
            }
            if (currentPlayerControlIsOn) {
                currentColors = addCurrentPlayerControlColours(currentColors, chessInstance, reverseWeightsIsOn);
            }
            if (waitingPlayerControlIsOn) {
                currentColors = addWaitingPlayerControlColours(currentColors, chessInstance, reverseWeightsIsOn);
            }

            const newSquareStyles: { [key: string]: { backgroundColor: string } } = {};
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    const square = String.fromCharCode(97 + file) + (8 - rank);
                    newSquareStyles[square] = { backgroundColor: currentColors.weights[rank][file] };
                }
            }

            setLocalCustomSquareStyles(newSquareStyles);
        } else {
            setLocalCustomSquareStyles({});
        }
    }, [
        currentPlayerControlIsOn,
        centralImportanceIsOn,
        waitingPlayerControlIsOn,
        reverseWeightsIsOn,
        removeShading,
        chessInstance,
    ]);

    return <Chessboard
        position={position}
        onPieceDrop={onDrop}
        autoPromoteToQueen={autoPromoteToQueen}
        boardWidth={boardWidth}
        boardOrientation={boardOrientation}
        customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
        }}
        customSquareStyles={localCustomSquareStyles}
    />;
};

export default MyChessboard;