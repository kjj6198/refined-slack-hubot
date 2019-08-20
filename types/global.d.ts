declare module SlackHubot {

type SlackError = {
  code: string;
  data: {
    ok: boolean,
    error: string,
    response_metadata: any
  };
}

type Hubot = {
  id: string;
  name: string;
  domain?: string;
  enterprise_id?: string,
  enterprise_name?: string,
  self: {
    id: string;
    name: string;
  }
};

type SlackUser = {
  id: string;
  team_id?: string;
  name: string;
  tz: string;
  tz_label: string;
  profile: {
    title: string;
    phone: string;
    real_name: string;
    display_name: string;
  },
  imageURL: {
    small?: string;
    medium?: string;
    large?: string;
  }
};

type Text = {
  type: "mrkdwn" | "plaintext";
  text: string;
  emoji?: boolean;
};

type Block = {
  type: "section" | "context" | "divider",
  text?: Text,
  fields: Array<Text>
}

type RichMessage = {
  token?: string;
  channel: string;
  text: string;
  as_user: boolean;
  blocks?: Array<Block>;
};
}