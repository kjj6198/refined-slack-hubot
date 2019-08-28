import Octokit from '@octokit/rest';
import semver from 'semver';
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

export const getLatestRelease = async ({ owner, repo }) => {
  const { data: release } = await octokit.repos.getLatestRelease({ owner, repo });
  return release;
};

export async function createRelease({ owner, repo, tag, phase, branch }) {
  // check if version valid first
  // v1.0.0 -> valid
  // vv1.0.0 -> invalid
  // 1.0.0 -> valid
  const newVer = semver.valid(`${tag}-${phase}`); // return normalized version
  if (!newVer) {
    throw Error('tag should must be valid semver');
  }

  const { data: latestRelease } = await octokit.repos.getLatestRelease({
    owner,
    repo,
  });

  const prevVer = semver.clean(latestRelease.tag_name);

  // previous version shouldn't be greater than current version
  if (semver.gt(prevVer, newVer)) {
    throw Error("Current version shouldn't be less than previous version");
  }

  const newVersion = 'v' + newVer;

  const { data: commit } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: branch,
  });

  const { data } = await octokit.git.createTag({
    owner,
    repo,
    tag: newVersion,
    message: phase,
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
    name: newVersion,
    draft: false,
    prerelease: false,
  });

  const diffs = await compareDiff({
    owner,
    repo,
    base: release.tag_name,
    head: latestRelease.tag_name,
  });

  return {
    release,
    diffs,
  };
}

export async function compareDiff({ owner, repo, base, head }) {
  const { data: diffs } = await octokit.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });

  return diffs;
}

export async function removeRef({ owner, repo, ref }) {
  const { data: result } = await octokit.git.deleteRef({
    owner,
    repo,
    ref,
  });

  return result;
}
