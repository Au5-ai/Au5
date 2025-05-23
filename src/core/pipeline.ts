type Pipe<T> = (input: T) => Promise<T>;

export async function runPipesAsync<T>(input: T, ...fns: Pipe<T>[]): Promise<T> {
  let result = input;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}
