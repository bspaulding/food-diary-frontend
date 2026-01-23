interface Left<L> {
  value: L;
  tag: "left";
}

interface Right<R> {
  value: R;
  tag: "right";
}

export type Either<L, R> = Left<L> | Right<R>;

export function isLeft<L>(val: any): val is Left<L> {
  if ((val as Left<L>).tag === "left") {
    return true;
  }
  return false;
}

export function isRight<R>(val: any): val is Right<R> {
  if ((val as Right<R>).tag === "right") {
    return true;
  }
  return false;
}

export function Left<L>(value: L): Left<L> {
  return { value, tag: "left" };
}

export function Right<R>(value: R): Right<R> {
  return { value, tag: "right" };
}

export function split<L, R>(es: Either<L, R>[]): { lefts: L[]; rights: R[] } {
  const lefts = es.filter(isLeft).map((e) => e.value) as L[];
  const rights = es.filter(isRight).map((e) => e.value) as R[];
  return { lefts, rights };
}
