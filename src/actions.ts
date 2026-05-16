import type ModuleInstance from './main.js'

export type ActionsSchema = {
	mute: {
		options: {
			channel: number
			state: string
		}
	}
	channel_name: {
		options: {
			channel: number
			name: string
		}
	}
	irsync: {
		options: {
			channel: number
		}
	}
	set_radio_preset: {
		options: {
			channel: number
			group: number
			preset_ch: number
		}
	}
	set_rf_power: {
		options: {
			channel: number
			power: number
		}
	}
	identify: {
		options: Record<string, never>
	}
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		mute: {
			name: 'Set mute',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					default: 1,
					choices: [
						{ id: 1, label: 'Channel 1' },
						{ id: 2, label: 'Channel 2' },
					],
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'Mute on' },
						{ id: 'off', label: 'Mute off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const ch = event.options.channel as 1 | 2
				let value: number
				if (event.options.state === 'toggle') {
					value = self.state.ch[ch].rxMute ? 0 : 1
				} else {
					value = event.options.state === 'on' ? 1 : 0
				}
				self.connection.send(`/ch/${ch}/rx/mute`, [{ type: 'i', value }])
			},
		},

		channel_name: {
			name: 'Set channel name',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					default: 1,
					choices: [
						{ id: 1, label: 'Channel 1' },
						{ id: 2, label: 'Channel 2' },
					],
				},
				{
					id: 'name',
					type: 'textinput',
					label: 'Name (1–6 chars)',
					default: '',
				},
			],
			callback: async (event) => {
				const ch = event.options.channel
				const name = String(event.options.name).slice(0, 6)
				self.connection.send(`/ch/${ch}/name`, [{ type: 's', value: name }])
			},
		},

		irsync: {
			name: 'Trigger IR sync',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					default: 1,
					choices: [
						{ id: 1, label: 'Channel 1' },
						{ id: 2, label: 'Channel 2' },
					],
				},
			],
			callback: async (event) => {
				self.connection.send(`/ch/${event.options.channel}/tx/irsync`, [{ type: 'i', value: 1 }])
			},
		},

		set_radio_preset: {
			name: 'Set radio preset',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					default: 1,
					choices: [
						{ id: 1, label: 'Channel 1' },
						{ id: 2, label: 'Channel 2' },
					],
				},
				{
					id: 'group',
					type: 'number',
					label: 'Group (1–20)',
					default: 1,
					min: 1,
					max: 20,
				},
				{
					id: 'preset_ch',
					type: 'number',
					label: 'Channel (1–800)',
					default: 1,
					min: 1,
					max: 800,
				},
			],
			callback: async (event) => {
				self.connection.send(`/ch/${event.options.channel}/radio/preset`, [
					{ type: 'i', value: event.options.group as number },
					{ type: 'i', value: event.options.preset_ch as number },
				])
			},
		},

		set_rf_power: {
			name: 'Set RF output power',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Channel',
					default: 1,
					choices: [
						{ id: 1, label: 'Channel 1' },
						{ id: 2, label: 'Channel 2' },
					],
				},
				{
					id: 'power',
					type: 'number',
					label: 'Power (0–50 mW)',
					default: 10,
					min: 0,
					max: 50,
				},
			],
			callback: async (event) => {
				self.connection.send(`/ch/${event.options.channel}/tx/rfpower`, [
					{ type: 'i', value: event.options.power as number },
				])
			},
		},

		identify: {
			name: 'Identify device',
			options: [],
			callback: async () => {
				self.connection.send('/identify', [])
			},
		},
	})
}
