import { ApplicationCommandType, ContextMenuCommandBuilder, GuildMember, Message, MessageContextMenuCommandInteraction, MessageManager, PermissionsBitField, TextBasedChannel } from 'discord.js';
import { BotClient } from 'src/BotClient';

export class DeleteContext {
	static readonly context: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()
		.setName('Delete Up To This')
		.setType(ApplicationCommandType.Message);

	static readonly result = async (interaction: MessageContextMenuCommandInteraction, client: BotClient): Promise<void> => {

		const m = <GuildMember>interaction.member;
		if (!m.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			interaction.reply({ content:'🔒 You do not have permission to manage messages', ephemeral: true })
				.then(() => { setTimeout(() => interaction.deleteReply().catch(error => console.log(error.message)), 3000); },);
			return;
		}

		const message: Message = interaction.targetMessage;
		const messagesManager: MessageManager | null = interaction.channel?.messages || null;
		if (!messagesManager) return;
		if (client.removerManager.isFull) {
			interaction.reply('❌💣 I\'m already deleting somewhere, please try later')
				.then(() => { setTimeout(() => interaction.deleteReply().catch(error => console.log(error.message)), 3000); },);
			return;
		}
		interaction.deferReply();

		const remover = client.removerManager.addRemover(interaction.channelId);
		const deleteMessage = await remover?.run(interaction, messagesManager, message);

		interaction.editReply(
			`💣 I Deleted **${deleteMessage}** Message${ deleteMessage === 1 ? '' : 's' } !\n\n` +
			'(*===This message will self-destruct in **3** seconds===*)'
		)
			.then(() => { setTimeout(() => { interaction.deleteReply().catch(error => console.log(error.message)); }, 3000); },)
			.catch(() => {
				const c = <TextBasedChannel>interaction.channel;
				c.send(`💣 I Deleted **${deleteMessage}** Message${ deleteMessage === 1 ? '' : 's' } !`);
			});
	};
}