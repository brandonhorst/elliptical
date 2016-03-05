export default function createOption(text) {
  return {
    text,
    words: [],
    qualifiers: [],
    callbacks: [],
    score: 1,
    _previousEllipsis: []
  }
}