
"use strict";

(function () {
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "if", "is", "are",
    "was", "were", "be", "been", "being", "to", "of", "in",
    "on", "at", "for", "from", "by", "with", "as", "it",
    "this", "that", "these", "those", "i", "you", "he", "she",
    "we", "they", "them", "his", "her", "our", "your", "my",
    "me", "do", "does", "did", "have", "has", "had", "not",
    "no", "so", "than", "then", "there", "their", "can", "will",
    "would", "should", "could", "about", "into", "up", "out",
    "what", "which", "who", "when", "where", "how", "all",
    "also", "just", "more", "some", "any", "very", "its"
  ]);

  function getWords(text) {
    return text.trim().match(/\S+/gu) || [];
  }

  function getSentences(text) {
    const cleaned = text.trim();

    if (!cleaned) return [];

    // Count sentence-like segments ending in punctuation.
    // A final segment without punctuation is also counted.
    const matches = cleaned.match(/[^.!?。！？]+(?:[.!?。！？]+|$)/gu);

    return (matches || [])
      .map(sentence => sentence.trim())
      .filter(Boolean);
  }

  function getParagraphs(text) {
    const cleaned = text.trim();

    if (!cleaned) return [];

    return cleaned
      .split(/\n\s*\n+/u)
      .map(paragraph => paragraph.trim())
      .filter(Boolean);
  }

  function getKeywordCounts(words) {
    const counts = new Map();

    for (const word of words) {
      const normalized = word
        .toLocaleLowerCase()
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

      if (
        !normalized ||
        STOP_WORDS.has(normalized) ||
        normalized.length < 2 ||
        /^\d+$/u.test(normalized)
      ) {
        continue;
      }

      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10);
  }

  function formatTime(minutes) {
    if (minutes < 1) {
      return "< 1 min";
    }

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
  }

  function analyzeText(text) {
    const words = getWords(text);
    const sentences = getSentences(text);
    const paragraphs = getParagraphs(text);

    const normalizedWords = words.map(word =>
      word.toLocaleLowerCase()
    );

    const uniqueWords = new Set(normalizedWords);

    // Unicode-aware character count.
    const characters = Array.from(text).length;

    // Count non-whitespace Unicode code points.
    const charactersNoSpaces =
      Array.from(text.replace(/\s/gu, "")).length;

    // Approximate estimates, not guaranteed reading/speaking times.
    const readingMinutes = Math.ceil(words.length / 200);
    const speakingMinutes = Math.ceil(words.length / 130);

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      uniqueWords: uniqueWords.size,
      readingTime: formatTime(readingMinutes),
      speakingTime: formatTime(speakingMinutes),
      keywords: getKeywordCounts(words)
    };
  }

  window.WordCounter = {
    analyzeText,
    getWords,
    getSentences,
    getParagraphs
  };
})();
