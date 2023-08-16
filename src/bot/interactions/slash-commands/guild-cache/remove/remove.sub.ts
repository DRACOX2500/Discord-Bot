import { BotSubSlashCommand } from "@/core/bot-command";
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, codeBlock } from "discord.js";
import { ERROR_CMD_GUILD, ERROR_COMMAND } from "@/core/constants";
import { UtsukushiBotClient } from "@/bot/client";
import { DiscordService } from "@/services/discord-service";

/**
 * @SubSlashCommand `remove`
 *  - `remove` : remove guild data
 */
export class RemoveSubCommand extends BotSubSlashCommand<UtsukushiBotClient> {

	override set(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
		subcommand
			.setName('remove')
			.setDescription('Remove guild data from database 💥!');
		return super.set(subcommand);
	}

	async result(
		interaction: ChatInputCommandInteraction,
		client: UtsukushiBotClient
	): Promise<void> {
		const guild = interaction.guild;
		if (!guild) {
			await interaction.reply({ content: ERROR_CMD_GUILD, ephemeral: true });
            throw new Error(ERROR_COMMAND);
		}

		await interaction.deferReply({ ephemeral: true });

		client.store.guilds.removeDoc(guild)
			.then(() => {
				client.store.guilds.remove(guild.id);
				interaction.editReply('✅ Guild data removed successfully !');
			})
			.catch(() => interaction.editReply('❌ Failed to remove Guild data !'));
	};
}
