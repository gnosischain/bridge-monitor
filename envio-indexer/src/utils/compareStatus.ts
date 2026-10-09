import { TransactionStatusEnum, type TransactionStatusLiteral } from "../const";

const order: Record<TransactionStatusLiteral, number> = {
  [TransactionStatusEnum.INITIATED]: 0,
  [TransactionStatusEnum.COLLECTING]: 1,
  [TransactionStatusEnum.UNCLAIMED]: 2,
  [TransactionStatusEnum.COMPLETED]: 3,
  [TransactionStatusEnum.ERROR]: 4,
};

export function isStatusGreater(
  a: TransactionStatusLiteral,
  b: TransactionStatusLiteral
): boolean {
  return order[a] > order[b];
}

