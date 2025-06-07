import { describe, it, expect, beforeEach } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react';
import GameTree from '@/utils/GameTree';
import Home from '@/app/page';

const initialPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const positionAfter1d4 = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR';
const positionAfter1e4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
const positionAfter1e4c5 = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR';
const positionAfter1e4e5 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR';
const positionAfter1e4e5_2Nf3 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R';
const positionAfter1e4e6 = 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR'

let newTestGameTree: GameTree;
let container: HTMLElement;
let e4Square: HTMLElement | null;

beforeEach(() => {
  newTestGameTree = new GameTree();
});

// These tests will all pass before changes
describe('GameTree.ts tests', () => {

  describe('Testing GameTree basic functionality', () => {
    it('should have no moves in its current line when created', () => {
      expect(newTestGameTree.currentLineToCurrentNode.length).toEqual(0);
    });
    it('should have no moves in its main line when created', () => {
      expect(newTestGameTree.getMainLine().length).toEqual(0);
    });
    it('should have a chess instance when created', () => {
      expect(newTestGameTree.chessInstance).toBeDefined();
    });
    it('should have 20 moves possible (for both white and black) in its chess instance when created', () => {
      expect(newTestGameTree.chessInstance.moves().length).toEqual(20);
      expect(newTestGameTree.chessInstance.moves({ verbose: true }).length).toEqual(20);
    });
    it('should have a chess instance with the correct fen when created', () => {
      expect(newTestGameTree.chessInstance.fen()).toEqual('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });
    it('should have a chess instance with the correct turn when created', () => {
      expect(newTestGameTree.chessInstance.turn()).toEqual('w');
    });
  });

  describe('Test game tree adding moves', () => {
    it('should have two moves when e4 and e5 are added', () => {
      newTestGameTree.addMove('e4');
      newTestGameTree.addMove('e5');
      expect(newTestGameTree.currentLineToCurrentNode.length).toBe(2);
    });
  });
});

describe('Components tests', () => {

  beforeEach(() => {
    newTestGameTree.addMove('e4');
    newTestGameTree.addMove('e5');
    ({ container } = render(<Home initialGameTree={newTestGameTree} />));
  });

  function pressKey(key: string) {
    fireEvent.keyDown(container, { key });
  }

  function pressArrowLeft() {
    pressKey('ArrowLeft');
  }

  function pressArrowRight() {
    pressKey('ArrowRight');
  }

  function pressArrowUp() {
    pressKey('ArrowUp');
  }

  function pressArrowDown() {
    pressKey('ArrowDown');
  }

  function addMove(move: string) {
    const moveInput = container.querySelector('[data-testid="move-text-input"]') as HTMLInputElement;
    fireEvent.change(moveInput, { target: { value: move } });
    fireEvent.click(container.querySelector('[data-testid="move-text-submit-button"]')!);
  }

  describe('Movesheet.test.tsx tests', () => {

    function getHighlightedMove() {
      return container.querySelector('[data-testid="highlighted move"]')!;
    }

    function expectHighlightedMoveToBe(move: string) {
      expect(getHighlightedMove().textContent).toBe(move);
    }

    describe('Testing movesheet presence', () => {
      // this passes before changes
      it('should have a movesheet', () => {
        const movesheet = container.querySelector('[data-testid="movesheet"]');
        expect(movesheet).toBeDefined();
      });
    });

    describe('Appropriate move sheet moves highlighted under navigation with arrow keys', () => {
      it("should highlight previous move when left arrow is pressed", () => {
        pressArrowLeft();
        expectHighlightedMoveToBe('e4');
      });

      it("should go to next move when right arrow is pressed", () => {
        pressArrowLeft();
        pressArrowLeft();
        pressArrowRight();
        expectHighlightedMoveToBe('e4');
      });
    });

    describe('Highlighting entered move text', () => {
      // this passes before changes
      it("should highlight the added move", () => {
        addMove('Nf3');
        expectHighlightedMoveToBe('Nf3');
      });
    });

    // These pass before changes because the addMove function originally overwrote
    // the existing move, so the highlighted move was always the last move added.
    describe('Highlighting added alternate moves', () => {
      it("should highlight the alternate move when it is added", () => {
        pressArrowLeft();
        addMove('c5');
        expectHighlightedMoveToBe('c5');
      });

      it("should highlight the alternate move when it is added as the very first move", () => {
        pressArrowLeft();
        pressArrowLeft();
        addMove('d4');
        expectHighlightedMoveToBe('d4');
      });
    });

    describe('Highlighting navigated alternate moves', () => {
      it("should highlight the main line move when right arrow is pressed, regardless of alternate moves", () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowLeft();
        pressArrowRight();
        expectHighlightedMoveToBe('e5');
      });

      it("should highlight the main move and the alternate move alternately, when the up arrow is pressed", () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowUp();
        expectHighlightedMoveToBe('e5');
        pressArrowUp();
        expectHighlightedMoveToBe('c5');
        pressArrowUp();
        expectHighlightedMoveToBe('e5');
      });

      it("should highlight the main move and the alternate move alternately, when the down arrow is pressed", () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowDown();
        expectHighlightedMoveToBe('e5');
        pressArrowDown();
        expectHighlightedMoveToBe('c5');
        pressArrowDown();
        expectHighlightedMoveToBe('e5');
      });

      it("if multiple alternate moves exist, should highlight the next one when down arrow is pressed", () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowLeft();
        addMove('e6');
        pressArrowDown();
        expectHighlightedMoveToBe('e5');
        pressArrowDown();
        expectHighlightedMoveToBe('c5');
        pressArrowDown();
        expectHighlightedMoveToBe('e6');
        pressArrowDown();
        expectHighlightedMoveToBe('e5');
      });

      it("if multiple alternate moves exist, should highlight the previous one when up arrow is pressed", () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowLeft();
        addMove('e6');
        pressArrowUp();
        expectHighlightedMoveToBe('c5');
        pressArrowUp();
        expectHighlightedMoveToBe('e5');
        pressArrowUp();
        expectHighlightedMoveToBe('e6');
        pressArrowUp();
        expectHighlightedMoveToBe('c5');
        pressArrowUp();
        expectHighlightedMoveToBe('e5');
      });
    });
  });

  describe('Chessboard.test.tsx tests', () => {

    function getSquare(square: string): HTMLElement | null {
      return container.querySelector(`[data-square="${square}"]`) as HTMLElement | null;
    }

    function getPiece(square: string): string | null {
      return (getSquare(square)?.firstChild?.firstChild as HTMLElement)?.getAttribute('data-piece');
    }

    function getBoardPosition(): string {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      let position = '';

      for (const rank of ranks) {
        let emptyCount = 0;
        for (const file of files) {
          const piece = getPiece(file + rank);
          if (piece) {
            if (emptyCount > 0) {
              position += emptyCount;
              emptyCount = 0;
            }
            position += piece[0] === 'w' ? piece[1].toUpperCase() : piece[1].toLowerCase();
          } else {
            emptyCount++;
          }
        }
        if (emptyCount > 0) {
          position += emptyCount;
        }
        if (rank !== '1') {
          position += '/';
        }
      }
      return position;
    }

    function expectBoardPositionToBe(position: string) {
      expect(getBoardPosition()).toBe(position);
    }

    beforeEach(() => {
      e4Square = getSquare('e4');
    });

    // these pass before changes
    describe('Testing basic board features', () => {
      it('e4 should exist as a div in the document', () => {
        expect(e4Square).not.toBeNull();
      });

      it('e4 should have a white pawn', () => {
        expect(getPiece('e4')).toBe('wP');
      });
    });

    // this passes before changes
    describe('Testing board position', () => {
      it('should refect position after 1. e4 e5', async () => {
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
      });
    });

    describe('Appropriate board position under navigation with arrow keys', () => {
      it("should reflect the position when left arrow is pressed", async () => {
        pressArrowLeft();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4);
        });
      });

      it("should reflect the position when right arrow is pressed", async () => {
        pressArrowLeft();
        pressArrowLeft();
        pressArrowRight();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4);
        });
      });
    });

    // this passes before changes
    describe('Board position after entered move text', () => {
      it("should reflect the position after the added move", async () => {
        addMove('Nf3');
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5_2Nf3);
        });
      });
    });

    describe('Board position after added alternate moves', () => {
      // this passes before changes as alternate moves
      // overwrite the main move in the original codebase
      it("should reflect the position after the added alternate move (1... c5)", async () => {
        pressArrowLeft();
        addMove('c5');
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4c5);
        });
      });

      it("should reflect the position after the added alternate move as the very first move", async () => {
        pressArrowLeft();
        pressArrowLeft();
        addMove('d4');
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1d4);
        });
      });
    });

    describe('Board position after navigated alternate moves', () => {
      it("should reflect the position of the main line move when right arrow is pressed, regardless of alternate moves", async () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowLeft();
        pressArrowRight();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
      });

      it("should reflect the position of the main move and the alternate move alternately, when the up arrow is pressed", async () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4c5);
        });
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
      });

      it("should reflect the position of the main move and the alternate move alternately, when the down arrow is pressed", async () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4c5);
        });
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
      });

      it("if multiple alternate moves exist, should reflect the position of the next one when down arrow is pressed", async () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowLeft();
        addMove('e6');
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4c5);
        });
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e6);
        });
        pressArrowDown();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
      });

      it("if multiple alternate moves exist, should reflect the position of the previous one when up arrow is pressed", async () => {
        pressArrowLeft();
        addMove('c5');
        pressArrowLeft();
        addMove('e6');
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4c5);
        });
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e6);
        });
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4c5);
        });
        pressArrowUp();
        await waitFor(() => {
          expectBoardPositionToBe(positionAfter1e4e5);
        });
      });
    });
  });
});

