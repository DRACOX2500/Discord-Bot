
const { SlashCommandBuilder, bold } = require('discord.js');

const play = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play Music 🎵!')
    .addStringOption(option => 
        option.setName('song')
            .setDescription('The Song you want to play')
            .setRequired(true));

exports.PLAY_MUSIC_COMMAND = play;

exports.result = async (client, interaction) => {

    const channel = interaction.member.voice.channel;
    if(!channel) return await interaction.reply("❌ You are not in a voice channel");

    client.joinVocalChannel(channel);

    const { YtbStream } = require('../src/ytbStream');

    const url = interaction.options.get('song').value;
    const stream = new YtbStream(url);
    stream.setInfoEvent((info) => {
        let title = bold(info.player_response.videoDetails.title);
        return interaction.editReply(`🎵 Now playing ${title} !`);
    })

    await interaction.deferReply();
    await client.playMusic(stream.get());

    
};