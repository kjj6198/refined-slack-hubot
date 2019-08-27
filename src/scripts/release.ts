import block from '../services/SlackBlock';
import { Command } from '../services/HubotScript';
import { createTag, compareDiff } from './lib/github';
import flatten from '../utils/flatten';

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

const release: Command = {
  name: 'release',
  description: 'release (alpha|beta|release) owner repo branch tagname',
  command: /release (alpha|beta|release) ([^ ]+) ([^ ]+) ([^ ]+) ([^ ]+)/,
  isAuthedUser: (userId, message) => true,
  action: async (match, message, client) => {
    const [msg, env, owner, repo, branch, tagName] = match;

    try {
      const release = await createTag({ owner, repo, branch, tag: tagName, message: env });
      const diffs = await compareDiff({
        owner,
        repo,
        base: 'master',
        head: release.tag_name,
      });

      const component = block`
        <${Success}
          tag=${release.tag_name}
          title=${release.name}
          link=${release.html_url}
          repo=${repo}
          env=${env}
          userId=${message.user}
        />
        <hr/>
        <p>
          <a href="${diffs.html_url}">\`master\`...\`${release.tag_name}\`</a><br/>
        </p>
        <p><b>Total Commits: \`${diffs.total_commits}\`</b><br/></p>
        <p>
          ${diffs.commits
            .map(
              commit =>
                `\`${commit.sha.slice(0, 7)}\` ${commit.commit.message} - ${
                  commit.commit.committer.name
                }`
            )
            .join('\n')}
        </p>
      `;
      // console.log(component);
      client.send(message.channel, '', flatten(component));
    } catch (err) {
      client.send(message.channel, err.message, [block`<${ErrorMessage} err="${err.message}" />`]);
    }
  },
};

export default [release];
