import block from '../services/SlackBlock';
import { Command } from '../services/HubotScript';
import getVocabularies from './lib/dictionary';

const search: Command = {
  name: 'dict',
  description: 'search word or sentense between english and japanese',
  isAuthedUser: () => true,
  command: /search (.+)/,
  action: async (matches, message, client) => {
    const [msg, word] = matches;
    const { data: result } = await getVocabularies(word);

    if (Array.isArray(result) && result.length > 0) {
      const [first] = result;
      const [relative] = first.senses;

      const component = block`
        <p>
          Word: <br/>
          <b>${first.slug} (${first.japanese
        .map(j => j.reading)
        .join(', ')})</b>
        </p>
        <hr />
        <p><b>meaning:</b><br/></p>
        <p>${relative.english_definitions
          .map((d, i) => `${i + 1}. ${d}`)
          .join('\n')}</p>
        <context elements=${[
          block`
          <t>*jlpt:* ${
            first.jlpt.length === 0
              ? 'not defined'
              : first.jlpt.map(j => j.replace('jlpt-', '')).join(',')
          }</t>
        `
        ]} />
      `;
      console.log(first, component);
      client.send(message.channel, 'result:', component);
    }
  }
};

export default [search];
