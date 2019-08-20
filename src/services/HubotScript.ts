import MemoryStorage from './MemoryStorage';
// 1. 把 hubot 弄好之後來用 heaven。-> Hubot 可以 publish 到 private npm 試試看。
// 2. 建立 plugin 機制
// 3. retry 機制

type Command = {
  name?: string;
  description?: string;
  command: RegExp | string;
  isAuthedUser: (user) => boolean;
  action: (match, robot) => void;
};

class HubotScript {
  static readScripts() {
    let scripts: Array<Command> = MemoryStorage.get('scripts');

    if (!scripts) {
      scripts = require('../scripts');
      MemoryStorage.set('scripts', scripts);
    }

    return scripts;
  }
}

// loading scripts...

// const scripts = [
//   {
//     command: /¥!deploy (beta|alpha|release) ¥s+/,
//     isAuthedUser: () => {
//       return true;
//     },
//     action: (robot, match) => {

//     },
//   },
//   {
//     name: `review`,
//     description: `
//     Description: get pending PRs
//     Usage:
//     `,
//     command: /review/,
//     isAuthedUser: (user) => {
//       if (user.userId !== 'abc') {
//         return false;
//       }

//       return true;
//     },
//     action: () => {

//     }
//   }
// ];

// class HubotScript implements Commandable {
//   get command() {
//     return /¥!deploy (beta|alpha|release) ¥s+/;
//   }

//   action(robot, match) {
//     const component = `
//       <section>Start deployment for ${}</section>
//       <hr />
//       <context element=${html`
//         <strong>env:</strong>
//         <text>alpha</text>
//       `}/>
//     `

//     robot.send();
//   }
// }

// export default (robot) => {

//   robot.hear();
//   robot.hear();
//   robot.hear();
// }

// // 1. 如何避免 request 暴衝？用 redis 解掉？
// // 2. 簡單的 load balancer
// // 3. 避免 Logger 把 system 塞爆

export default HubotScript;
