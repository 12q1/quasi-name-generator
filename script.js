// Constants
const PROB_VOWEL_CLUSTER = 0.2;
const PROB_CONSONANT_CLUSTER = 0.25;
const PROB_START_WITH_VOWEL = 0.3;
const PROB_ADD_FINAL_CLUSTER = 0.4;

const getRandomInt = (max) => Math.floor(Math.random() * max);
const choose = (arr) => arr[getRandomInt(arr.length)];

const phonemes = {
  vowels: ["a", "e", "i", "o", "u"],
  vowelClusters: ["ai", "au", "ea", "ee", "ei", "ie", "oi", "oo", "ou"],
  consonants: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "x", "y", "z"],
  consonantClusters: ["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st", "sw", "th", "tr", "tw", "wh"],
  finalClusters: ["nd", "ng", "nt", "rk", "sh", "th", "ld", "rt", "st"]
};

const toneBias = {
  soft: ["l", "m", "n", "r", "s", "v"],
  hard: ["k", "g", "t", "d", "z", "x"],
  fantasy: ["th", "ae", "dr", "el", "or", "ul", "qu"],
  brand: ["ly", "zo", "ex", "iq", "sy", "io", "za", "ix", "fy"]
};

const filterPhonemes = (exclude) => {
  return Object.fromEntries(
    Object.entries(phonemes).map(([key, value]) => [
      key,
      value.filter(p => !exclude.includes(p))
    ])
  );
};

const generateQuasiName = (options) => {
  const sets = filterPhonemes(options.exclude);

  let name = "";
  let lengthChars = 0;
  const minLen = options.minLength;
  const maxLen = options.maxLength;

  const firstLetter = options.startWith.toLowerCase();
  let useVowel;

  if (firstLetter === 'vowel') {
    useVowel = true;
  } else if (firstLetter === 'consonant') {
    useVowel = false;
  } else if (firstLetter === 'any') {
    useVowel = Math.random() < PROB_START_WITH_VOWEL;
  } else {
    useVowel = phonemes.vowels.includes(firstLetter);
  }

  while (lengthChars < minLen) {
    let phoneme;

    if (useVowel) {
      phoneme = Math.random() < PROB_VOWEL_CLUSTER ? choose(sets.vowelClusters) : choose(sets.vowels);
    } else {
      let pool = Math.random() < PROB_CONSONANT_CLUSTER ? sets.consonantClusters : sets.consonants;
      if (options.tone !== 'neutral') {
        const bias = toneBias[options.tone] || [];
        pool = pool.concat(bias.filter(p => !options.exclude.includes(p)));
        if (options.tone === 'brand') {
          pool = pool.concat(bias); // duplicate for brand-style weighting
        }
      }
      phoneme = choose(pool);
    }

    if ((lengthChars + phoneme.length) <= maxLen) {
      name += phoneme;
      lengthChars += phoneme.length;
    } else {
      break;
    }

    useVowel = !useVowel;
  }

  if (lengthChars < maxLen && Math.random() < PROB_ADD_FINAL_CLUSTER) {
    const finalCluster = choose(sets.finalClusters);
    if (lengthChars + finalCluster.length <= maxLen) {
      name += finalCluster;
    }
  }

  if (!['any', 'vowel', 'consonant'].includes(firstLetter) && name.length > 0) {
    name = firstLetter + name.slice(1);
  }

  name = name.replace(/(.)\1{2,}/g, '$1');
  return name.charAt(0).toUpperCase() + name.slice(1);
};

document.getElementById("generateBtn").addEventListener("click", () => {
  const options = {
    minLength: parseInt(document.getElementById("minLength").value),
    maxLength: parseInt(document.getElementById("maxLength").value),
    tone: document.getElementById("tone").value,
    startWith: document.getElementById("startWith").value,
    exclude: document.getElementById("exclude").value.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  };
  document.getElementById("output").textContent = generateQuasiName(options);
});
