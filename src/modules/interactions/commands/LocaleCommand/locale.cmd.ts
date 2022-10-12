import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField, Locale, AutocompleteInteraction, CacheType } from 'discord.js';
import { UtsukushiAutocompleteSlashCommand } from '@models/UtsukushiCommand';
import { sortByName } from '@utils/sortByName';

type Choice = {
    name: string;
    value: string;
}

export class LocaleCommand implements UtsukushiAutocompleteSlashCommand {

	private getAllLocale(): Choice[] {
		const choices: Choice[] = [];
		for (const key in Locale) {
			if (choices.length >= 25) continue;
			choices.push({
				name: key,
				value: key,
			});
		}
		choices.sort((a, b) => a.name.localeCompare(b.name));
		return choices;
	}

	readonly command = new SlashCommandBuilder()
		.setName('locale')
		.setDescription('Update guild locale language (default: English-US)')
		.setDMPermission(false)
		.setDefaultMemberPermissions(
			PermissionsBitField.Flags.ManageGuild
		)
		.addStringOption((option) =>
			option
				.setName('locale')
				.setDescription('Change the locale of the guild (only 25 first locale in alphabetical order)')
				.setAutocomplete(true)
				.setRequired(true)
		);

	readonly result = async (interaction: ChatInputCommandInteraction): Promise<void> => {
		const guild = await interaction.guild?.fetch();
		const langage = interaction.options.getString('locale') ?? 'EnglishUS';
		const locale = Locale[langage as keyof typeof Locale];

		if (!guild || !locale) {
			interaction.reply({ content: '❌ Guild set locale Failed !', ephemeral: true });
			return;
		}

		guild.setPreferredLocale(locale);
		await interaction.reply({ content: '🌐 Guild set locale Succefully !', ephemeral: true });
	};

	readonly autocomplete = async (interaction: AutocompleteInteraction<CacheType>): Promise<void> => {
		let res = this.getAllLocale();
		res = res.sort((a, b) => sortByName(a.name, b.name));
		if (res.length >= 25) res = res.slice(0, 25);
		await interaction.respond(res);
	};

}
export const command = new LocaleCommand();