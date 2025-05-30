import { BoardWeights } from './controlAnalysis';

export function getCurrentBoardColors(): BoardWeights {
  const currentColors = new BoardWeights();
  const squares = document.querySelectorAll('.board-square');
  
  squares.forEach((square, index) => {
    const rank = Math.floor(index / 8);
    const file = index % 8;
    const color = window.getComputedStyle(square).backgroundColor;
    const rgbValues = color.match(/\d+/g);
    if (rgbValues) {
      currentColors.weights[rank][file] = `rgb(${rgbValues.join(',')})`;
    }
  });
  
  return currentColors;
} 