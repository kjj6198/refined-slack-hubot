function findMinLength(commands: Array<string>, padding: number = 3) {
  let min = 1000;
  for (let i = 0; i < commands.length; i++) {
    const stringL = commands[i].split(' '.repeat(padding));
    min = Math.min(stringL[0].length, min);
  }

  return min;
}

function findMaxLength(commands: Array<string>, padding = 3) {
  let max = 0;
  for (let i = 0; i < commands.length; i++) {
    const stringL = commands[i].split(' '.repeat(padding));
    max = Math.max(stringL[0].length, max);
  }

  return max;
}

// convert
// ci   get CI function
// deploy   deploy to {alpha, beta, release}
//
// to
// ci       get CI function
// deploy   deploy to {alpha, beta, release}
export default function alignText(commands: Array<string>) {
  const min = findMinLength(commands);
  const max = findMaxLength(commands);

  return commands.map(c => {
    const [L, R] = c.split('   ');
    if (L.length === max) {
      return c;
    }

    if (L.length > min) {
      return L + ' '.repeat(max - L.length) + '   ' + R;
    } else if (L.length === min) {
      return L + ' '.repeat(max - min) + '   ' + R;
    }
  });
}
