import { Content, LineFormat, Note } from "./types"


export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export function contentToString(content: Content): string {
  return collectContent(content).join("\n")
}

export function collectContent(content: Content, indent: string = '', acc: string[] = []): string[] {
  for (const [key, value] of content) {
    let line = indent

    if (key.checkbox) {
      line += key.check ? '[x]' : '[ ]'
    }

    if (key.blur) {
      line += '[!]'
    }

    line += key.line

    acc.push(line)

    collectContent(value, indent + '  ', acc)
  }
  return acc
}

export function parseContent(value: string): Content {
  const content: Content = []

  const lines = value.split("\n")
  for (let line of lines) {
    // check parent node of current line
    let at = content
    while (line.startsWith('  ')) {
      at = at[at.length - 1]![1]
      line = line.substring(2)
    }

    const value: LineFormat = {}

    // check format
    // 1- checkbox
    if (line.startsWith('[ ]')) {
      value.checkbox = true
      value.check = false
      line = line.substring(3)
    } else if (line.startsWith('[x]')) {
      value.checkbox = true
      value.check = true
      line = line.substring(3)
    }

    // 2- blur
    if (line.startsWith('[!]')) {
      value.blur = true
      line = line.substring(3)
    }

    value.line = line

    if (line.length)
      at.push([value, []])
  }

  return content
}
