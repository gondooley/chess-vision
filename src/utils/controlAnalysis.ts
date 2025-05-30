import { Chess, Square } from 'chess.js';

/**
 * Arrays are indexed as [rank][file] where:
 * - rank 0-7 corresponds to ranks 1-8 (0 = rank 1, 7 = rank 8)
 * - file 0-7 corresponds to files a-h (0 = file a, 7 = file h)
 * Examples:
 * - a8 is [7][0]
 * - h1 is [0][7]
 * - e4 is [3][4]
 */
export class BoardWeights {
  weights: string[][];

  constructor() {
    this.weights = Array(8).fill(null).map(() => Array(8).fill(""));
  }
}

const centralImportance = new Array(8).fill(null).map(() => Array(8).fill(0));

const reverseWeights = {
  q: 1,  // queen
  r: 5,  // rook
  b: 7,  // bishop
  n: 7,  // knight
  p: 9   // pawn
};

// Set up the nested square pattern
// Center squares (e4, e5, d4, d5) = 3
centralImportance[3][4] = 3; // e4
centralImportance[4][4] = 3; // e5
centralImportance[3][3] = 3; // d4
centralImportance[4][3] = 3; // d5

// Surrounding squares = 2
for (let rank = 2; rank <= 5; rank++) {
    for (let file = 2; file <= 5; file++) {
        if (centralImportance[rank][file] === 0) {
            centralImportance[rank][file] = 2;
        }
    }
}

// Outer squares = 1
for (let rank = 1; rank <= 6; rank++) {
    for (let file = 1; file <= 6; file++) {
        if (centralImportance[rank][file] === 0) {
            centralImportance[rank][file] = 1;
        }
    }
}

export function addCentralControlColours(currentColors: BoardWeights): BoardWeights {
  // Create new object to maintain immutability
  const newColors = new BoardWeights();
  
  // Find max value in centralImportance
  let maxCentralImportance = 0;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const importance = centralImportance[rank][file];
      maxCentralImportance = Math.max(maxCentralImportance, importance);
    }
  }

  // If max is 0, return original colors
  if (maxCentralImportance === 0) {
    return currentColors;
  }

  // Process each square
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const currentColor = currentColors.weights[rank][file];
      const rgbValues = currentColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [r, g, b] = rgbValues;
      
      const potentialBlue = 255 - b;
      const importance = centralImportance[rank][file];
      const newBlue = Math.min(255, b + Math.round(potentialBlue * importance / maxCentralImportance));
      
      newColors.weights[rank][file] = `rgb(${r}, ${g}, ${newBlue})`;
    }
  }

  return newColors;
}

