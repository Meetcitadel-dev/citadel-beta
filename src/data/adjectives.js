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
  // If we must include a specific adjective, we generate 3 random + that one
  if (mustInclude) {
    // Filter out the mustInclude adjective from both pools
    const availableNegatives = NEGATIVE_ADJECTIVES.filter(a => a !== mustInclude);
    const availablePositives = POSITIVE_ADJECTIVES.filter(a => a !== mustInclude);
    
    // Pick 3 random adjectives (mix of negative and positive)
    const negatives = pickRandom(availableNegatives, 1);
    const positives = pickRandom(availablePositives, 2);
    
    const combined = [...negatives, ...positives, mustInclude];
    
    // Shuffle
    for (let i = combined.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    
    return combined;
  }
  
  // Always return 1 negative + 3 positive adjectives.
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


