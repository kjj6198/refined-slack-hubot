import block from '../services/SlackBlock';
import { Command } from '../services/HubotScript';
import { createRelease, getLatestRelease } from './lib/github';
import { isMember, channelIsValid } from './lib/member';

const Success = ({ tag, link, title, repo, env, userId }) => block`
  <p><mention type="user" id="${userId}" /><b>Release \`${tag}\` has been created</b></p>
  <p><a href=${link}>${title}</a></p>
  <context elements=${block`
    <t><b>repo:</b> ${repo}</t>
    <t><b>env:</b> ${env} </t>
  `}/>
`;

const ErrorMessage = ({ err }) => block`
  <p><b>ERROR:</b> ${err}</p>
`;

const Diff = ({ diffs }) => {
  if (diffs.commits.length === 0) {
    return null;
  }

  return block`
  <p>
    ${diffs.commits
      .map(
        commit =>
          `\`${commit.sha.slice(0, 7)}\` ${commit.commit.message} - ${commit.commit.committer.name}`
      )
      .join('\n')}
  </p>
  `;
};

const release: Command = {
  name: 'release',
  description: 'release (alpha|beta|release) owner repo branch tagname',
  command: /release (alpha|beta|release) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)/,
  isAuthedUser: isMember,
  enableChannels: channelIsValid,
  action: async (match, message, client) => {
    const [msg, phase, owner, repo, branch, tagName] = match;

    try {
      const { release, diffs } = await createRelease({ owner, repo, branch, tag: tagName, phase });

      const component = block`
        <${Success}
          tag=${release.tag_name}
          title=${release.name}
          link=${release.html_url}
          repo=${repo}
          env=${phase}
          userId=${message.user}
        />
        <hr/>
        <${Diff} diffs=${diffs} />
      `;

      client.send(message.channel, '', component);
    } catch (err) {
      client.send(message.channel, err.message, [block`<${ErrorMessage} err="${err.message}" />`]);
    }
  },
};

const latestRelease: Command = {
  name: 'latest',
  description: 'latest owner repo',
  enableChannels: channelIsValid,
  command: /latest\s+([^ ]+)\s+([^ ]+)/,
  action: async (matches, message, client) => {
    const [msg, owner, repo] = matches;

    try {
      const release = await getLatestRelease({ owner, repo });
      const component = block`
      <p>
        <a href="${release.html_url}">${release.name}</a>
      </p>
      <hr/>
      <p>${release.body || 'EMPTY'}</p>
      <context elements=${block`
        <t>Tag: ${release.tag_name}</t>
        <t>Created: ${release.created_at}</t>
      `} />
      `;

      client.send(message.channel, '', component);
    } catch (err) {
      client.send(message.channel, `ERROR: ${err.message}`);
    }
  },
};

export default [release, latestRelease];
