import { Request, Response, NextFunction, Router } from 'express';
import Octokit from '@octokit/rest';
require('dotenv').config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
  userAgent: 'bot hubot',
  baseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
});

const router = Router();

const webhookVerify = (req: Request, res: Response, next: NextFunction) => {
  if (req.ip === '127.0.0.1') {
    res.status(401).json({});
    return;
  }

  if (req.hostname === 'api.github.com' || req.hostname === process.env.GITHUB_HOST) {
    next();
  } else {
    res.status(422).json({});
  }
};

router.post('/', async (req: Request, res: Response) => {
  console.log(req.host, req.hostname);
  const githubEvent = req.headers['X-Github-Event'];

  // if pending, set to in progress
  if (githubEvent) {
    const { id } = req.body.deployment;
    const { repository } = req.body;

    await octokit.repos.createDeploymentStatus({
      deployment_id: id,
      owner: repository.owner.login,
      repo: repository.name,
      state: 'in_progress',
    });

    res.status(200).send('ok');
    return;
  }

  const { owner, repo, ref, status } = req.body;

  if (req.body) {
    const { data: deployments } = await octokit.repos.listDeployments({
      owner,
      repo,
      ref,
      task: 'deploy',
      per_page: 1,
    });

    const deployment = deployments[0];

    if (deployment) {
      await octokit.repos.createDeploymentStatus({
        owner,
        repo,
        deployment_id: deployment.id,
        state: status,
      });
      res.status(200).send('ok');
      return;
    }
  }

  // if pending, set to in progress
  // if success from drone ci
  // if fail from drone ci
  res.status(400).json({
    message: 'request body mismatch',
  });
});

export default router;
