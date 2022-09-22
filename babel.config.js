module.exports = function (api) {
    // no need to re-evaluate this function every time webpack re-compiles a file, so cache out the result
    api.cache(true);

    // api.env("production")

    // const presets = ["@babel/preset-env", "@babel/preset-typescript"];
    const presets = ["@babel/preset-typescript", ["@babel/preset-env", { useBuiltIns: "usage", corejs: 3 }]];

    return {
        presets,
    };
};
