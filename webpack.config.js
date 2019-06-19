const path = require('path');

module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "production",
  
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: {
        main: './src/index.ts'
    },

    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'main.js'
    },

    module: {
      rules: [
        {
          // 拡張子 .ts の場合
          test: /\.ts$/,
          // TypeScript をコンパイルする
          use: "ts-loader"
        }
      ]
    },
    // import 文で .ts ファイルを解決するため
    resolve: {
      extensions: [".ts", ".js"]
    }
  };