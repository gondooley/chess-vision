import { Chess } from 'chess.js';

export default class GameTreeNode {
    move: string;
    alternatives: GameTreeNode[];
    next: GameTreeNode | null;
    prev: GameTreeNode | null;

    constructor(move: string) {
        this.move = move;
        this.alternatives = [];
        this.next = null;
        this.prev = null;
    }

    getNodeWithMove(san: string): GameTreeNode | null {
        if (this.move === san) {
            return this;
        }
        for (const alt of this.alternatives) {
            if (alt.getNodeWithMove(san)) {
                return alt;
            }
        }
        return null;
    }

    hasAlternatives(): boolean {
        return this.alternatives.length > 0;
    }

    hasNoAlternatives(): boolean {
        return this.alternatives.length === 0;
    }

    isNotAnAlternativeItself(): boolean {
        return this.prev?.next === this;
    }

    isItselfAnAlternative(): boolean {
        return this.prev?.next !== this;
    }
}