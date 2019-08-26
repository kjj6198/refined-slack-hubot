import request from 'request';

const DICT_URL = 'https://jisho.org/api/v1/search/words';

export default function getVocabularies(keyword: string): Promise<any> {
  return new Promise((resolve, reject) => {
    request(
      DICT_URL,
      {
        qs: {
          keyword,
        },
        useQuerystring: true,
      },
      (err, res) => {
        if (err) {
          reject(err);
        }
        try {
          resolve(JSON.parse(res.body));
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
