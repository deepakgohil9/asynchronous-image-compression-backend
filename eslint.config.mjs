import globals from 'globals';
import tseslint from 'typescript-eslint';


export default [
	{ files: ['**/*.ts'] },
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/bin/**',
			'**/build/**',
			'eslint.config.mjs',
			'test.ts'
		]
	},
	{
		languageOptions: {
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: ['./tsconfig.json'],
			},
			globals: globals.node
		}
	},
	...tseslint.configs.stylisticTypeChecked,
	{
		rules: {
			'no-console': 'error',
			'indent': ['error', 'tab'],
			'quotes': ['error', 'single'],
			'no-tabs': [
				'error',
				{
					allowIndentationTabs: true
				}
			],
			'linebreak-style': ['error', 'unix'],
			'padding-line-between-statements': [
				'error',
				{
					'blankLine': 'always',
					'prev': 'block-like',
					'next': '*'
				},
			],
			'@typescript-eslint/strict-boolean-expressions': 'warn',
		}
	},
];
