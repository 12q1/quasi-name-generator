// === Constants ===
const PROB_VOWEL_CLUSTER = 0.2;
const PROB_CONSONANT_CLUSTER = 0.25;
const PROB_START_WITH_VOWEL = 0.3;
const PROB_ADD_FINAL_CLUSTER = 0.4;
const MAX_ATTEMPTS = 1000;

// === Utility Functions ===
const getRandomInt = (max) => Math.floor(Math.random() * max);
const choose = (arr) => arr[getRandomInt(arr.length)];

// === Phoneme Pools ===
const phonemes = {
  vowels: ["a", "e", "i", "o", "u"],
  vowelClusters: ["ae", "ai", "au", "ea", "ee", "ei", "eo", "eu", "ie", "io", "oa", "oe", "oo", "ou", "ua", "ue", "ui", "ia"],
  consonants: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"],
  consonantClusters: [
    "bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "kn", "ph", "pl", "pr",
    "qu", "sc", "scr", "sh", "shr", "sk", "sl", "sm", "sn", "sp", "spl", "spr", "st", "str",
    "sw", "th", "tr", "tw", "vr", "wh", "xr", "zh", "zr", "gn", "brn"
  ],
  finalClusters: [
    "nd", "ng", "nt", "rk", "sh", "th", "ld", "rt", "st", "rd", "rm", "rn", "lp", "lt", "mp", "ft", "pt",
    "sk", "sp", "zz", "xx", "nch", "rch", "rth", "nth", "stle"
  ]
};

const toneBias = {
  soft: ["l", "m", "n", "r", "s", "v"],
  hard: ["k", "g", "t", "d", "z", "x"],
  fantasy: ["ae", "qu", "dr", "el", "or", "ul", "th", "ar", "ion", "ys", "yx", "zar"],
  brand: ["ly", "zo", "ex", "iq", "sy", "io", "za", "ix", "fy"]
};

// === Filters phonemes by exclusion list ===
const filterPhonemes = (exclude) => {
  return Object.fromEntries(
    Object.entries(phonemes).map(([key, value]) => [
      key,
      value.filter(p => !exclude.includes(p))
    ])
  );
};

// === Name Generator ===
const generateQuasiName = (options) => {
  const sets = filterPhonemes(options.exclude);

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

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let name = "";
    let lengthChars = 0;
    useVowel = useVowel ?? Math.random() < PROB_START_WITH_VOWEL;

    while (lengthChars < options.maxLength) {
      let phoneme;

      if (useVowel) {
        phoneme = Math.random() < PROB_VOWEL_CLUSTER ? choose(sets.vowelClusters) : choose(sets.vowels);
      } else {
        let pool = Math.random() < PROB_CONSONANT_CLUSTER ? sets.consonantClusters : sets.consonants;

        if (options.tone !== 'neutral') {
          const bias = toneBias[options.tone] || [];
          pool = pool.concat(bias.filter(p => !options.exclude.includes(p)));
          if (options.tone === 'brand') {
            pool = pool.concat(bias); // double weight
          }
        }

        phoneme = choose(pool);
      }

      if ((lengthChars + phoneme.length) > options.maxLength) break;
      name += phoneme;
      lengthChars += phoneme.length;
      useVowel = !useVowel;
    }

    if (lengthChars < options.maxLength && Math.random() < PROB_ADD_FINAL_CLUSTER) {
      const finalCluster = choose(sets.finalClusters);
      if (lengthChars + finalCluster.length <= options.maxLength) {
        name += finalCluster;
      }
    }

    // Respect specific starting letter (if one is provided)
    if (!['any', 'vowel', 'consonant'].includes(firstLetter) && name.length > 0) {
      name = firstLetter + name.slice(1);
    }

    name = name.replace(/(.)\1{2,}/g, '$1'); // remove repeated characters
    name = name.charAt(0).toUpperCase() + name.slice(1);

    if (name.length >= options.minLength) {
      return name;
    }
  }

  return "(No valid name found)";
};

// === UI Hook ===
document.getElementById("generateBtn").addEventListener("click", () => {
  const excludeList = document.getElementById("exclude").value
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const options = {
    minLength: parseInt(document.getElementById("minLength").value),
    maxLength: parseInt(document.getElementById("maxLength").value),
    tone: document.getElementById("tone").value,
    startWith: document.getElementById("startWith").value,
    exclude: excludeList
  };

  document.getElementById("output").textContent = generateQuasiName(options);
});
