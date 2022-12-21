module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/essential", "@vue/standard"],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "indent": [
            "error",
            4,
            {
                SwitchCase: 1
            }
        ],
        "quotes": 2,
        "semi": 2,
        "space-before-function-paren": 0
    },
    parserOptions: {
        parser: "babel-eslint"
    }
};
