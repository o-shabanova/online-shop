const importPlugin = require('eslint-plugin-import');

module.exports = [
	{
		ignores: [
			"node_modules/**",
			"dist/**",
			"src/assets/**",
			"src/scss/**",
		],
	},
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				window: "readonly",
				document: "readonly",
				console: "readonly",
			},
		},
		plugins: {
			import: importPlugin,
		},
		rules: {
			"no-var": "error",
			"prefer-const": ["error", { destructuring: "all" }],
			"eqeqeq": ["error", "always"],
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"no-console": "off",
			"import/no-unresolved": "off",
		},
	},
	{
		files: ["build-html.js"],
		languageOptions: {
			sourceType: "script",
			globals: { console: "readonly", require: "readonly", module: "readonly", __dirname: "readonly", process: "readonly" },
		},
	},
];
