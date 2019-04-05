const arch = process.env.ARCH || process.arch;
const platform = process.env.PLATFORM || process.platform;

module.exports = {
  externals: {
    electron: "require('electron')",
    got: "require('got')",
    buffer: "require('buffer')",
    child_process: "require('child_process')",
    constants: "require('constants')",
    crypto: "require('crypto')",
    events: "require('events')",
    fs: "require('fs')",
    http: "require('http')",
    https: "require('https')",
    assert: "require('assert')",
    dns: "require('dns')",
    net: "require('net')",
    nodegit: "require('nodegit')",
    os: "require('os')",
    path: "require('path')",
    querystring: "require('querystring')",
    readline: "require('readline')",
    repl: "require('repl')",
    stream: "require('stream')",
    string_decoder: "require('string_decoder')",
    tls: "require('tls')",
    url: "require('url')",
    util: "require('util')",
    winston: "require('winston')",
    zlib: "require('zlib')"
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  }
};
