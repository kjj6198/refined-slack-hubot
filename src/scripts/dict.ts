import block from '../services/SlackBlock';
import { Command } from '../services/HubotScript';
import getVocabularies from './lib/dictionary';

const search: Command = {
  name: 'search',
  description:
    'search %s: search word or sentense between english and japanese',
  isAuthedUser: () => true,
  command: /search (.+)/,
  action: async (matches, message, client) => {
    const [msg, word] = matches;
    try {
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

        client.send(message.channel, 'result:', component, message.ts);
      } else {
        client.send(
          message.channel,
          'Not Found',
          block`
        <p>もっと勉強して改善します</p>
        <p>Can not found word or sentence, please simplify your keyword</p>
      `
        );
      }
    } catch (err) {
      client.send(
        message.channel,
        `can not search word ${word}. Error: ${err.message}`
      );
    }
  }
};

export default [search];
