module.exports = {
	root: true,
	extends: ['norton'],
	rules: {
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
			},
		],
	},
	overrides: [
		{
			files: ['*.ts'],
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
				'plugin:import/typescript',
			],
			rules: {
				indent: 'off',
				'no-tabs': 'off',
				'@typescript-eslint/indent': ['error', 'tab'],
				'import/no-cycle': [2, { maxDepth: 1 }],
				'no-void': 'off',
			},
			parserOptions: {
				project: './tsconfig.json',
			},
			settings: {
				'import/resolver': {
					node: {
						extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
					},
				},
			},
		},
	],
};
