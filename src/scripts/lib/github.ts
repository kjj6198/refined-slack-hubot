import Octokit from '@octokit/rest';
require('dotenv').config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
  userAgent: 'bot hubot',
  baseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
});

export async function getOpenedPullRequests(owner, repo) {
  const { data: pullRequests } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    sort: 'created',
  });

  return pullRequests;
}

// it'll trigger deployment event
export async function createDeployment({
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

  await octokit.repos.createDeploymentStatus({
    owner,
    repo,
    deployment_id: deployment.id,
    state: 'pending',
  });

  await octokit.repos.createDeploymentStatus({
    owner,
    repo,
    deployment_id: deployment.id,
    state: 'in_progress',
  });

  return deployment;
}

export async function createTag({ owner, repo, tag, message, branch }) {
  const { data: commit } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: branch,
  });

  const { data } = await octokit.git.createTag({
    owner,
    repo,
    tag,
    message,
    object: commit.sha,
    type: 'commit',
  });

  const { data: ref } = await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${data.tag}`,
    sha: commit.sha,
  });

  const { data: release } = await octokit.repos.createRelease({
    owner,
    repo,
    tag_name: data.tag,
    name: `${data.tag}-${message}`,
    draft: true,
    prerelease: true,
  });

  return release;
}

export async function removeRef({ owner, repo, ref }) {
  const { data: result } = await octokit.git.deleteRef({
    owner,
    repo,
    ref,
  });

  return result;
}
