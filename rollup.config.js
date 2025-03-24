import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts',
  output: [
    {
      file: 'lib/index.esm.js',
      format: 'esm',
    }
  ],
  plugins: [typescript()],
};