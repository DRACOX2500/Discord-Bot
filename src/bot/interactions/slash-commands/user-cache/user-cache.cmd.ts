import { BotSlashCommand } from '../../../../core/bot-command';
import { type UtsukushiBotClient } from '../../../client';
import { DisplaySubCommand } from './display/display.sub';
import { HistoricSubCommand } from './historic/historic..sub';
import { RemoveSubCommand } from './remove/remove.sub';

/**
 * @SlashCommand `user-cache`
 * 	- `user-cache show` : Show User data !
 *  - `user-cache remove` : Remove User data !
 */
class UserCacheCommand extends BotSlashCommand<UtsukushiBotClient> {

	constructor() {
		super({
			'display': new DisplaySubCommand(),
			'remove': new RemoveSubCommand(),
			'historic': new HistoricSubCommand(),
		});

		this.command
			.setName('user-cache')
			.setDescription('Manage your data 📁!')
			.setDMPermission(true);
	}
}

export const command = new UserCacheCommand();