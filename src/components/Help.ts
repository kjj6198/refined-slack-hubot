import block from '../services/SlackBlock';

function findMinLength(commands, padding = 3) {
  let min = 1000;
  for (let i = 0; i < commands.length; i++) {
    const stringL = commands[i].split(' '.repeat(padding));
    min = Math.min(stringL[0].length, min);
  }

  return min;
}

function findMaxLength(commands, padding = 3) {
  let max = 0;
  for (let i = 0; i < commands.length; i++) {
    const stringL = commands[i].split(' '.repeat(padding));
    max = Math.max(stringL[0].length, max);
  }

  return max;
}

function alignText(commands) {
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

const Help = ({ scripts }) => {
  const commands = scripts
    .filter(s => s.name || s.description)
    .map(s => `${s.name}   ${s.description}`);

  const alignedCommands = alignText(commands).map(
    s => block`
        <p>${s}</p>
      `
  );

  return block`
    <strong>COMMAND: </strong>
    ${alignedCommands}
  `;
};

export default Help;
