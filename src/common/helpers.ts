export function getRandomElement<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex]
}

export async function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
