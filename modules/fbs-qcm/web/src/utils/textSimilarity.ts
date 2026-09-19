/**
 * Normalisierte Levenshtein-Ähnlichkeit zweier Antworten.
 *
 * 1 bedeutet identisch, 0 bedeutet maximal verschieden. Die Normalisierung
 * über die längere Eingabe macht Werte zwischen unterschiedlich langen
 * Musterlösungen vergleichbar.
 */
export function levenshteinSimilarity(left: string, right: string): number {
  const source = normalizeAnswer(left)
  const target = normalizeAnswer(right)

  if (source === target) return 1
  if (source.length === 0 || target.length === 0) return 0

  let previous = Array.from({ length: target.length + 1 }, (_, index) => index)

  for (let row = 1; row <= source.length; row += 1) {
    const current = [row]

    for (let column = 1; column <= target.length; column += 1) {
      const substitutionCost = source[row - 1] === target[column - 1] ? 0 : 1
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + substitutionCost
      )
    }

    previous = current
  }

  const distance = previous[target.length]
  return 1 - distance / Math.max(source.length, target.length)
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
