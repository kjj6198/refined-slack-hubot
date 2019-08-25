import htm from 'htm';

function createLink(title: string, href: string) {
  return `<${href}|${title}>`;
}

function createDivider() {
  return {
    type: 'divider'
  };
}

function createContext({
  elements
}: {
  elements: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
}) {
  return {
    type: 'context',
    elements
  };
}

function createText(text) {
  return {
    type: 'mrkdwn',
    text
  };
}

function createFields(fields) {
  return {
    type: 'section',
    fields
  };
}

function createPlainText(text: string) {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text
    }
  };
}

function createBlock(type: string, text: string, useMrkdwn?: boolean) {
  return {
    type,
    text: {
      type: useMrkdwn ? 'mrkdwn' : 'plain_text',
      text
    }
  };
}

function createImage(title: string, imageURL: string, alt: string = '') {
  return {
    type: 'image',
    title: {
      type: 'plain_text',
      text: title,
      emoji: true
    },
    image_url: imageURL,
    alt_text: alt
  };
}

function createMention(id: string, type: string) {
  switch (type) {
    case 'channel':
      return `<#${id}>`;
    case 'user':
      return `<@${id}>`;
    default:
      return `<@${id}>`;
  }
}

function mapMarkupToBlock(type, props, ...children) {
  if (typeof type === 'function') {
    return type({
      ...props,
      children
    });
  }

  switch (type) {
    case 'a':
      return createLink(children.join(''), props.href);
    case 'section':
      return createBlock(
        'section',
        children.join(''),
        props && props.useMarkdown
      );
    case 'p':
    case 'text':
      return createPlainText(children.join(''));
    case 't':
      return createText(children.join(''));
    case 'img':
      return createImage(props.title, props.src, props.alt);
    case 'br':
      return '\n';
    case 'hr':
      return createDivider();
    case 'context':
      return createContext(props);
    case 'b':
    case 'strong':
      return `*${children.join('')}*`;
    case 'fields':
      return createFields(props.fields);
    case 'i':
      return `_${children.join('')}_`;
    case 'mention':
      return createMention(props.id, props.type);
    default:
      return createBlock('section', children.join(''), false);
  }
}

export default htm.bind(mapMarkupToBlock);
