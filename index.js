'use strict';

const spawn = require('cross-spawn');
const {parse} = require('dotenv');
const getStdin = require('get-stdin');

exports.spawn = ({
  log = console.log,
  cmd = process.argv.slice(2),
  env = process.env,
  shell = true,
  stdio = ['ignore', 1, 2],
  ...args
}) => {
  if (log) {
    log(`will execute "${cmd.join(' ')}"`);
  }

  return getStdin()
    .then((string) => parse(string))
    .then((pipedEnv) => {
      if (log) {
        const width = Object.keys(pipedEnv)
          .reduce((max, v) => Math.max(max, v.length), 0);

        Object.entries(pipedEnv)
          .map(([k, v]) => `${k.padEnd(width)} = ${v}`)
          .forEach(text => log(text));
      }

      return new Promise(resolve => {
        const child = spawn(cmd[0], cmd.slice(1), {
          ...args,
          env: {...env, ...pipedEnv},
          shell,
          stdio
        });
        child.once('close', resolve);
        child.once('exit', resolve);
      });
    })
    .catch((e) => {
      if (log) {
        log('FAILED', e);
      }
    })
};
