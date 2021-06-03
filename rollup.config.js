// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

export default {
  input: './index.ts',
  output: {
    dir: 'dist',
    paths:{
        "lit-html": "/js/lit-html/lit-html.js",
        "lit-html/directives/unsafe-html":"/js/lit-html/directives/unsafe-html.js",
        "lit-html/directives/unsafe-svg":"/js/lit-html/directives/unsafe-svg.js",
        "lit-html/directives/repeat": "/js/lit-html/directives/repeat.js",
        "lit-html/directives/if-defined": "/js/lit-html/directives/if-defined.js",
        "bloc-them":"/js/bloc-them/index.js"
    },
  },
  plugins: [typescript(),terser()],
  external:["lit-html","bloc-them"]
};