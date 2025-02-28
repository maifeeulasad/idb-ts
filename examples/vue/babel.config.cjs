module.exports = {
    presets: ["@babel/preset-env"],
    plugins: [
        ["@babel/plugin-proposal-decorators", { version: "legacy" }],
        ["@babel/plugin-proposal-class-properties", { loose: true }]
    ]
};