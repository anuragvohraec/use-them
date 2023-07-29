// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import minifyHTML from 'rollup-plugin-minify-html-literals';
import resolve from '@rollup/plugin-node-resolve';

export default [{
  input: './index.ts',
  output: {
    dir: 'dist',
    paths:{
        "bloc-them":"/js/bloc-them/index.js"
    },
  },
  plugins: [typescript(),terser({ format: { comments: false } })],
  external:["bloc-them"]
},
{
  input: './image-utils.ts',
  output: {
    dir: 'dist'
  },
  plugins: [typescript(),resolve({
    browser:true
  }),terser({ format: { comments: false } })]
},
{
  input: './image-editor.ts',
  output: {
    dir: 'dist'
  },
  plugins: [typescript(),resolve({
    browser:true
  }),terser({ format: { comments: false } })]
}];