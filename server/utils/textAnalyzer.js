const POSITIVE_WORDS = new Set([
  "fresh", "warm", "enjoy", "enjoying", "discover", "brighter", "free", "celebrate",
  "elegance", "effortlessly", "transform", "energy", "happy", "shiny", "beautiful",
  "gentle", "genuine", "calm", "mindful", "memorable", "crispy", "organic", "amazing",
  "artisan", "transparent", "complimentary", "save", "boost", "trusted", "excited",
  "best", "easy", "fast", "growth", "smart", "love", "crafted", "quality", "joy",
  "grateful", "gratitude", "wonderful", "awesome", "great", "good", "peaceful",
  "inspiring", "inspired", "proud", "smiling", "smile", "fun", "blessed", "success",
  "positive", "delight", "serene", "serenity", "hopeful", "hope", "vibrant", "thrilled"
]);

const NEGATIVE_WORDS = new Set([
  "chronic", "stiffness", "drains", "costly", "heavy", "waiting", "limited", "terrible",
  "stress", "hard", "slow", "broken", "expensive", "confusing", "miss", "boring",
  "sad", "angry", "bad", "hate", "awful", "worst", "fear", "lonely", "heartbreak",
  "disappointed", "frustrated", "anxious", "grief", "pain", "dark", "lost", "regret",
  "overwhelmed", "exhausted", "miserable", "hopeless", "bitter", "despair", "trouble"
]);

const STOPWORDS = new Set([
  "the", "and", "for", "with", "your", "this", "that", "from", "into",
  "our", "are", "you", "can", "will", "have", "has", "not", "all", "new",
  "get", "now", "more", "about", "today", "just", "make", "out", "how"
]);

function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (cleaned.length <= 3) return 1;
  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  if (cleaned.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

function analyzeText(text, targetKeyword = "") {
  const safeText = String(text || "").trim();
  const words = safeText.match(/[a-zA-Z]+/g) || [];
  const lowerWords = words.map((w) => w.toLowerCase());
  const wordCount = words.length;

  const sentences = safeText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const rawFlesch =
    wordCount > 0
      ? 206.835 -
        1.015 * (wordCount / sentenceCount) -
        84.6 * (totalSyllables / wordCount)
      : 60;
  const readabilityScore = Number(
    Math.max(0, Math.min(100, rawFlesch)).toFixed(1)
  );

  
  let pos = 0;
  let neg = 0;
  lowerWords.forEach((w) => {
    if (POSITIVE_WORDS.has(w)) pos += 1;
    if (NEGATIVE_WORDS.has(w)) neg += 1;
  });
  const sentimentScore =
    pos + neg === 0 ? 0 : Number(((pos - neg) / (pos + neg)).toFixed(2));

  let sentimentLabel = "Neutral";
  if (sentimentScore > 0.15) sentimentLabel = "Positive";
  else if (sentimentScore < -0.15) sentimentLabel = "Negative";


  const freq = {};
  lowerWords.forEach((w) => {
    if (w.length > 3 && !STOPWORDS.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  
  let seoScore = 50;
  if (wordCount >= 40 && wordCount <= 220) seoScore += 20;
  if (readabilityScore >= 55) seoScore += 15;
  if (sentimentLabel === "Positive") seoScore += 10;
  if (
    targetKeyword &&
    targetKeyword.trim().length > 0 &&
    safeText.toLowerCase().includes(targetKeyword.trim().toLowerCase())
  ) {
    seoScore += 5;
  }
  seoScore = Math.min(100, seoScore);

  return {
    wordCount,
    sentenceCount,
    readabilityScore,
    sentimentScore,
    sentimentLabel,
    seoScore,
    topKeywords,
  };
}

module.exports = { analyzeText };