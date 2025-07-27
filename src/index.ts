#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parseArgs } from './cli.js';
import { isUrl, loadTextByUrl } from './reader.js';
import { stdin as input } from 'node:process';
import { hideBin } from 'yargs/helpers';

/**
 * 単一のソース（URLまたはファイルパス）を処理し，読了時間を計算して結果をログに出力
 * @param source - 処理するURLまたはファイルパス
 * @param lang - 計算に使用する言語（'ja'または'en'）
 */
async function processSource(source: string, lang: 'ja' | 'en') {
  try {
    let content: string;
    let sourceName = source;

    if (isUrl(source)) {
      // URLの場合はコンテンツを取得
      content = await loadTextByUrl(source);
    } else {
      // ファイルパスの場合はパスを解決してファイルを読み込む
      const filePath = path.resolve(process.cwd(), source);
      if (!fs.existsSync(filePath)) {
        console.error(`ファイルが存在しません: ${filePath}`);
        return;
      }
      content = fs.readFileSync(filePath, 'utf-8');
      sourceName = path.basename(filePath);
    }
    // 推定読了時間を計算してログに出力
    const minutes = estimateReadTime(content, lang);
    console.log(`✅ ${sourceName}: 約${minutes}分で読めます（${lang === 'ja' ? '日本語' : '英語'}）`);

  } catch (error: any) {
    // 処理中に発生したエラーをログに出力
    console.error(`❌ ${source} の処理中にエラーが発生しました: ${error.message}`);
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);
  // 1. 標準入力
  // 入力がTTYでない場合（パイプされている場合），標準入力から読み込む
  if (!process.stdin.isTTY) {
    const content = await readFromStdin();
    const argv = parseArgs([content, ...rawArgs]);
    const minutes = estimateReadTime(content, argv.lan as 'ja' | 'en');
    console.log(`✅ 標準入力: 約${minutes}分で読めます（${argv.lan === 'ja' ? '日本語' : '英語'}）`);
    return;
  }

  // 2. 引数がない場合
  // ファイルまたはURLの引数が指定されていない場合は，ヘルプメッセージを表示
  if (rawArgs.length === 0) {
    console.log("ファイルまたはURLを引数として指定してください。");
    parseArgs([]);
    return;
  }

  // 3. ファイル/URLの引数
  // すべてのファイル/URL引数を並行して処理
  const argv = parseArgs(rawArgs);
  const promises = argv._.map(arg => processSource(arg as string, argv.lang as 'ja' | 'en'));
  await Promise.all(promises);
}

/**
 * 標準入力からコンテンツを読み込む
 * @returns stdinからのコンテンツで解決されるPromise
 */
async function readFromStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    input.setEncoding('utf8');
    input.on('data', chunk => data += chunk);
    input.on('end', () => resolve(data));
    input.on('error', err => reject(err));
  });
}

/**
 * 指定されたテキストの読了時間を見積もる
 * （日本語：400文字/分、英語：200単語/分）
 * @param text - 評価するテキスト
 * @param lang - テキストの言語（'ja'または'en'）
 * @returns 分単位の推定読了時間
 */
function estimateReadTime(text: string, lang: 'ja' | 'en' = 'ja'): number {
  if (lang === 'ja') {
    const chars = text.replace(/\s/g, '').length;
    return Math.max(1, Math.round(chars / 400));
  } else {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }
}

main();