import buble from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

import pckg from './package.json'

export default [
  {
    entry: 'app/index.js',
    output: {
        name: 'hurricane_animation',
        file: 'bundle/bundle.js',
        format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(),
      buble()
    ]
  }
];