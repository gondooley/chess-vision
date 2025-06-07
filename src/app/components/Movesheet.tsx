import GameTree from '@/utils/GameTree';
import GameTreeNode from '@/utils/GameTreeNode';
import { useState, ReactNode, useLayoutEffect } from 'react';

interface MovesheetProps {
  gameTree: GameTree;
  currentMove: GameTreeNode | null;
}

export default function Movesheet({ gameTree, currentMove }: MovesheetProps) {
  const [movesDisplay, setMovesDisplay] = useState<ReactNode[]>([]);


  useLayoutEffect(() => {
    if (!gameTree || !gameTree.root || !gameTree.root.next) {
      return;
    }

    const newMoves: ReactNode[] = [];
    let key = 0;

    function moveSpan(node: GameTreeNode) {
      return node === currentMove ?
        <span key={key++} className="font-bold bg-yellow-200"
          data-testid="highlighted move">{node.move}</span> :
        <span key={key++}>{node.move}&nbsp;</span>;
    }

    let openParen = '(';
    let closeParen = ')';

    function startLine(node: GameTreeNode) {
      newMoves.push(moveSpan(node));
      if (node.alternatives.length > 0) {
        newMoves.push(<span key={key++}>{openParen}</span>);
        node.alternatives.forEach((alt, i) => {
          if (i > 0) newMoves.push(<span key={key++}>,&nbsp;</span>);
          startLine(alt);
        });
        newMoves.push(<span key={key++}>{closeParen}</span>);
      }
      if (node.next) {
        startLine(node.next);
      }
    }

    startLine(gameTree.root.next);

    // for (let i = 0; i < mainLine.length; i += 2) {
    //   const moveNumber = Math.floor(i / 2) + 1;
    //   const whiteMove = mainLine[i];
    //   const blackMove = mainLine[i + 1];
    //   let whiteMoveComponent: ReactNode;
    //   let blackMoveComponent: ReactNode;
    //   if (whiteMove === currentMove) {
    //     whiteMoveComponent = <span className="truncate font-bold bg-yellow-200" data-testid="highlighted move">{whiteMove.move}</span>;
    //   } else {
    //     whiteMoveComponent = <span className="truncate">{whiteMove.move}</span>;
    //   }
    //   if (blackMove) {
    //     if (blackMove === currentMove) {
    //       blackMoveComponent = <span className="truncate font-bold bg-yellow-200" data-testid="highlighted move">{blackMove.move}</span>;
    //     } else {
    //       blackMoveComponent = <span className="truncate">{blackMove.move}</span>;
    //     }
    //   }

    // newMoves.push(
    //   <div key={moveNumber} className="grid grid-cols-[5rem_4rem_4rem]">
    //     <div className="w-12 text-right">{moveNumber}.</div>
    //     {whiteMoveComponent}
    //     {blackMove && blackMoveComponent}
    //   </div>
    // );
    // }
    setMovesDisplay(newMoves);
  }, [currentMove, gameTree]);

  return (
    <div className="inline-block ml-4 align-top pt-4" data-testid="movesheet">
      <div className="bg-white p-4 rounded shadow w-[240px] h-[500px] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-white">Moves</h3>
        <div className="font-mono text-sm break-words">
          {movesDisplay}
        </div>
      </div>
    </div>
  );
} 