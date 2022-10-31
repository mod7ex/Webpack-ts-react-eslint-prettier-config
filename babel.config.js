module.exports = function (api) {
    // no need to re-evaluate this function every time webpack re-compiles a file, so cache out the result
    const IS_DEV = api.env('development');

    api.cache.using(() => IS_DEV);

    /**
     * for the plugin react-refresh/babel
     * check https://github.com/pmmmwh/react-refresh-webpack-plugin#usage
     */
    const plugins = [
        ['@babel/plugin-transform-runtime', { regenerator: true }],
        IS_DEV && 'react-refresh/babel',
    ].filter(Boolean);

    const presets = [
        ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
    ];

    return {
        presets,
        plugins,
    };
};
