import {Readable, Writable} from 'stream';
import ReplContext from '../common/ReplContext';
import ReplConstants from '../constants/ReplConstants';
import ReplOutput from '../common/ReplOutput';
import {EOL} from 'os';
import fs from 'fs';

import jsREPL from 'repl';
import coffeeREPL from 'coffee-script/repl';
import tsREPL from './ReplTypeScript';
import lsREPL from './ReplLiveScript';
import cljsREPL from './ReplClojureScript';

const REPL = (repl) => {
  let readable = new Readable();
  let writable = new Writable();

  readable._read = writable.write = () => {};

  let nodeRepl = repl.start({
    prompt: '',
    input: readable,
    output: writable,
    terminal: false,
    useGlobal: true,
    ignoreUndefined: false,
    useColors: false,
    writer: (obj, opt) => {
      nodeRepl.$lastExpression = ReplOutput.some(obj);
      // link context
      nodeRepl.context = ReplContext.getContext();
      return '<<response>>';
    },
    historySize: ReplConstants.REPL_HISTORY_SIZE,
    replMode: repl['REPL_MODE_SLOPPY']
  });
  
  // work-a-round for electron issue [#18872](https://github.com/electron/electron/issues/18872)
  // we dont use the completer: ... function option because we dont want to reimplement the whole thing
  let myGlobals = [
    'global', 'window', 'console', 'electron', 'mainProcess', 'mainWindow',
    'consoleWin', 'consoleMain'];
  let builtinCompleter = nodeRepl.completer;
  
  nodeRepl.completer = (line, callback) => {
    callback(null, [[],line])
//    if (/^[^ .]*$/.test(line))
//      callback(null, [
//        myGlobals.filter((word) => {
//          return word.indexOf(line) === 0
//        }), line]);
//    else {
////      callback(null,[])
//      builtinCompleter(line, callback)
//    }
  };
  
  // remove default repl commands
  ['clear', 'help', 'save', 'exit'].forEach(cmd => delete nodeRepl.commands[cmd]);

  // here is our sandbox environment
  nodeRepl.context = ReplContext.getContext();

  return {
    getREPL: () => nodeRepl,
    setREPL: () => ReplContext.hookContext((context) => { nodeRepl.context = context; }),
    repl
  };
};

// remove loadAction function after below PR pushed and is available in electron based node.
// lib/repl.js with below PR
// https://github.com/nodejs/node/pull/4170
let replJS = REPL(jsREPL);
let loadAction = function(file) {
  try {
    let stats = fs.statSync(file);
    if (stats && stats.isFile()) {
      let self = this;
      let data = fs.readFileSync(file, 'utf8');
      let lines = data.split('\n');
      this.displayPrompt();
      lines.forEach(function(line) {
        if (line) {
          self.write(line + '\n');
        }
      });
    } else {
      this.outputStream.write('Failed to load:' + file + ' is not a valid file\n');
    }
  } catch (e) {
    this.outputStream.write('Failed to load:' + file + '\n');
  }
  this.displayPrompt();
};
replJS.getREPL().commands.load.action = loadAction;

export default {
  js: replJS,
  coffee: REPL(coffeeREPL),
  ts: REPL(tsREPL),
  ls: REPL(lsREPL),
  cljs: REPL(cljsREPL),
};
