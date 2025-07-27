#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import argv from './cli.js';
import { isUrl, loadTextByUrl } from './reader.js';


function main() {
  argv._.forEach((arg) => {
    if (isUrl(arg as string)) {
      console.log(`✅ ${arg}: URLから読み込みます`);
      const content = loadTextByUrl(arg as string);
      content.then((content) => {
        const minutes = estimateReadTime(content, argv.lang as 'ja' | 'en');
        console.log(`✅ ${arg}: 約${minutes}分で読めます（${argv.lang === 'ja' ? '日本語' : '英語'}）`);
      })

      return;
    }

    const filePath = path.resolve(process.cwd(), arg as string);
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      console.error(`❌ ファイルが存在しません: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const minutes = estimateReadTime(content, argv.lang as 'ja' | 'en');

    console.log(`✅ ${path.basename(filePath)}: 約${minutes}分で読めます（${argv.lang === 'ja' ? '日本語' : '英語'}）`);
  });
}

/**
 * 読了時間の計算（日本語：400字/分，英語：200語/分）
 * @param {string} text - 読み込むテキスト
 * @param {'ja' | 'en'} lang - 言語 (日本語: 'ja', 英語: 'en')
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