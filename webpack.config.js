const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {ModuleFederationPlugin} = require('webpack').container;
const {CycloneDxWebpackPlugin} = require('@cyclonedx/webpack-plugin');
const packageJson = require('./package.json');

const moduleName = 'support-roles-usage';

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

    return {
        entry: {
            [moduleName]: path.resolve(__dirname, 'src/javascript/index.js')
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps'),
            filename: '[name].bundle.js',
            chunkFilename: '[name].jahia.[contenthash:6].js',
            publicPath: 'auto'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', '.json']
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {modules: false}],
                            '@babel/preset-react'
                        ],
                        plugins: ['@babel/plugin-syntax-dynamic-import']
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: '[name]__[local]___[hash:base64:5]'
                                },
                                sourceMap: isDev
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {sourceMap: isDev}
                        }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource'
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new ModuleFederationPlugin({
                name: moduleName,
                filename: 'remoteEntry.js',
                library: {type: 'assign', name: `appShell.remotes.${moduleName}`},
                exposes: {
                    './init': path.resolve(__dirname, 'src/javascript/init.js')
                },
                remotes: {
                    '@jahia/app-shell': 'appShell'
                },
                shared: {
                    react: {singleton: true, requiredVersion: packageJson.dependencies.react},
                    'react-dom': {singleton: true, requiredVersion: packageJson.dependencies['react-dom']},
                    'react-i18next': {singleton: true, requiredVersion: packageJson.dependencies['react-i18next']},
                    i18next: {singleton: true, requiredVersion: packageJson.dependencies.i18next},
                    '@apollo/client': {singleton: true, requiredVersion: packageJson.dependencies['@apollo/client']},
                    '@jahia/moonstone': {singleton: true, requiredVersion: packageJson.dependencies['@jahia/moonstone']},
                    '@jahia/ui-extender': {singleton: true, requiredVersion: packageJson.dependencies['@jahia/ui-extender']}
                }
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {from: './package.json', to: '.'}
                ]
            }),
            new CycloneDxWebpackPlugin({
                outputLocation: './bom'
            })
        ],
        devtool: 'source-map',
        mode: isDev ? 'development' : 'production'
    };
};
