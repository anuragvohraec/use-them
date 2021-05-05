// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { uglify } from "rollup-plugin-uglify";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './index.ts',
  output: {
    dir: 'dist',
    paths:{
        "lit-html": "./js/lit-html/lit-html.js",
        "lit-html/directives/unsafe-html":"./js/lit-html/directives/unsafe-html.js",
        "lit-html/directives/repeat": "./js/lit-html/directives/repeat.js",
        "lit-html/directives/if-defined": "./js/lit-html/directives/if-defined.js",
        "bloc-them":"./bloc-them.js"
    },
  },
  plugins: [typescript(),uglify()],
  external:["lit-html","bloc-them"]
};