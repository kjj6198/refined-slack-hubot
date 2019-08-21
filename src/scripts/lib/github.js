const Octokit = require('@octokit/rest');
require('dotenv').config();

const octokit = Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
  userAgent: 'bot hubot',
  baseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
});

async function getOpenedPullRequests(owner, repo) {
  const { data: pullRequests } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    sort: 'created',
  });

  return pullRequests;
}

// it'll trigger deployment event
async function createDeployment({
  owner,
  repo,
  ref,
  environment = 'alpha',
  description = 'deployment event triggered by hubot',
  payload,
}) {
  const { data: deployment } = await octokit.repos.createDeployment({
    owner,
    repo,
    ref,
    auto_merge: false,
    payload,
    environment,
    description,
  });

  return deployment;
}

module.exports = {
  getOpenedPullRequests,
  createDeployment,
}