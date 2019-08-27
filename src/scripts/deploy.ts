import block from '../services/SlackBlock';
import { getOpenedPullRequests, createDeployment } from './lib/github';
import { Command } from '../services/HubotScript';
import { isMember } from './lib/member';

const deploy: Command = {
  name: 'deploy',
  description: 'deploy github projects to alpha, beta by github deployment event',
  isAuthedUser: isMember,
  command: /deploy (alpha|beta) ([^ ]+) ([^ ]+)/,
  action: async (matches, message, client) => {
    const [msg, phase, name, branch] = matches;
    client.send(
      message.channel,
      `start deploying \`${name}\` to \`${phase}\` from \`${branch}\`...`
    );

    const user = await client.getUserInfo(message.user);
    try {
      const deployment = await createDeployment({
        owner: 'kalan',
        repo: name,
        ref: branch,
        environment: phase,
        payload: {
          user,
        },
      });

      const component = block`
        <p>
          <b>Deployment has been established by <mention id="${
            deployment.payload.user.id
          }" type="user" />
          </b>
        </p>
        <hr />
        <fields fields=${block`
          <t><b>Task:</b> \`${deployment.task}\` <br/></t>
          <t><b>Environment:</b> \`${deployment.environment}\` <br/></t>
          <t><b>Description:</b> ${deployment.description}</t>
        `}/>
        <context elements=${block`
          <t>*SHA:* ${deployment.sha}</t>
          <t>*ref:* ${deployment.ref}</t>
        `} />
      `;
      client.send(message.channel, 'Deployment has established', component);
    } catch (error) {
      client.send(message.channel, `can not create deployment. Error: ${error.message}`);
    }
  },
};

const askForReview: Command = {
  name: 'review',
  description: 'ask everyone review open pull requests labeled with `waiting-for-review`',
  isAuthedUser: isMember,
  //            Organization Project
  command: /review ([^ ]+) ([^ ]+)/,
  action: async (matches, message, client) => {
    const [msg, org, name] = matches;

    if (name) {
      try {
        const prs = await getOpenedPullRequests(org, name);

        const text = prs
          .filter(pr =>
            pr.labels.some(l => l.name === 'waiting-for-review' || l.name === 'Waiting for review')
          )
          .map(pr => {
            return {
              title: pr.title,
              assignee: pr.assignee && pr.assignee.login,
              requestedReviewers:
                pr.requested_reviewers &&
                pr.requested_reviewers.map(reviewer => `@<${reviewer.login}>`),
              url: pr.html_url,
            };
          })
          .map((pr, i) => `${i + 1}. <${pr.url}|${pr.title}>\n`);

        if (text.length === 0) {
          client.send(
            message.channel,
            'seems like there is no `waiting-for-review` pull request, hooray!'
          );
          return;
        }

        const component = block`
          <p>Hi, please review the following Pull Request if you have time <br/></p>
          <p>${text.join('')}</p>
        `;

        client.send(
          message.channel,
          'Hi, please review the following Pull Request if you have time \n',
          component
        );
      } catch (err) {
        client.send(message.channel, err.message);
      }
    }
  },
};

export default [deploy, askForReview];
