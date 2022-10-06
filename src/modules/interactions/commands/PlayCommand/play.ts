/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder, InteractionResponse, ButtonInteraction } from 'discord.js';
import { EmbedPlayer } from '@modules/system/embeds/embedPlayer';
import { BotClient } from 'src/BotClient';
import { YtbStream } from '@modules/system/audio/ytbStream';
import { BotCacheGuild } from '@models/BotCache';
import { UtsukushiSlashCommand } from '@models/UtsukushiSlashCommand';

export class PlayCommand implements UtsukushiSlashCommand {

	readonly slash = new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play Music 🎵!')
		.addStringOption(option =>
			option.setName('song')
				.setDescription('The Song you want to play')
				.setAutocomplete(true))
		.addBooleanOption(option =>
			option.setName('optimization')
				.setDescription('Optimize the player\'s performance but disabled volume settings'));

	readonly result = async (interaction: any, client: BotClient): Promise<void> => {
		if (!interaction || !interaction.member) return;

		const VoiceChannel = interaction.member.voice.channel;
		if (!VoiceChannel) return interaction.reply('❌ You are not in a voice channel');

		await interaction.deferReply();

		let url: string = interaction.options.get('song')?.value?.toString();
		const opti: boolean = interaction.options.get('optimization')?.value;

		if (!url) {
			url = await client.getDatabase().getCacheByGuild(interaction.guild).then((response: BotCacheGuild | null) => { return <string>response?.lastPlayURL; });
			if (!url) return interaction.editReply('❌ URL or Keywords are not available');
		}

		const stream = new YtbStream();
		await stream.init(url, interaction);

		if (!stream.source.found)
			return interaction.editReply('❌ Music not found !');

		stream.setInfoEvent(async (info: any) => {
			const embedPlayer = new EmbedPlayer(info, opti);

			const embed = embedPlayer.getEmbed();
			const comp = embedPlayer.getButtonMenu();
			interaction.editReply({ embeds: [embed], components: [comp] });

			client.getDatabase().setCacheByGuild(interaction.guild, { lastPlayURL: stream.source.url });
			const keywordsCache = client.getDatabase().userDataCache.userdata.get(interaction.user.id)?.keywords;
			if (!url.match(/^https?:\/\//) && !keywordsCache?.includes(url))
				client.getDatabase().setUserData(interaction.user, { keyword: url });
		});

		client.connection.join(VoiceChannel);
		client.connection.newBotPlayer(interaction.message)?.playMusic(stream.get(), opti);
	};

	static readonly reload = async (interaction: ButtonInteraction, client: BotClient): Promise<InteractionResponse | void> => {
		if (!interaction) return;

		const url = <string>interaction.message.embeds[0].url;
		const stream = new YtbStream();
		await stream.init(url);

		const VoiceChannel = (<any>interaction).member.voice.channel;
		if (!VoiceChannel) return interaction.deferUpdate();

		client.connection.join(VoiceChannel);
		client.connection.newBotPlayer(interaction.message)?.playMusic(stream.get());
	};
}

export const command = new PlayCommand();