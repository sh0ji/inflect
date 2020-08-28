module.exports = {
	root: true,
	extends: ['norton'],
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
