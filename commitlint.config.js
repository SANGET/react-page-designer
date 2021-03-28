module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "format",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "update",
        "husky"
      ],
    ],
    "subject-full-stop": [0, "never"],
    "subject-case": [0, "never"],
  },
};
