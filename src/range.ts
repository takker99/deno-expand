/** `start`から`end`までの数列を作る */
export function* range(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}
