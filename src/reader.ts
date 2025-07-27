import { JSDOM } from 'jsdom';

const urlRegex = /https?:\/\/[^\s]+/g;

/**
 * URLかどうかを判定
 * @param {string} input - 判定する文字列
 * @returns {boolean} - URLかどうか
 */
export function isUrl(input: string): boolean {
  return urlRegex.test(input);
}

/**
 * URLからテキストを読み込む
 * @param {string} input - URL
 * @returns {Promise<string>} - テキスト
 */
export async function loadTextByUrl(input: string): Promise<string> {
  const res = await fetch(input);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  // 不要な要素を削除
  ['header', 'nav', 'footer', 'aside', 'script', 'style', '.ads', '.social', 'pre', 'code', '.copyright'].forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });

  const content = doc.body.textContent;

  return content as string;
}
