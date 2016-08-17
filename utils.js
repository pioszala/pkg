"use strict";

var mkdirp = require("mkdirp");
var rimraf = require("rimraf");
var execSync = require("child_process").execSync;
var spawnSync = require("child_process").spawnSync;
var stableStringify = require("json-stable-stringify");

module.exports.mkdirp = mkdirp;

module.exports.pause = function(seconds) {
  spawnSync(
    "ping", [ "127.0.0.1",
      process.platform === "win32" ? "-n" : "-c",
    (seconds + 1).toString()
  ]);
};

module.exports.vacuum = function() {
  throw new Error("Async vacuum not implemented");
};

module.exports.vacuum.sync = function(p) {
  var limit = 5;
  var hasError;
  for (var i = 0; i < limit; i += 1) {
    hasError = null;
    try {
      rimraf.sync(p);
    } catch (error) {
      hasError = error;
    }
    if (!hasError) break;
    if (i < limit - 1) {
      module.exports.pause(5);
    }
  }
  if (hasError) {
    throw hasError;
  }
};

module.exports.exec = function() {
  throw new Error("Async exec not implemented");
};

module.exports.exec.sync = function(command, opts) {

  var child = execSync(command, opts);
  return child.toString();

};

module.exports.spawn = function() {
  throw new Error("Async spawn not implemented");
};

module.exports.spawn.sync = function(command, args, opts) {

  if (!opts) opts = {};
  opts = JSON.parse(JSON.stringify(opts)); // change own copy
  var p = "pipe", i = "inherit";

  var d = opts.stdio;
  if (d === "super-pipe") {
    opts.stdio = [ p, p, p ];
  } else {
    if (!d) {
      opts.stdio = [ p, p, p ];
    } else
    if (typeof d === "string") {
      opts.stdio = [ d, d, d ];
    }
    opts.stdio[2] = i;
  }

  var expect = opts.expect || 0;
  delete opts.expect; // to avoid passing to spawnSync
  var opts2 = JSON.parse(JSON.stringify(opts)); // 0.12.x spoils
  var child = spawnSync(command, args, opts2);
  if (child.error) throw child.error;
  var s = child.status;
  if (s !== expect) {
    throw new Error("Status " + s.toString() +
      ", expected " + expect.toString());
  }

  if ((opts.stdio[1] === "pipe") &&
      (opts.stdio[2] === "pipe")) {
    return {
      stdout: child.stdout.toString(),
      stderr: child.stderr.toString()
    };
  } else
  if (opts.stdio[1] === "pipe") {
    return child.stdout.toString();
  } else
  if (opts.stdio[2] === "pipe") {
    return child.stderr.toString();
  } else {
    return "";
  }

};

module.exports.stringify = function(obj, replacer, space) {
  return stableStringify(obj, { replacer: replacer, space: space });
};