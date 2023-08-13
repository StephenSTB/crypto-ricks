import * as webpack from "webpack";

module.exports = {
  webpack: {
    alias : {
        "stream": require.resolve("stream-browserify"),
        "process": require.resolve("process"), 
        "assert": require.resolve("assert"),
        "crypto": require.resolve("crypto-browserify"),
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "fs": false
      },
      plugins : {
        add: [
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/',
          }),  
        ]
      },
  },
  babel:{
    plugins:["@babel/plugin-syntax-import-assertions"]
  }
}