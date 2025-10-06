import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
	js.configs.recommended,
	...tsEslint.configs.recommendedTypeChecked,
	{
		// configure the ts parser for ts files
		files: ['**/*.ts', '!tests/e2e/**/*.ts'],
		languageOptions: {
			parser: tsEslint.parser,
			parserOptions: {
				project: true,
        projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		}
	},
	{
		files: ['*.js', '*.config.ts'],
		...tsEslint.configs.disableTypeChecked
	},
	...eslintPluginSvelte.configs['flat/recommended'],
	...eslintPluginSvelte.configs['flat/prettier'],
	{
		// dev tools and server logic run in node environments
		files: ['*.config.ts', '*.config.js'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			// mounted svelte components run in the browser
			globals: {
				...globals.browser
			},
			ecmaVersion: 2022,
			sourceType: 'module',
			// setup the svelte parser and give it the ts parser config
			parser: svelteParser,
			parserOptions: {
				parser: tsEslint.parser,
				// needed so ts parser won't skip svelte files
				extraFileExtensions: ['.svelte'],
				project: ['tsconfig.json'],
				tsconfigRootDir: import.meta.dirname
			}
		},
	},
	{
		files: ['tests/e2e/**/*.js'],
		...tsEslint.configs.disableTypeChecked
	},
	{
		ignores: [
			'.github',
			'.vscode',
			'dist',
			'node_modules'
		]
	},
	// this only disables rules; it goes last to win the cascade
	eslintConfigPrettier
);
