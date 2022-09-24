const postcssPresetEnv = require("postcss-preset-env");
// const autoprefixer = require("autoprefixer");

module.exports = {
    plugins: [
        postcssPresetEnv({
            autoprefixer: {
                flexbox: "no-2009",
            },
            stage: 3,
        }),

        // autoprefixer({
        //     grid: "autoplace",
        //     flexbox: true,
        // }),

        require("cssnano"),
    ],
};
