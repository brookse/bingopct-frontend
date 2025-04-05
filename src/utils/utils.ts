import { BingoCard, CompletionSummary } from "@/types/types";

export const mToHms = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

export const getNumBingos = (completionSummary: CompletionSummary, card: BingoCard) => {
  let numBingos = 0;

  // test all rows (horizontal)
  if (isHorizontalBingo(completionSummary, card.first)) numBingos++;
  if (isHorizontalBingo(completionSummary, card.second)) numBingos++;
  if (isHorizontalBingo(completionSummary, card.third)) numBingos++;
  if (isHorizontalBingo(completionSummary, card.fourth)) numBingos++;
  if (isHorizontalBingo(completionSummary, card.fifth)) numBingos++;

  // test all columns (vertical)
  if (isVerticalBingo(completionSummary, card, 0)) numBingos++;
  if (isVerticalBingo(completionSummary, card, 1)) numBingos++;
  if (isVerticalBingo(completionSummary, card, 2)) numBingos++;
  if (isVerticalBingo(completionSummary, card, 3)) numBingos++;
  if (isVerticalBingo(completionSummary, card, 4)) numBingos++;

  // test all diagonals (diagonal)
  if (isDiagonalBingo(completionSummary, [card.first[0], card.second[1], card.third[2], card.fourth[3], card.fifth[4]])) numBingos++;
  if (isDiagonalBingo(completionSummary, [card.first[4], card.second[3], card.third[2], card.fourth[1], card.fifth[0]])) numBingos++;

  return numBingos;
}

export const isHorizontalBingo = (completionSummary: CompletionSummary, row: string[]) => {
  for (const item of row) {
    if (!completionSummary[item]?.completed_at) {
      return false;
    }
  }
  return true;
}

export const isVerticalBingo = (completionSummary: CompletionSummary, card: BingoCard, index: number) => {
  const column = [card.first[index], card.second[index], card.third[index], card.fourth[index], card.fifth[index]];
  for (const item of column) {
    if (!completionSummary[item]?.completed_at) {
      return false;
    }
  }
  return true;
}

export const isDiagonalBingo = (completionSummary: CompletionSummary, diagonal: string[]) => {
  for (const item of diagonal) {
    if (!completionSummary[item]?.completed_at) {
      return false;
    }
  }
  return true;
}