/* eslint-disable @typescript-eslint/no-explicit-any */
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import { BotPlayer } from './BotPlayer';

export class VocalConnection {

	connection: VoiceConnection | null = null;
	botPlayer: BotPlayer | null = null;

	join(channel: any): void {
		this.connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});
		this.initEvents();
	}

	private initEvents(): void {
		this.connection?.on('stateChange', (oldState, newState) => {
			console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
		});

		this.connection?.on('error', error => {
			console.error('[Connection] Error:', error.message);
		});
	}

	newBotPlayer(): BotPlayer | null {
		if (!this.connection) return null;
		this.botPlayer = new BotPlayer(this.connection);
		return this.botPlayer;
	}

	killConnection(): void {
		this.botPlayer?.player.stop();
		this.connection?.destroy();
	}
}