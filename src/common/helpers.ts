export function getRandomElement<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex]
}

export function uniqueBy<T, K extends keyof T>(arr: T[], key: K): T[] {
  const seen = new Set<T[K]>()
  const result: T[] = []

  for (const item of arr) {
    if (!seen.has(item[key])) {
      seen.add(item[key])
      result.push(item)
    }
  }

  return result
}
