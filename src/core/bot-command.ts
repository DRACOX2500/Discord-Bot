import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { BotClient } from "./bot-client";
import {
	BotSlashCommand as BotSlashCommandType,
	BotSubSlashCommand as BotSubSlashCommandType,
	BotSubGroupSlashCommand as BotSubGroupSlashCommandType
} from './types/bot-command';

class AbstractCommand<
	T extends BotClient = BotClient,
	B extends BotSubGroupSlashCommandType<T, any> | BotSubSlashCommandType<T, any> = BotSubSlashCommandType<T, any>
> {
	cmds: Record<string, B>;

	constructor(cmds: B[] = []) {
		this.cmds = this.toRecord(cmds);
	}

	private toRecord(cmds: B[]): Record<string, B> {
		const record: Record<string, B> = {};
		cmds.forEach((_cmd) => record[_cmd.name] = _cmd)
		return record;
	}

	protected execSubResult(
		cmdName: string,
		interaction: ChatInputCommandInteraction,
		client: T,
		options?: any
	) {
		this.cmdsList.find(_cmd => _cmd.command.name === cmdName)?.result(interaction, client, options);
	}

	get cmdsList(): B[] {
		const list: B[] = [];
		for (const key in this.cmds) {
			list.push(this.cmds[key]);
		}
		return list;
	}

	protected isGroup(sub: B): boolean {
		return sub instanceof BotSubGroupSlashCommand;
	}

	async result(
		interaction: ChatInputCommandInteraction,
		client: T,
		options?: any
	): Promise<void> {
		const subCommand = interaction.options.getSubcommand(true);
		if (subCommand && this.cmdsList.length) this.execSubResult(
			subCommand,
			interaction,
			client,
			options
		);
	};
}

export abstract class BotSlashCommand<
	T extends BotClient = BotClient,
	B extends BotSubGroupSlashCommandType<T, any> | BotSubSlashCommandType<T, any> = BotSubSlashCommandType<T, any>
	>
	extends AbstractCommand<T, B>
	implements BotSlashCommandType<T, B> {
	guildIds: string[];
    command: SlashCommandBuilder;

	constructor(cmds: B[] = [], guildIds: string[] = []) {
		super(cmds)
		this.guildIds = guildIds;
		this.command = new SlashCommandBuilder();
		this.cmdsList.forEach(
			(sub) => this.isGroup(sub) ?
				this.command.addSubcommandGroup(_s => (sub as BotSubGroupSlashCommandType<T, any>).set(_s)) :
				this.command.addSubcommand(_s => (sub as BotSubSlashCommandType<T, any>).set(_s))
		);
	}
}

export abstract class BotSubGroupSlashCommand<T extends BotClient = BotClient, O = any>
	extends AbstractCommand<T>
	implements BotSubGroupSlashCommandType<T, O> {
	name!: string;
	command!: SlashCommandSubcommandGroupBuilder;

	constructor(cmds: BotSubSlashCommandType<T, any>[] = []) {
		super(cmds);
	}
	set(subCommandGroup: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder {
		this.command = subCommandGroup;
		return this.command;
	}
	async result(interaction: ChatInputCommandInteraction<CacheType>, client: T, options?: O | undefined): Promise<void> {
		super.result(interaction, client, options);
	}
}

export abstract class BotSubSlashCommand<T extends BotClient = BotClient, O = any>
	implements BotSubSlashCommandType<T, O> {
	command!: SlashCommandSubcommandBuilder;
	name!: string;

	set(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
		this.command = subcommand;
		return this.command;
	}
	async result(interaction: ChatInputCommandInteraction<CacheType>, client: T, options?: O | undefined): Promise<void> {
		// OVERRIDE
	}
}