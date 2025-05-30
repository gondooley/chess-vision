'use client';
import { useState, useRef, useLayoutEffect } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { BoardWeights, addAttackingControlColours, addCentralControlColours, addDefendingControlColours } from "@/utils/controlAnalysis";
import Movesheet from "@/app/components/Movesheet";
import ToggleSwitch from "@/app/components/ToggleSwitch";

export default function Home() {
  const gameRef = useRef<Chess>(new Chess());
  const [centralImportanceIsOn, setCentralImportanceIsOn] = useState(false);
  const [attackingControlIsOn, setAttackingControlIsOn] = useState(false);
  const [defendingControlIsOn, setDefendingControlIsOn] = useState(false);
  const [reverseWeightsIsOn, setReverseWeightsIsOn] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [removeShading, setRemoveShading] = useState(false);
  const [customSquareStyles, setCustomSquareStyles] = useState<{ [key: string]: { backgroundColor: string } }>({});
  const [gameState, setGameState] = useState(gameRef.current.fen());

  useLayoutEffect(() => {
    let currentColors = new BoardWeights();

    if (attackingControlIsOn || defendingControlIsOn || centralImportanceIsOn) {
      if (!removeShading) {
        for (let rank = 0; rank < 8; rank++) {
          for (let file = 0; file < 8; file++) {
            const isDark = (rank + file) % 2 === 1;
            currentColors.weights[rank][file] = isDark ? "rgb(21, 21, 21)" : "rgb(31, 31, 31)";
          }
        }
      }

      if (centralImportanceIsOn) {
        currentColors = addCentralControlColours(currentColors);
      }

      if (attackingControlIsOn) {
        currentColors = addAttackingControlColours(currentColors, gameRef.current, reverseWeightsIsOn);
      }

      if (defendingControlIsOn) {
        currentColors = addDefendingControlColours(currentColors, gameRef.current, reverseWeightsIsOn);
      }

      const newSquareStyles: { [key: string]: { backgroundColor: string } } = {};
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const square = String.fromCharCode(97 + file) + (8 - rank);
          newSquareStyles[square] = { backgroundColor: currentColors.weights[rank][file] };
        }
      }
      setCustomSquareStyles(newSquareStyles);
    } else {
      setCustomSquareStyles({});
    }
  }, [attackingControlIsOn, centralImportanceIsOn, defendingControlIsOn, reverseWeightsIsOn, removeShading]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    try {
      const move = gameRef.current.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q'
      });
      if (move) {
        setGameState(gameRef.current.fen());
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  return (
    <div className="p-4">
      <div className="inline-block">
        <Chessboard
          position={gameState}
          onPieceDrop={onDrop}
          autoPromoteToQueen={true}
          boardWidth={500}
          boardOrientation={isFlipped ? "black" : "white"}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
          }}
          customSquareStyles={customSquareStyles}
        />
      </div>
      <Movesheet game={gameRef.current} />
      <div className="inline-block ml-4 align-top pt-4">
        <div className="flex flex-col gap-2">
          <ToggleSwitch
            color="blue"
            label="Show Central Importance"
            checked={centralImportanceIsOn}
            onChange={() => setCentralImportanceIsOn(!centralImportanceIsOn)}
          />
          <ToggleSwitch
            color="green"
            label="Show Attacking Control"
            checked={attackingControlIsOn}
            onChange={() => setAttackingControlIsOn(!attackingControlIsOn)}
          />
          <ToggleSwitch
            color="red"
            label="Show Defending Control"
            checked={defendingControlIsOn}
            onChange={() => setDefendingControlIsOn(!defendingControlIsOn)}
          />
          <ToggleSwitch
            color="purple"
            label="Calculate by Reverse-Weights"
            checked={reverseWeightsIsOn}
            onChange={() => setReverseWeightsIsOn(!reverseWeightsIsOn)}
          />
          <ToggleSwitch
            color="yellow"
            label="Flip Board"
            checked={isFlipped}
            onChange={() => setIsFlipped(!isFlipped)}
          />
          <ToggleSwitch
            color="gray"
            label="Remove Square Shading"
            checked={removeShading}
            onChange={() => setRemoveShading(!removeShading)}
          />
        </div>
      </div>
    </div>
  );
}
