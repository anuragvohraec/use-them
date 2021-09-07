// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';

export default [{
  input: './index.ts',
  output: {
    sourcemap: true,
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
},
{
  input: './image-utils.ts',
  output: {
    dir: 'dist'
  },
  plugins: [typescript({ sourceMap: false , inlineSources: false}),resolve({
    browser:true
  }),terser({ format: { comments: false } })]
}];