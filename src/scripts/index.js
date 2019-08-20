const scripts = [
  {
    name: 'dep2',
    description: 'deploy line-fortune project to {alpha,beta,release}',
    command: /\!deploy (beta|alpha|release) \s+/,
    isAuthedUser: () => {
      return true;
    },
    action: (robot, match) => {}
  },
  {
    name: 'dep',
    description: 'deploy line-fortune project to {alpha,beta,release}',
    command: /\!deploy (beta|alpha|release) \s+/,
    isAuthedUser: () => {
      return true;
    },
    action: (robot, match) => {}
  },
  {
    name: `review`,
    description: `get pending PRs`,
    command: /review/,
    isAuthedUser: user => {
      if (user.userId !== 'abc') {
        return false;
      }

      return true;
    },
    action: () => {}
  }
];

module.exports = scripts;
