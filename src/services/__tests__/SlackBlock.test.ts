import block from '../SlackBlock';

describe('SlackBlock#block``', () => {
  it('<a> tag', () => {
    const render = block`<a href="https://www.shurado.com">hello</a>`;
    expect(render).toEqual('<https://www.shurado.com|hello>');
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
    expect(block`<strong>text</strong>`).toEqual('*text*');
  });

  it('<i>', () => {
    expect(block`<i>eee</i>`).toEqual('_eee_');
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

  it('can compose component', () => {
    const component = block`
      <p>hello world</p>
      <text>are you ok</text>
      <img src="http://www.img.com" alt="test" title="hello" />
      <p><strong>hello</strong> world</p>
    `;

    expect(component).toStrictEqual([
      { text: { text: 'hello world', type: 'mrkdwn' }, type: 'section' },
      { text: { text: 'are you ok', type: 'mrkdwn' }, type: 'section' },
      {
        alt_text: 'test',
        image_url: 'http://www.img.com',
        title: { emoji: true, text: 'hello', type: 'plain_text' },
        type: 'image'
      },
      { text: { text: '*hello* world', type: 'mrkdwn' }, type: 'section' }
    ]);
  });

  it('can compose user mention', () => {
    const component = block`
      <p>
        <mention id="myid" type="user" /> please go to hell
      </p>
    `;

    expect(component).toEqual({
      text: { text: '<@myid> please go to hell', type: 'mrkdwn' },
      type: 'section'
    });
  });

  it('can compose channel mention', () => {
    const component = block`
      <p>
        <mention id="general" type="channel" /> please go to hell
      </p>
    `;

    expect(component).toEqual({
      text: { text: '<#general> please go to hell', type: 'mrkdwn' },
      type: 'section'
    });
  });
});
