import { Chess } from 'chess.js';
import { useEffect, useState, ReactNode } from 'react';

interface MovesheetProps {
  game: Chess;
}

export default function Movesheet({ game }: MovesheetProps) {
  const [moves, setMoves] = useState<ReactNode[]>([]);

  useEffect(() => {
    const history = game.history();
    console.log('Game history:', history);
    const newMoves = [];
    
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      
      newMoves.push(
        <div key={moveNumber} className="grid grid-cols-[5rem_4rem_4rem]">
          <div className="w-12 text-right">{moveNumber}.</div>
          <span className="truncate">{whiteMove}</span>
          {blackMove && <span className="truncate">{blackMove}</span>}
        </div>
      );
    }
    setMoves(newMoves);
  }, [game.fen()]);

  return (
    <div className="inline-block ml-4 align-top pt-4">
      <div className="bg-white p-4 rounded shadow w-[240px] h-[500px] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-white">Moves</h3>
        <div className="font-mono text-sm break-words">
          {moves}
        </div>
      </div>
    </div>
  );
} 