import { ButtonBuilder, ButtonInteraction } from 'discord.js';
import { BotClient } from '../bot-client';

export interface UtsukushiButton {
	readonly button: (disabled?: boolean) => ButtonBuilder;

	readonly getEffect: (
		interaction: ButtonInteraction,
		client: BotClient
	) => Promise<void>;
}

export interface UtsukushiEvent {
	readonly event: (client: BotClient) => Promise<void>;
}