const { getOpenedPullRequests, createDeployment } = require('./lib/github');

const memebers = [
  { name: 'aidi', id: 'W958034MB'},
  { name: 'mrt51', id: 'W94ES5UPJ'},
  { name: 'nakaly', id: 'W94EREC1E'},
  { name: 'veronica-xue', id: 'W951KE5RR'},
  { name: 'jimmyh', id: 'WB75VSFGR'},
  { name: 'masami-yonehara', id: 'W9665QEAK'},
  { name: 'thomas', id: 'WEFPJJLE5'},
  { name: 'ldange', id: 'WGK3UHEGH'},
  { name: 'maedah', id: 'WJP91TQV6'},
  { name: 'kalan', id: 'WKU8E7CLR'},
];

const deploy = {
  name: 'deploy',
  description: 'deploy line-fortune frontend related projects to alpha, beta',
  isAuthedUser(userId, message) {
    if (memebers.some(m => m.id === userId)) {
      return true;
    }

    return false;
  },
  command: /deploy (alpha|beta) ([^ ]+) ([^ ]+)/,
  action: async (matches, message, client) => {
    const [msg, phase, name, branch] = matches;
    client.send(message.channel, `start deploying ${name} to ${phase} from ${branch}`);
    const user = await client.getUserInfo(message.user);
    try {
      const deployment = await createDeployment({
        owner: 'kalan',
        repo: 'Channel-Web-Application',
        ref: branch,
        environment: phase,
        payload: {
          user,
        },
      });
      
      client.send(message.channel, 'Deployment has established', [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Deployment has established by <@${deployment.payload.user.id}>*`,
          }
        },
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Task:*\n\`${deployment.task}\`\n*Environment:*\n\`${deployment.environment}\`\n*Description:*\n${deployment.description}\n*Deployment id:* ${deployment.id}`,
          }
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `*SHA:* ${deployment.sha}` },
            { type: 'mrkdwn', text: `*ref*: ${deployment.ref}` },
          ],
        }
      ]);
    } catch (error) {
      client.send(message.channel, `can not deploy. Error: ${error.message}`);
    }
  },
};

const askForReview = {
  name: 'review',
  description: 'ask everyone review open pull requests',
  command: /review ([^ ]+)/,
  action: async (matches, message, client) => {
    const [msg, name] = matches;

    if (name) {
      try {
        const prs = await getOpenedPullRequests('Line-Fortune', name);

        const text = prs
          .filter(pr => pr.labels.some(l => l.name === 'waiting-for-review'))
          .map(pr => {
            return {
              title: pr.title,
              assignee: pr.assignee && pr.assignee.login,
              requestedReviewers: pr.requested_reviewers && pr.requested_reviewers.map(reviewer => reviewer.login),
              url: pr.html_url,
            }
          })
          .map((pr, i) => `${i + 1}. <${pr.url}|${pr.title}> @${pr.assignee} requested reviewers: ${pr.requestedReviewers.join(', ')}`);
        
        if (text.length === 0) {
          client.send(message.channel, 'seems like there is no `waiting-for-review` pull request, hooray!');
          return
        }
        
        client.send(message.channel, 'Hi, please review the following Pull Request if you have time \n', [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hi, please review the following Pull Request if you have time\n ${text.join('')}`,
            }
          }
        ]);
      } catch (err) {
        client.send(message.channel, err.message);
      }
    }
  },
};

module.exports = [
  deploy,
  askForReview,
]; 