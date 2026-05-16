import type ModuleInstance from './main.js'

export type VariablesSchema = {
	model: string
	serial: string
	device_name: string
	ch1_name: string
	ch2_name: string
	ch1_mute: string
	ch2_mute: string
	ch1_tx_active: string
	ch2_tx_active: string
	ch1_audio_db: string
	ch2_audio_db: string
	ch1_battery_pct: string
	ch2_battery_pct: string
	ch1_battery_min: string
	ch2_battery_min: string
	ch1_rf_a_dbm: string
	ch1_rf_b_dbm: string
	ch2_rf_a_dbm: string
	ch2_rf_b_dbm: string
	ch1_tx_name: string
	ch2_tx_name: string
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({
		model: { name: 'Device model' },
		serial: { name: 'Serial number' },
		device_name: { name: 'Device name' },
		ch1_name: { name: 'Ch 1 name' },
		ch2_name: { name: 'Ch 2 name' },
		ch1_mute: { name: 'Ch 1 mute state' },
		ch2_mute: { name: 'Ch 2 mute state' },
		ch1_tx_active: { name: 'Ch 1 TX active' },
		ch2_tx_active: { name: 'Ch 2 TX active' },
		ch1_audio_db: { name: 'Ch 1 audio level (dBFS)' },
		ch2_audio_db: { name: 'Ch 2 audio level (dBFS)' },
		ch1_battery_pct: { name: 'Ch 1 battery %' },
		ch2_battery_pct: { name: 'Ch 2 battery %' },
		ch1_battery_min: { name: 'Ch 1 battery remaining (min)' },
		ch2_battery_min: { name: 'Ch 2 battery remaining (min)' },
		ch1_rf_a_dbm: { name: 'Ch 1 RF antenna A (dBm)' },
		ch1_rf_b_dbm: { name: 'Ch 1 RF antenna B (dBm)' },
		ch2_rf_a_dbm: { name: 'Ch 2 RF antenna A (dBm)' },
		ch2_rf_b_dbm: { name: 'Ch 2 RF antenna B (dBm)' },
		ch1_tx_name: { name: 'Ch 1 TX name' },
		ch2_tx_name: { name: 'Ch 2 TX name' },
	})
}

function fmtDb(raw: number | null): string {
	if (raw === null) return '---'
	return (raw / 10).toFixed(1)
}

function fmtBatteryPct(bat: [number, number, number, number, number] | null): string {
	if (bat === null) return '---'
	return `${bat[0]}%`
}

function fmtBatteryMin(bat: [number, number, number, number, number] | null): string {
	if (bat === null) return '---'
	if (bat[1] === 65535) return '?'
	return `${bat[1]}`
}

export function updateVariableValues(self: ModuleInstance): void {
	const s = self.state
	self.setVariableValues({
		model: s.model,
		serial: s.serial,
		device_name: s.deviceName,
		ch1_name: s.ch[1].name,
		ch2_name: s.ch[2].name,
		ch1_mute: s.ch[1].rxMute ? '1' : '0',
		ch2_mute: s.ch[2].rxMute ? '1' : '0',
		ch1_tx_active: s.ch[1].txActive ? '1' : '0',
		ch2_tx_active: s.ch[2].txActive ? '1' : '0',
		ch1_audio_db: fmtDb(s.ch[1].audioLevel),
		ch2_audio_db: fmtDb(s.ch[2].audioLevel),
		ch1_battery_pct: fmtBatteryPct(s.ch[1].txBattery),
		ch2_battery_pct: fmtBatteryPct(s.ch[2].txBattery),
		ch1_battery_min: fmtBatteryMin(s.ch[1].txBattery),
		ch2_battery_min: fmtBatteryMin(s.ch[2].txBattery),
		ch1_rf_a_dbm: fmtDb(s.antenna[1].rfA),
		ch1_rf_b_dbm: fmtDb(s.antenna[1].rfB),
		ch2_rf_a_dbm: fmtDb(s.antenna[2].rfA),
		ch2_rf_b_dbm: fmtDb(s.antenna[2].rfB),
		ch1_tx_name: s.ch[1].txName,
		ch2_tx_name: s.ch[2].txName,
	})
}
