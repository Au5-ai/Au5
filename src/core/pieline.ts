type AsyncPipe<T> = (input: T) => Promise<T>;

export async function pipeAsync<T>(input: T, ...fns: AsyncPipe<T>[]): Promise<T> {
  let result = input;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}
