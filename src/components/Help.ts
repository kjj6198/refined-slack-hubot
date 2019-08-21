import block from '../services/SlackBlock';
import alignText from '../utils/alignText';
import { Command } from '../services/HubotScript';

const Help = ({ scripts }) => {
  const commands = scripts
    .filter((s: Command) => s.name || s.description)
    .map((s: Command) => `${s.name}   ${s.description}`);

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
