export interface ChannelState {
	name: string
	rxMute: boolean
	txActive: boolean
	audioLevel: number | null
	txBattery: [number, number, number, number, number] | null
	txName: string
}

export interface AntennaState {
	rfA: number | null
	rfB: number | null
}

export interface DeviceState {
	model: string
	serial: string
	deviceName: string
	ch: Record<1 | 2, ChannelState>
	antenna: Record<1 | 2, AntennaState>
	warnings: Partial<Record<string, boolean>>
}

function defaultChannel(): ChannelState {
	return {
		name: '',
		rxMute: false,
		txActive: false,
		audioLevel: null,
		txBattery: null,
		txName: '',
	}
}

function defaultAntenna(): AntennaState {
	return { rfA: null, rfB: null }
}

export function defaultState(): DeviceState {
	return {
		model: '',
		serial: '',
		deviceName: '',
		ch: {
			1: defaultChannel(),
			2: defaultChannel(),
		},
		antenna: {
			1: defaultAntenna(),
			2: defaultAntenna(),
		},
		warnings: {},
	}
}
