const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {ModuleFederationPlugin} = require('webpack').container;
const {CycloneDxWebpackPlugin} = require('@cyclonedx/webpack-plugin');
const packageJson = require('./package.json');

const moduleName = 'support-roles-usage';
// Module Federation container name — must be a valid JS identifier because it is
// assigned to `appShell.remotes.<federationName>` in the generated remoteEntry.js.
const federationName = 'supportRolesUsage';

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
                    loader: 'babel-loader'
                    // Babel presets/plugins live in babel.config.js so webpack and eslint share one config.
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: '[local]'
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
                name: federationName,
                filename: 'remoteEntry.js',
                library: {type: 'assign', name: `appShell.remotes.${federationName}`},
                exposes: {
                    './init': path.resolve(__dirname, 'src/javascript/init.js')
                },
                remotes: {
                    '@jahia/app-shell': 'appShell'
                },
                // All of these are provided by the Jahia app-shell (host) at runtime, so we
                // share them as singletons WITHOUT bundling a fallback (import: false). This keeps
                // the module lean and guarantees a single shared instance of React, Apollo, etc.
                shared: {
                    react: {singleton: true, import: false, requiredVersion: packageJson.dependencies.react},
                    'react-dom': {singleton: true, import: false, requiredVersion: packageJson.dependencies['react-dom']},
                    'react-i18next': {singleton: true, import: false, requiredVersion: packageJson.dependencies['react-i18next']},
                    i18next: {singleton: true, import: false, requiredVersion: packageJson.dependencies.i18next},
                    '@apollo/client': {singleton: true, import: false, requiredVersion: packageJson.dependencies['@apollo/client']},
                    '@jahia/moonstone': {singleton: true, import: false, requiredVersion: packageJson.dependencies['@jahia/moonstone']},
                    '@jahia/ui-extender': {singleton: true, import: false, requiredVersion: packageJson.dependencies['@jahia/ui-extender']}
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
