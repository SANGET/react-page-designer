module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "react-app",
    "airbnb-base",
    "prettier",
  ],
  plugins: [
    "react",
    "@typescript-eslint"
  ],
  rules: {
    "@typescript-eslint/indent": 0,
    // "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-unused-vars": 1,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-use-before-define": ["error"],
    "no-use-before-define": "off",
    indent: 0,
    // indent: 0,
    "import/no-extraneous-dependencies": 0,
    semi: ["error", "always"],
    "no-unused-vars": 0,
    "linebreak-style": 0,
    "import/prefer-default-export": 0,
    "no-underscore-dangle": 0,
    "no-console": 0,
    "arrow-body-style": 0,
    "class-methods-use-this": 0,
    "max-len": 0,
    "no-return-assign": 0,
    "import/extensions": 0,
    "no-case-declarations": 0,
    "no-param-reassign": 0, // 禁止给参数重新赋值
    "no-plusplus": 0,
    "prefer-object-spread": 0,
    "guard-for-in": 0,
    "comma-dangle": 0,
    "global-require": 0,
    quotes: 0,
    "no-return-await": 0,
    "max-classes-per-file": 0,
    "object-curly-spacing": ["error", "always"],
    // "jsx-a11y/click-events-have-key-events": 0,
    // "jsx-a11y/no-static-element-interactions": 0,
    // "react-hooks/exhaustive-deps": 0,
    // "react/jsx-tag-spacing": 0,
    // "react/destructuring-assignment": 0,
    // "react/no-unused-state": 0,
    // "react/display-name": 0,
    // "react/jsx-max-props-per-line": 0,
    // "react/jsx-first-prop-new-line": 1,
    // "react/jsx-one-expression-per-line": 0,
    // "react/jsx-closing-bracket-location": [1, "line-aligned"],
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".jsx", "tsx", "ts"]
      }
    ]
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: [
          "node_modules",
        ]
      }
    },
  }
};
