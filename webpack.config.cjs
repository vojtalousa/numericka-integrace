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
        optimization: {
            usedExports: true,
        },
    },
    {
        mode: 'production',
        entry: './math-js-integral/index.js',
        output: {
            path: dist,
            filename: 'math-js-integral.js',
            library: {
                name: 'mathjs',
                type: 'var',
                export: 'default'
            }
        },
        optimization: {
            usedExports: true,
        },
    }
]