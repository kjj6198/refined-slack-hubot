import block from '../services/SlackBlock';
import alignText from '../utils/alignText';

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
