const getRandomInt = (max) => Math.floor(Math.random() * max);

const generateQuasiName = () => {
  const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "x", "y", "z"];
  const diagraphs = ["bl", "br", "ch", "ck", "cl", "cr", "dr", "fl", "fr", "gh", "gl", "gr", "ph", "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st", "sw", "th", "tr", "tw", "wh", "wr"];
  const vowels = ["a", "e", "i", "o", "u"];
  const vowelDiagraphs = ["ai", "au", "ea", "ee", "ei", "eu", "ie", "oi", "oo", "ou"];

  let name = "";
  let nameLength = getRandomInt(4) + 3;
  let shouldVowel = getRandomInt(9) < 3;

  for (let i = 0; i < nameLength; i++) {
    if (shouldVowel) {
      name += (getRandomInt(9) < 2 && i !== nameLength - 1)
        ? vowelDiagraphs[getRandomInt(vowelDiagraphs.length)]
        : vowels[getRandomInt(vowels.length)];
    } else {
      name += (getRandomInt(9) < 2)
        ? diagraphs[getRandomInt(diagraphs.length)]
        : consonants[getRandomInt(consonants.length)];
    }
    shouldVowel = !shouldVowel;
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
};

document.getElementById("generateBtn").addEventListener("click", () => {
  document.getElementById("output").textContent = generateQuasiName();
});
