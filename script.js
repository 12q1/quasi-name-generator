const getRandomInt = (max) => Math.floor(Math.random() * max);
const choose = (arr) => arr[getRandomInt(arr.length)];

const phonemes = {
  vowels: ["a", "e", "i", "o", "u"],
  vowelClusters: ["ai", "au", "ea", "ee", "ei", "ie", "oi", "oo", "ou"],
  consonants: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "x", "y", "z"],
  consonantClusters: ["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st", "sw", "th", "tr", "tw", "wh"],
  finalClusters: ["nd", "ng", "nt", "rk", "sh", "th", "ld", "rt", "st"]
};

const filterPhonemes = (exclude) => {
  const sets = JSON.parse(JSON.stringify(phonemes));
  if (exclude.length === 0) return sets;
  for (const key in sets) {
    sets[key] = sets[key].filter(p => !exclude.includes(p));
  }
  return sets;
};

const generateQuasiName = (options) => {
  const sets = filterPhonemes(options.exclude);

  const toneBias = {
    soft: ["l", "m", "n", "r", "s", "v"],
    hard: ["k", "g", "t", "d", "z", "x"],
    fantasy: ["th", "ae", "dr", "el", "or", "ul", "qu"]
  };

  let name = "";
  let lengthChars = 0;
  const minLen = options.minLength;
  const maxLen = options.maxLength;
  let useVowel = options.startWith === 'vowel' ? true : options.startWith === 'consonant' ? false : getRandomInt(100) < 30;

  while (lengthChars < minLen) {
    let phoneme;
    if (useVowel) {
      phoneme = (getRandomInt(100) < 20 ? choose(sets.vowelClusters) : choose(sets.vowels));
    } else {
      let pool = (getRandomInt(100) < 25 ? sets.consonantClusters : sets.consonants);
      if (options.tone !== 'neutral') {
        pool = pool.concat(toneBias[options.tone].filter(p => !options.exclude.includes(p)));
      }
      phoneme = choose(pool);
    }

    if (lengthChars + phoneme.length <= maxLen) {
      name += phoneme;
      lengthChars += phoneme.length;
    } else {
      break;
    }

    useVowel = !useVowel;
  }

  if (lengthChars < maxLen && getRandomInt(100) < 40) {
    const finalCluster = choose(sets.finalClusters);
    if (lengthChars + finalCluster.length <= maxLen) {
      name += finalCluster;
    }
  }

  name = name.replace(/(.)\\1{2,}/g, '$1'); // prevent triple repeating chars
  return name.charAt(0).toUpperCase() + name.slice(1);
};


document.getElementById("generateBtn").addEventListener("click", () => {
  const options = {
    minLength: parseInt(document.getElementById("minLength").value),
    maxLength: parseInt(document.getElementById("maxLength").value),
    tone: document.getElementById("tone").value,
    startWith: document.getElementById("startWith").value,
    exclude: document.getElementById("exclude").value.split(',').map(e => e.trim()).filter(Boolean)
  };
  document.getElementById("output").textContent = generateQuasiName(options);
});