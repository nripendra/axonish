export function chunkArray<T>(arr: T[], n: number) {
  const temparray: T[][] = [];
  const chunk = n;
  for (let i = 0, j = arr.length; i < j; i += chunk) {
    const slice = arr.slice(i, i + chunk);
    temparray.push(slice);
  }
  return temparray;
}
