import htm from 'htm';

function createLink(title: string, href: string) {
  return createText(`<${href}|${title}>`);
}

function createDivider() {
  return {
    type: 'divider'
  };
}

function createContext(
  elements: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>
) {
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
    case 'hr':
      return createDivider();
    case 'context':
      return createContext(props);
    case 'strong':
      return createBlock('section', `*${children.join('')}*`, true);
    case 'fields':
      return createFields(props.fields);
    case 'i':
      return createBlock('section', `_${children.join('')}_`, true);
    default:
      return createBlock('section', children.join(''), false);
  }
}

export default htm.bind(mapMarkupToBlock);
