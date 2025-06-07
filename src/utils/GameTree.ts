import { Chess } from 'chess.js';
import GameTreeNode from './GameTreeNode';

export default class GameTree {
  root: GameTreeNode;
  current: GameTreeNode;
  currentLineToCurrentNode: GameTreeNode[];
  chessInstance: Chess;

  constructor() {
    this.root = new GameTreeNode("HEAD");
    this.current = this.root;
    this.currentLineToCurrentNode = [];
    this.chessInstance = new Chess();
  }

  addMove(san: string): void {
    let newNode = new GameTreeNode(san);
    newNode.prev = this.current;
    if (this.current.next) {
      const existingNode = this.current.next.getNodeWithMove(san);
      if (existingNode) {
        newNode = existingNode;
      } else {
        this.current.next.alternatives.push(newNode);
      }
    } else {
      this.current.next = newNode;
    }
    this.updateCurrent(newNode);
  }

  addAlternative(altNode: GameTreeNode): void {
    altNode.prev = this.current;
    this.current.alternatives.push(altNode);
    this.updateCurrent(altNode);
  }

  getMainLine(): string[] {
    const moves: string[] = [];
    let node: GameTreeNode | null = this.root;

    while (node) {
      moves.push(node.move);
      node = node.next;
    }
    return moves.slice(1);
  }

  updateCurrent(node: GameTreeNode): void {
    this.current = node;
    this.currentLineToCurrentNode = this.getCurrentLineToCurrentNode();
    this.chessInstance = this.reconstructChess();
  }

  goToPrevious(): boolean {
    if (this.current && this.current.prev) {
      this.updateCurrent(this.current.prev);
      return true;
    }
    return false;
  }

  goToNext(): boolean {
    if (this.current && this.current.next) {
      this.updateCurrent(this.current.next);
      return true;
    }
    return false;
  }

  goToNextAlternative(): boolean {
    return this.goToAlternative("next");
  }

  goToPreviousAlternative(): boolean {
    return this.goToAlternative("previous");
  }

  goToAlternative(direction: "next" | "previous"): boolean {
    // No alternatives available
    if ((this.current.hasNoAlternatives() && this.current.isNotAnAlternativeItself())
      || this.current === this.root) {
      return false;
    }

    let allMoves: GameTreeNode[] | null = null;
    if (this.current.hasAlternatives()) {
      allMoves = this.getAllMovesAt(this.current);
    } else if (this.current.isItselfAnAlternative()) {
      allMoves = this.getAllMovesAt(this.current.prev!.next!);
    }
    if (allMoves) {
      const currentIndex = allMoves.findIndex(move => move === this.current);
      const nextIndex = (currentIndex
        + (direction === "next" ? 1 : -1)
        // To keep the index in bounds
        + allMoves.length)
        % allMoves.length;
      this.updateCurrent(allMoves[nextIndex]);
      return true;
    }
    return false;
  }

  getAllMovesAt(node: GameTreeNode): GameTreeNode[] {
    const allMoves: GameTreeNode[] = [];
    allMoves.push(node);
    allMoves.push(...node.alternatives);
    return allMoves;
  }


  getCurrentLineToCurrentNode(): GameTreeNode[] {
    const moves: GameTreeNode[] = [];
    let node: GameTreeNode | null = this.current;

    while (node) {
      moves.unshift(node);
      node = node.prev;
    }

    return moves.slice(1);
  }

  reconstructChess(): Chess {
    const chess = new Chess();
    const nodes = this.getCurrentLineToCurrentNode();

    for (const node of nodes) {
      chess.move(node.move);
    }

    return chess;
  }

  makeDuplicateTree(): GameTree {
    const duplicateTree = new GameTree();
    duplicateTree.root = this.root;
    duplicateTree.current = this.current;
    duplicateTree.currentLineToCurrentNode = this.currentLineToCurrentNode;
    duplicateTree.chessInstance = duplicateTree.reconstructChess();
    return duplicateTree;
  }
} 