import block from '../SlackBlock';

describe('SlackBlock#block``', () => {
  it('<a> tag', () => {
    const render = block`<a href="https://www.shurado.com">hello</a>`;
    const expected = {
      type: 'mrkdwn',
      text: '<https://www.shurado.com|hello>'
    };
    expect(render).toEqual(expected);
  });

  it('<section/>', () => {
    const render = block`
      <section>hello</section>
    `;

    const expected = {
      type: 'section',
      text: {
        type: 'plain_text',
        text: 'hello'
      }
    };

    expect(render).toEqual(expected);
  });

  it('<section userMarkdown></section>', () => {
    const render = block`
      <section useMarkdown>hello</section>
    `;

    const expected = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'hello'
      }
    };

    expect(render).toEqual(expected);
  });

  it('<p />', () => {
    const render = block`
      <p>any text *I'm markdown*</p>
      <p>any text2 *I'm markdown*</p>
    `;

    const renderText = block`
      <text>any text *I'm markdown*</text>
      <text>any text2 *I'm markdown*</text>
    `;

    const expected = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `any text *I'm markdown*`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `any text2 *I'm markdown*`
        }
      }
    ];

    expect(render).toEqual(expected);
    expect(renderText).toEqual(expected);
  });

  it('<img/>', () => {
    const url = 'https://www.line.com';
    const render = block`
      <img src="${url}" alt="test" title="test" />
    `;

    const expected = {
      type: 'image',
      title: {
        type: 'plain_text',
        text: 'test',
        emoji: true
      },
      image_url: url,
      alt_text: 'test'
    };

    expect(render).toEqual(expected);
  });

  it('<hr/>', () => {
    expect(block`<hr/>`).toEqual({
      type: 'divider'
    });
  });

  // context is still testing...
  it.skip('context', () => {
    expect(block`
      <context elements=${[
        block`
        <t>1</t>
        <t>2</t>
        <t>3</t>
        <t>4</t>
      `
      ]} />
    `).toEqual({
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: '1' },
        { type: 'mrkdwn', text: '2' },
        { type: 'mrkdwn', text: '3' },
        { type: 'mrkdwn', text: '4' }
      ]
    });
  });

  it('<strong />', () => {
    expect(block`<strong>text</strong>`).toEqual({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*text*'
      }
    });
  });

  it('<i>', () => {
    expect(block`<i>eee</i>`).toEqual({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_eee_'
      }
    });
  });

  it('<fields>', () => {
    expect(block`
      <fields fields=${block`
        <t>1</t>
        <t>2</t>
      `} />
    `).toEqual({
      type: 'section',
      fields: [{ text: '1', type: 'mrkdwn' }, { text: '2', type: 'mrkdwn' }]
    });
  });
});
