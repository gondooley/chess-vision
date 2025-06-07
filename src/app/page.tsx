'use client';
import { useState, useEffect } from "react";
import MyChessboard from "@/app/components/Chessboard";
import Movesheet from "@/app/components/Movesheet";
import BoardAnalysisOptionsPanel from "./components/BoardAnalysisOptionsPanel";
import GameTree from '@/utils/GameTree';

export default function Home({ initialGameTree }: { initialGameTree?: GameTree }) {
  const [centralImportanceIsOn, setCentralImportanceIsOn] = useState(false);
  const [currentPlayerControlIsOn, setCurrentPlayerControlIsOn] = useState(false);
  const [waitingPlayerControlIsOn, setWaitingPlayerControlIsOn] = useState(false);
  const [reverseWeightsIsOn, setReverseWeightsIsOn] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [removeShading, setRemoveShading] = useState(false);
  const [gameTree, setGameTree] = useState<GameTree>(initialGameTree || new GameTree());
  const [position, setPosition] = useState<string>(gameTree.chessInstance.fen());
  const [moveTextInput, setMoveTextInput] = useState('');

  const handleAddMove = (move: string) => {
    try {
      const gameTreeCopy = gameTree.makeDuplicateTree();
      gameTreeCopy.addMove(move);
      setPosition(gameTreeCopy.chessInstance.fen());
      setGameTree(gameTreeCopy);
    } catch (error) {
      //bad moves fail silently for now so that the console is not cluttered in tests
      //TODO: add a proper error handling system
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const gameTreeCopy = gameTree.makeDuplicateTree();
    switch (event.key) {
      case 'ArrowLeft':
        if (gameTreeCopy.goToPrevious()) {
          setPosition(gameTreeCopy.chessInstance.fen());
        }
        break;
      case 'ArrowRight':
        // Navigate to next move in main line
        if (gameTreeCopy.goToNext()) {
          setPosition(gameTreeCopy.chessInstance.fen());
        }
        break;
      case 'ArrowUp':
        // Navigate to previous alternative
        if (gameTreeCopy.goToPreviousAlternative()) {
          setPosition(gameTreeCopy.chessInstance.fen());
        }
        break;
      case 'ArrowDown':
        // Navigate to next alternative
        if (gameTreeCopy.goToNextAlternative()) {
          setPosition(gameTreeCopy.chessInstance.fen());
        }
        break;
    }
    setGameTree(gameTreeCopy);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameTree]);

  return (
    <div className="p-4">
      <div className="inline-block">
        <MyChessboard
          autoPromoteToQueen={true}
          boardWidth={500}
          boardOrientation={isFlipped ? "black" : "white"}
          centralImportanceIsOn={centralImportanceIsOn}
          currentPlayerControlIsOn={currentPlayerControlIsOn}
          waitingPlayerControlIsOn={waitingPlayerControlIsOn}
          reverseWeightsIsOn={reverseWeightsIsOn}
          removeShading={removeShading}
          chessInstance={gameTree.chessInstance}
          position={position}
          addMove={handleAddMove}
        />
      </div>
      <div className="inline-block">
      <Movesheet gameTree={gameTree} currentMove={gameTree.current} />
      </div>
      <div className="inline-block">
      <BoardAnalysisOptionsPanel 
        centralImportanceIsOn={centralImportanceIsOn}
        setCentralImportanceIsOn={setCentralImportanceIsOn}
        currentPlayerControlIsOn={currentPlayerControlIsOn}
        setCurrentPlayerControlIsOn={setCurrentPlayerControlIsOn}
        waitingPlayerControlIsOn={waitingPlayerControlIsOn}
        setWaitingPlayerControlIsOn={setWaitingPlayerControlIsOn}
        reverseWeightsIsOn={reverseWeightsIsOn}
        setReverseWeightsIsOn={setReverseWeightsIsOn}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        removeShading={removeShading}
        setRemoveShading={setRemoveShading}
      />
      </div>
      <div className="inline-block">
        <input 
          type="text" 
          value={moveTextInput}
          onChange={(e) => setMoveTextInput(e.target.value)}
          placeholder="Enter move (e.g. Nf3, e4, O-O)"
          className="border p-2 mr-2"
          data-testid="move-text-input"
        />
        <button 
          onClick={() => {
            handleAddMove(moveTextInput);
            setMoveTextInput('');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          data-testid="move-text-submit-button"
        >
          Submit Move
        </button>
      </div>
    </div>
  );
}
