import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	meterInterval: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'TCP Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 1993,
		},
		{
			type: 'number',
			id: 'meterInterval',
			label: 'Meter update interval (ms)',
			width: 4,
			min: 50,
			max: 2000,
			default: 100,
		},
	]
}
