/**
 * Evaluates arithmetic expressions with + - * / and parentheses.
 * Whitespace is ignored. Supports unary + and -.
 */

export type EvaluateResult
  = { ok: true; value: number }
  | { ok: false }

export function evaluateExpression(raw: string): EvaluateResult {
  const s = raw.replace(/\s/g, '')
  if (s === '' || s === 'Lỗi') {
    return { ok: false }
  }

  let i = 0
  const n = s.length

  function peek(): string {
    return s[i] ?? ''
  }

  function eat(ch: string): boolean {
    if (peek() === ch) {
      i++
      return true
    }
    return false
  }

  function parseExpr(): number {
    let v = parseTerm()
    while (true) {
      if (eat('+')) {
        v += parseTerm()
      }
      else if (eat('-')) {
        v -= parseTerm()
      }
      else {
        break
      }
    }
    return v
  }

  function parseTerm(): number {
    let v = parseFactor()
    while (true) {
      if (eat('*')) {
        v *= parseFactor()
      }
      else if (eat('/')) {
        const right = parseFactor()
        if (right === 0) {
          return NaN
        }
        v /= right
      }
      else {
        break
      }
    }
    return v
  }

  function parseFactor(): number {
    if (eat('+')) {
      return parseFactor()
    }
    if (eat('-')) {
      return -parseFactor()
    }
    if (eat('(')) {
      const inner = parseExpr()
      if (!eat(')')) {
        throw new Error('unclosed')
      }
      return inner
    }
    return parseNumber()
  }

  function parseNumber(): number {
    const start = i
    if (peek() === '.') {
      i++
      if (!/\d/.test(peek())) {
        throw new Error('bad')
      }
      while (/\d/.test(peek())) {
        i++
      }
    }
    else if (/\d/.test(peek())) {
      while (/\d/.test(peek())) {
        i++
      }
      if (eat('.')) {
        while (/\d/.test(peek())) {
          i++
        }
      }
    }
    else {
      throw new Error('bad')
    }
    const slice = s.slice(start, i)
    const num = Number(slice)
    if (Number.isNaN(num)) {
      throw new Error('bad')
    }
    return num
  }

  try {
    const v = parseExpr()
    if (i !== n) {
      return { ok: false }
    }
    if (!Number.isFinite(v)) {
      return { ok: false }
    }
    return { ok: true, value: v }
  }
  catch {
    return { ok: false }
  }
}
