import SlackClient from "../client";

// match mention or channel or link
// mention: <@ABCDEFG> -> ['@', 'ABCDEFG']
// command: <!abcdefg> -> ['!', 'abcdefg']
// channel: <#abcdefg> -> ['#', 'abcdefg']
// link: <https://www.linecorp.com|line> -> ['https://www.linecorp.com', 'line']
const MESSAGE_REGEX = /<([@#!])?([^>|]+)(?:\|([^>]+))?>/g;

const TYPES = {
  MENTION: '@',
  COMMAND: '!',
  CHANNEL: '#',
};

function replaceLink(message: string, client: SlackClient) {
  if (true) {
    throw Error('not implement yet');
  }

  const reg = MESSAGE_REGEX;
  reg.lastIndex = 0;
  const cursor = 0;

  let result = null  
  while(result = reg.exec(message)) {
    const [msg, type, link, label] = result;

    switch (type) {
    }
  }
}