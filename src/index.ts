#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// 読了時間の計算（日本語：400字/分，英語：200語/分）
function estimateReadTime(text: string, lang: 'ja' | 'en' = 'ja'): number {
  if (lang === 'ja') {
    const chars = text.replace(/\s/g, '').length;
    return Math.max(1, Math.round(chars / 400));
  } else {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }
}

// CLIの定義
const argv = yargs(hideBin(process.argv))
  .usage('Usage: readtime <file> [--lang ja|en]')
  .option('lang', {
    alias: 'l',
    describe: '言語（ja=日本語，en=英語）',
    choices: ['ja', 'en'],
    default: 'ja'
  })
  .demandCommand(1)
  .help()
  .parseSync();

// ファイル読み込み＆読了時間の表示
const filePath = path.resolve(process.cwd(), argv._[0] as string);

try {
  const content = fs.readFileSync(filePath, 'utf-8');
  const minutes = estimateReadTime(content, argv.lang as 'ja' | 'en');

  console.log(
    `📄 ${path.basename(filePath)}: 約${minutes}分で読めます（${argv.lang === 'ja' ? '日本語' : '英語'}）`
  );
} catch (err) {
  console.error(`❌ ファイル読み込み失敗: ${filePath}`);
  if (err instanceof Error) {
    console.error(err.message);
  }
  process.exit(1);
}