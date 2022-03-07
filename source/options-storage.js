import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		coursera: true,
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	logging: true,
});
