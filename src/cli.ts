import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

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

export default argv;
