import { assert, assertNever } from "^jab";

type DiffResult<L, R> = Array<["eq", R] | ["del", L] | ["ins", R]>;

//ways one can make an incremental solution out of subsolutions.
// this is used to construct the final solution, when all optimal subproblems have been solved.
//null is just used to make base cases easier to construct.
type Choice = "eq" | "del" | "ins" | null;

/**
 * - Diff is optimized for fewest "lines"
 * - Delete will come before insert, when they are right next to each other.
 * - ties are ordered from left to right, like this: equal, delete, insert
 *
 * score:
 *  more is worse.
 *  +1 for eq-entry. (it contains two value, so prioritized over ins/del)
 *  +1 for del/ins entry.
 *  +10 for del right after ins. (They can always be exchanged, so penalty amount is irrelevant.)
 *
 * impl note:
 *  solutions hold the subproblems: [score, chosen way to compose]
 *  solutions are shifted index wrt. left and right arrays. So entries with either of i,j === 0 can be base cases.
 */
export const dynamicDiff = <L, R>(
  left: L[],
  right: R[],
  comparer: (left: L, right: R) => boolean
) => {
  //
  // step 1: build subproblems according to score
  //

  const solutions: [number, Choice][][] = [];

  //loops continue "one-above" the length of left and right.

  for (let i = 0; i <= left.length; i++) {
    solutions[i] = [];

    for (let j = 0; j <= right.length; j++) {
      //
      //base cases
      //

      if (i === 0 && j === 0) {
        solutions[i][j] = [0, null];
        continue;
      }

      if (i === 0) {
        solutions[i][j] = [j, "ins"];
        continue;
      }

      if (j === 0) {
        solutions[i][j] = [i, "del"];
        continue;
      }

      assert(i !== 0);
      assert(j !== 0);

      //
      //both are used to make an equal entry.
      //

      let eq: number;

      if (comparer(left[i - 1], right[j - 1])) {
        const sub = solutions[i - 1][j - 1];
        eq = 1 + sub[0];
      } else {
        eq = Number.MAX_VALUE; //doesn't eq
      }

      //
      //only left is used to make a delete entry
      //

      let del: number;

      const suby = solutions[i - 1][j];
      switch (suby[1]) {
        case null:
        case "del":
        case "eq":
          del = 1 + suby[0];
          break;

        case "ins":
          del = 10;
          break;

        default:
          throw assertNever(suby[1]);
      }

      //
      //only right is used to make an insert entry.
      //

      const subz = solutions[i][j - 1];
      const ins = 1 + subz[0];

      //
      //done
      //

      //tie in reverse order, because the trace is traversed backwards.

      if (ins <= del && ins <= eq) {
        solutions[i][j] = [ins, "ins"];
        continue;
      }

      if (del <= eq && del <= ins) {
        solutions[i][j] = [del, "del"];
        continue;
      }

      if (eq <= del && eq <= ins) {
        solutions[i][j] = [eq, "eq"];
        continue;
      }

      throw new Error("Impossible");
    }
  }

  //
  // step 2: traverse to find actual diff
  //

  const result = [] as DiffResult<L, R>;

  let i = left.length;
  let j = right.length;

  while (i > 0 || j > 0) {
    const sol = solutions[i][j];

    //note index'es are decreased *before* accessing left/right arrays.
    switch (sol[1]) {
      case "eq":
        i--;
        j--;
        result.push(["eq", right[j]]); //could choose to use left[i] here too. They are equal.
        break;

      case "del":
        i--;
        result.push(["del", left[i]]);
        break;

      case "ins":
        j--;
        result.push(["ins", right[j]]);
        break;

      case null:
        throw new Error("Impossible");

      default:
        throw assertNever(sol[1]);
    }
  }

  return result.reverse();
};
