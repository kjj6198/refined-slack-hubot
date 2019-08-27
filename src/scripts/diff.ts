import { Command } from '../services/HubotScript';
import { compareDiff } from './lib/github';
import block from '../services/SlackBlock';

const toString = commits =>
  commits
    .map(
      commit =>
        `\`${commit.sha.slice(0, 7)}\` ${commit.commit.message} - ${commit.commit.committer.name}`
    )
    .join('\n');

const Diff = ({ base, head, diff, repo }) => block`
  <p><a href=${diff.html_url}>Diff</a> between \`${base}\` and \`${head}\` - ${repo}</p>
  <p><b>Total Commits: \`${diff.total_commits}\`</b></p>
  <hr />
  <p>${toString(diff.commits)}</p>
`;

const diff: Command = {
  name: 'diff',
  description: 'diff owner repo base...head',
  //              owner    repo    base    head
  command: /diff ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)/,
  action: async (match, message, client) => {
    const [msg, owner, repo, base, head] = match;

    try {
      const diffs = await compareDiff({
        owner,
        repo,
        base,
        head,
      });

      client.send(
        message.channel,
        '',
        block`<${Diff} repo=${repo} base=${base} head=${head} diff=${diffs} />`
      );
    } catch (err) {
      client.send(message.channel, `ERROR: ${err.message}`);
    }
  },
};

export default [diff];
