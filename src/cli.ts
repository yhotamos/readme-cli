import yargs from 'yargs';

/**
 *  コマンドライン引数を解析する
 * @param {string[]} args - コマンドライン引数
 * @returns - 解析結果
 */
export function parseArgs(args: string[]) {
  return yargs(args)
    .usage('Usage: readtime <file...> [--lang ja|en]')
    .option('lang', {
      alias: 'l',
      describe: '言語（ja=日本語，en=英語）',
      choices: ['ja', 'en'],
      default: 'ja'
    })
    .demandCommand(1)
    .help()
    .parseSync();
}