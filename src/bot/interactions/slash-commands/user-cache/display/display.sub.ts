import { BotSubSlashCommand } from "@/core/bot-command";
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, codeBlock } from "discord.js";
import { ERROR_CMD_GUILD, ERROR_COMMAND } from "@/core/constants";
import { UtsukushiBotClient } from "@/bot/client";
import { DiscordService } from "@/services/discord-service";

/**
 * @SubSlashCommand `display`
 *  - `display` : show user data
 */
export class DisplaySubCommand extends BotSubSlashCommand<UtsukushiBotClient> {

	override set(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
		subcommand
			.setName('display')
			.setDescription('Show your data from database 👁️!');
		return super.set(subcommand);
	}

	async result(
		interaction: ChatInputCommandInteraction,
		client: UtsukushiBotClient
	): Promise<void> {
		const user = interaction.user;

		await interaction.deferReply();

		const userData = await client.store.users.get(user.id);
		if (!userData) await interaction.editReply('❌ No User data in database !');
		else {
			const json = JSON.stringify(userData, null, '\t')
			const safetext = DiscordService.limitText(json, 1950);
			await interaction.editReply(codeBlock('json', safetext));
		}
	};
}
