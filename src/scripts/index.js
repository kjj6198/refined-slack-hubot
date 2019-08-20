
const scripts = [
  {
    command: /¥!deploy (beta|alpha|release) ¥s+/,
    isAuthedUser: () => {
      return true;
    },
    action: (robot, match) => {

    },
  },
  {
    name: `review`,
    description: `
    Description: get pending PRs
    Usage:
    `,
    command: /review/,
    isAuthedUser: (user) => {
      if (user.userId !== 'abc') {
        return false;
      }

      return true;
    },
    action: () => {

    }
  }
];

module.exports = scripts;