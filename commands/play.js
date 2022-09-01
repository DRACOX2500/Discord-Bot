const { SlashCommandBuilder, bold } = require('discord.js');

const play = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Play Music 🎵!')
	.addStringOption(option =>
		option.setName('song')
			.setDescription('The Song you want to play')
			.setRequired(true));

exports.PLAY_MUSIC_COMMAND = play;

exports.result = async (interaction, client) => {

	const channel = interaction.member.voice.channel;
	if (!channel) return interaction.reply('❌ You are not in a voice channel');

	await interaction.deferReply();

	const { YtbStream } = require('../src/ytbStream');

	const url = interaction.options.get('song').value;
	const stream = new YtbStream();
	await stream.init(url);

	if (!stream.source.found)
		return interaction.editReply('❌ Music not found !');

	stream.setInfoEvent((info) => {
		const title = bold(info.player_response.videoDetails.title);
		return interaction.editReply(`🎵 Now playing ${title} !`);
	});

	client.joinVocalChannel(channel);
	await client.playMusic(stream.get());

};