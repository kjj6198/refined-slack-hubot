import { Command } from '../services/HubotScript';
import { createRelease, removeRef } from './lib/github';
import block from '../services/SlackBlock';
import memebers from './lib/member';

const Success = ({ name, repo, env, link }) => block`
  <p>Release \`${name}\` has been created</p>
  <p><a href=${link}>${name}</a></p>
  
  <context elements=${block`
    <t>repo: ${repo}</t>
    <t>env: ${env}</t>
  `} />
`;

const release: Command = {
  name: 'release',
  description: 'release (alpha|beta) owner repo branch version',
  command: /release (alpha|beta|release) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)/,
  isAuthedUser: userId => memebers.some(member => member.id === userId),
  action: async (match, message, client) => {
    const [msg, env, owner, repo, branch, version] = match;
    try {
      const release = await createRelease({
        owner,
        repo,
        message: env,
        name: version,
        branch,
      });

      client.send(
        message.channel,
        `Release ${version} has been created`,
        block`
            <p><mention type="user" id="${message.user}" /></p>
            <${Success} name=${version} repo=${repo} env=${env} link=${release.html_url} />
            <context elements=${block`
              <t>tag: ${release.tag_name}</t>
            `} />
          `
      );
    } catch (err) {
      client.send(message.channel, `ERROR: ${err.message}`);
    }
  },
};

// still testing
const remove: Command = {
  name: 'remove',
  description: 'remove release version',
  command: /remove ([^ ]+) ([^ ]+) ([^ ]+)/,
  isAuthedUser: () => true,
  action: async (match, message, client) => {
    const [msg, owner, repo, version] = match;

    try {
      const result = await removeRef({
        owner,
        repo,
        ref: version,
      });
      client.send(
        message.channel,
        '',
        block`
        <p>Successfully removed release version \`${version}\`</p>
      `
      );
    } catch (err) {
      client.send(message.channel, `ERROR: ${err.message}`);
    }
  },
};

export default [release];
