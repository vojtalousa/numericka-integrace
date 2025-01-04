const path = require('path');
const dist = path.resolve(__dirname, 'public', 'dist');

module.exports = [
    {
        mode: 'production',
        entry: './function-plot/index.ts',
        output: {
            path: dist,
            filename: 'function-plot.js',
            library: {
                name: 'functionPlot',
                type: 'var',
                export: 'default'
            }
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensionAlias: {
                '.js': ['.ts', '.js'],
                '.mjs': ['.mts', '.mjs']
            }
        },
        optimization: { usedExports: true },
        devServer: { client: { overlay: false } }
    },
    {
        mode: 'production',
        entry: './math-js-integral/index.js',
        experiments: {
            outputModule: true,
        },
        output: {
            path: dist,
            filename: 'math-js-integral.js',
            library: {
                type: 'module'
            }
        },
        optimization: { usedExports: true }
    },
    {
        mode: 'production',
        entry: './methods/index.js',
        experiments: {
            outputModule: true,
        },
        output: {
            path: dist,
            filename: 'integration-methods.js',
            library: {
                type: 'module'
            }
        },
        optimization: { usedExports: true }
    }
]