export function addAttackingControlColours(currentColors: BoardWeights, game: Chess, reverseWeightsIsOn: boolean = false): BoardWeights {
  // Create new object to maintain immutability
  const newColors = new BoardWeights();
  
  // Initialize attack weights array
  const attackWeights = new Array(8).fill(null).map(() => Array(8).fill(0));
  
  // For each square, count how many pieces can attack it
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const targetSquare = String.fromCharCode(97 + file) + (8 - rank) as Square;
      
      // For each piece on the board, check if it can attack this square
      for (let fromRank = 0; fromRank < 8; fromRank++) {
        for (let fromFile = 0; fromFile < 8; fromFile++) {
          const fromSquare = String.fromCharCode(97 + fromFile) + (8 - fromRank) as Square;
          const piece = game.get(fromSquare);
          if (piece && fromSquare !== targetSquare && piece.color === game.turn()) {
            if (piece.type === 'p') {
              // For pawns, check attacking squares
              const direction = piece.color === 'w' ? -1 : 1; // White moves up (decreasing rank), black moves down (increasing rank)
              const [fromFile, fromRank] = [fromSquare.charCodeAt(0) - 97, 8 - parseInt(fromSquare[1])];
              const [targetFile, targetRank] = [targetSquare.charCodeAt(0) - 97, 8 - parseInt(targetSquare[1])];
              
              // Check if target square is diagonally forward
              if (targetRank === fromRank + direction && 
                  (targetFile === fromFile - 1 || targetFile === fromFile + 1)) {
                attackWeights[rank][file] += reverseWeightsIsOn ? reverseWeights.p : 1;
              }

              // Check for en passant
              const fen = game.fen();
              const epSquare = fen.split(' ')[3]; // The en passant square is the 4th field in FEN
              if (epSquare !== '-') {
                const [epFile, epRank] = [epSquare.charCodeAt(0) - 97, 8 - parseInt(epSquare[1])];
                if (epRank === fromRank && 
                    (epFile === fromFile - 1 || epFile === fromFile + 1) &&
                    targetSquare === epSquare) {
                  attackWeights[rank][file] += reverseWeightsIsOn ? reverseWeights.p : 1;
                }
              }
            } else {
              // For other pieces, check if they can attack, including protecting own pieces
              let canAttack = false;
              const pieceAtTarget = game.get(targetSquare);
              let removed = false;
              if (pieceAtTarget && pieceAtTarget.color === piece.color) {
                game.remove(targetSquare);
                removed = true;
              }
              const moves = game.moves({ square: fromSquare, verbose: true });
              canAttack = moves.some(move => move.to === targetSquare);
              if (removed && pieceAtTarget) {
                game.put(pieceAtTarget, targetSquare);
              }
              if (canAttack) {
                if (piece.type === 'k') {
                  attackWeights[rank][file] += 1; // Kings always count as 1
                } else {
                  attackWeights[rank][file] += reverseWeightsIsOn ? reverseWeights[piece.type] : 1;
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Find max value in attackWeights
  let maxAttacks = 0;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      maxAttacks = Math.max(maxAttacks, attackWeights[rank][file]);
    }
  }

  // If max is 0, return original colors
  if (maxAttacks === 0) {
    return currentColors;
  }

  // Process each square
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const currentColor = currentColors.weights[rank][file];
      const rgbValues = currentColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [r, g, b] = rgbValues;
      
      const potentialGreen = 255 - g;
      const attacks = attackWeights[rank][file];
      const newGreen = Math.min(255, g + Math.round(potentialGreen * attacks / maxAttacks));
      
      newColors.weights[rank][file] = `rgb(${r}, ${newGreen}, ${b})`;
    }
  }

  return newColors;
}

export function addDefendingControlColours(currentColors: BoardWeights, game: Chess, reverseWeightsIsOn: boolean = false): BoardWeights {
  // Create new object to maintain immutability
  const newColors = new BoardWeights();
  
  // Initialize defense weights array
  const defenseWeights = new Array(8).fill(null).map(() => Array(8).fill(0));
  
  // For each square, count how many pieces can defend it
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const targetSquare = String.fromCharCode(97 + file) + (8 - rank) as Square;
      
      // For each piece on the board, check if it can defend this square
      for (let fromRank = 0; fromRank < 8; fromRank++) {
        for (let fromFile = 0; fromFile < 8; fromFile++) {
          const fromSquare = String.fromCharCode(97 + fromFile) + (8 - fromRank) as Square;
          const piece = game.get(fromSquare);
          const opponentColor = game.turn() === 'w' ? 'b' : 'w';
          if (piece && fromSquare !== targetSquare && piece.color === opponentColor) {
            if (piece.type === 'p') {
              // For pawns, check defending squares
              const direction = piece.color === 'w' ? -1 : 1; // White moves up (decreasing rank), black moves down (increasing rank)
              const [fromFile, fromRank] = [fromSquare.charCodeAt(0) - 97, 8 - parseInt(fromSquare[1])];
              const [targetFile, targetRank] = [targetSquare.charCodeAt(0) - 97, 8 - parseInt(targetSquare[1])];
              
              // Check if target square is diagonally forward
              if (targetRank === fromRank + direction && 
                  (targetFile === fromFile - 1 || targetFile === fromFile + 1)) {
                defenseWeights[rank][file] += reverseWeightsIsOn ? reverseWeights.p : 1;
              }

              // Check for en passant
              const fen = game.fen();
              const epSquare = fen.split(' ')[3]; // The en passant square is the 4th field in FEN
              if (epSquare !== '-') {
                const [epFile, epRank] = [epSquare.charCodeAt(0) - 97, 8 - parseInt(epSquare[1])];
                if (epRank === fromRank && 
                    (epFile === fromFile - 1 || epFile === fromFile + 1) &&
                    targetSquare === epSquare) {
                  defenseWeights[rank][file] += reverseWeightsIsOn ? reverseWeights.p : 1;
                }
              }
            } else {
              // For other pieces, check if they can attack, including protecting own pieces
              const fenParts = game.fen().split(' ');
              fenParts[1] = opponentColor; // Set the turn to opponent's color
              const gameCopy = new Chess(fenParts.join(' '));
              let canAttack = false;
              const pieceAtTarget = gameCopy.get(targetSquare);
              let removed = false;
              if (pieceAtTarget && pieceAtTarget.color === piece.color) {
                gameCopy.remove(targetSquare);
                removed = true;
              }
              const moves = gameCopy.moves({ square: fromSquare, verbose: true });
              canAttack = moves.some(move => move.to === targetSquare);
              if (removed && pieceAtTarget) {
                gameCopy.put(pieceAtTarget, targetSquare);
              }
              if (canAttack) {
                if (piece.type === 'k') {
                  defenseWeights[rank][file] += 1; // Kings always count as 1
                } else {
                  defenseWeights[rank][file] += reverseWeightsIsOn ? reverseWeights[piece.type] : 1;
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Find max value in defenseWeights
  let maxDefenses = 0;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      maxDefenses = Math.max(maxDefenses, defenseWeights[rank][file]);
    }
  }

  // If max is 0, return original colors
  if (maxDefenses === 0) {
    return currentColors;
  }

  // Process each square
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const currentColor = currentColors.weights[rank][file];
      const rgbValues = currentColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [r, g, b] = rgbValues;
      
      const potentialRed = 255 - r;
      const defenses = defenseWeights[rank][file];
      const newRed = Math.min(255, r + Math.round(potentialRed * defenses / maxDefenses));
      
      newColors.weights[rank][file] = `rgb(${newRed}, ${g}, ${b})`;
    }
  }

  return newColors;
}
