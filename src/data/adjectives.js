const NEGATIVE_ADJECTIVES = [
  "Awkward",
  "Boring",
  "Arrogant",
  "Weird",
  "Cringe",
  "Dull",
  "Unattractive",
  "Off-putting"
];

const POSITIVE_ADJECTIVES = [
  "Attractive",
  "Charming",
  "Cute",
  "Stylish",
  "Playful",
  "Confident",
  "Magnetic",
  "Funny",
  "Bold",
  "Smooth",
  "Warm",
  "Cool"
];

export const ALL_ADJECTIVES = [...NEGATIVE_ADJECTIVES, ...POSITIVE_ADJECTIVES];

function pickRandom(arr, count) {
  const copy = [...arr];
  const result = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i += 1) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function generateAdjectives(viewerGender, targetGender, mustInclude = null) {
  // Always return exactly 1 negative + 3 positive adjectives,
  // even when we must include a specific adjective.
  if (mustInclude) {
    const isPositive = POSITIVE_ADJECTIVES.includes(mustInclude);
    const isNegative = NEGATIVE_ADJECTIVES.includes(mustInclude);

    let negatives = [];
    let positives = [];

    if (isPositive) {
      // mustInclude is positive:
      // - pick 1 negative
      // - pick 2 other positives (excluding mustInclude)
      const availableNegatives = NEGATIVE_ADJECTIVES;
      const availablePositives = POSITIVE_ADJECTIVES.filter(a => a !== mustInclude);

      negatives = pickRandom(availableNegatives, 1);
      positives = pickRandom(availablePositives, 2);
      positives.push(mustInclude);
    } else if (isNegative) {
      // mustInclude is negative:
      // - use mustInclude as the single negative
      // - pick 3 positives
      negatives = [mustInclude];
      positives = pickRandom(POSITIVE_ADJECTIVES, 3);
    } else {
      // Fallback: treat like no mustInclude if it's not in either list
      negatives = pickRandom(NEGATIVE_ADJECTIVES, 1);
      positives = pickRandom(POSITIVE_ADJECTIVES, 3);
    }

    const combined = [...negatives, ...positives];

    // Shuffle so order is random
    for (let i = combined.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined;
  }
  
  // Default: 1 negative + 3 positive adjectives.
  const negatives = pickRandom(NEGATIVE_ADJECTIVES, 1);
  const positives = pickRandom(POSITIVE_ADJECTIVES, 3);

  const combined = [...negatives, ...positives];

  // Simple in-place shuffle so the negative isn't always first.
  for (let i = combined.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined;
}


