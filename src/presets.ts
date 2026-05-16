import { combineRgb } from '@companion-module/base'
import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const RED = combineRgb(200, 0, 0)
const DARK = combineRgb(30, 30, 30)

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{ id: 'mute', name: 'Mute', definitions: [{ id: 'mute', name: 'Mute buttons', type: 'simple', presets: ['mute_ch1', 'mute_ch2'] }] },
		{
			id: 'combined',
			name: 'Combined meters',
			definitions: [{ id: 'combined', name: 'Combined presets', type: 'simple', presets: ['combined', 'battery_audio_combined'] }],
		},
		{ id: 'audio', name: 'Audio meters', definitions: [{ id: 'audio', name: 'Audio level meters', type: 'simple', presets: ['audio_left_ch1', 'audio_left_ch2', 'audio_right_ch1', 'audio_right_ch2'] }] },
		{ id: 'rf', name: 'RF meters', definitions: [{ id: 'rf', name: 'RF strength meters', type: 'simple', presets: ['rf_a_left_ch1', 'rf_a_left_ch2', 'rf_b_left_ch1', 'rf_b_left_ch2'] }] },
		{
			id: 'tx',
			name: 'TX status',
			definitions: [{ id: 'tx', name: 'Transmitter battery & name', type: 'simple', presets: ['tx_combined_pct', 'tx_combined_min', 'tx_ch1', 'tx_ch2'] }],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {}

	// Single combined button: Ant A | Ant B | AF ch1 | AF ch2
	presets['combined'] = {
		type: 'simple',
		name: 'Ant A/B + Audio ch1/2',
		style: { text: '', size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
		steps: [],
		feedbacks: [
			{ feedbackId: 'rf_strength', options: { channel: 1, antenna: 'A', position: 'left' } },
			{ feedbackId: 'rf_strength', options: { channel: 1, antenna: 'B', position: 'mid-left' } },
			{ feedbackId: 'audio_level', options: { channel: 1, position: 'mid-right' } },
			{ feedbackId: 'audio_level', options: { channel: 2, position: 'right' } },
		],
	}

	// Single combined button: Battery ch1 | Battery ch2 | AF ch1 | AF ch2
	presets['battery_audio_combined'] = {
		type: 'simple',
		name: 'Battery ch1/2 + Audio ch1/2',
		style: { text: '', size: 'auto', color: WHITE, bgcolor: DARK, show_topbar: false },
		steps: [],
		feedbacks: [
			{ feedbackId: 'battery_level', options: { channel: 1, position: 'left' } },
			{ feedbackId: 'battery_level', options: { channel: 2, position: 'mid-left' } },
			{ feedbackId: 'audio_level', options: { channel: 1, position: 'mid-right' } },
			{ feedbackId: 'audio_level', options: { channel: 2, position: 'right' } },
		],
	}

	presets['tx_combined_pct'] = {
		type: 'simple',
		name: 'TX status – battery %',
		style: {
			text: `$(dpa-wireless:ch1_tx_name)\\n$(dpa-wireless:ch1_battery_pct)\\n$(dpa-wireless:ch2_tx_name)\\n$(dpa-wireless:ch2_battery_pct)`,
			size: 12,
			color: WHITE,
			bgcolor: DARK,
			show_topbar: false,
		},
		steps: [],
		feedbacks: [
			{ feedbackId: 'low_battery_warning', options: { channel: 1 }, style: { bgcolor: combineRgb(200, 120, 0), color: BLACK } },
			{ feedbackId: 'low_battery_warning', options: { channel: 2 }, style: { bgcolor: combineRgb(200, 120, 0), color: BLACK } },
			{ feedbackId: 'critical_battery_warning', options: { channel: 1 }, style: { bgcolor: combineRgb(140, 0, 0), color: WHITE } },
			{ feedbackId: 'critical_battery_warning', options: { channel: 2 }, style: { bgcolor: combineRgb(140, 0, 0), color: WHITE } },
			{ feedbackId: 'dropout_warning', options: { channel: 1 }, style: { bgcolor: RED, color: WHITE } },
			{ feedbackId: 'dropout_warning', options: { channel: 2 }, style: { bgcolor: RED, color: WHITE } },
		],
	}

	presets['tx_combined_min'] = {
		type: 'simple',
		name: 'TX status – battery remaining',
		style: {
			text: `$(dpa-wireless:ch1_tx_name)\\n$(dpa-wireless:ch1_battery_min)m\\n$(dpa-wireless:ch2_tx_name)\\n$(dpa-wireless:ch2_battery_min)m`,
			size: 12,
			color: WHITE,
			bgcolor: DARK,
			show_topbar: false,
		},
		steps: [],
		feedbacks: [
			{ feedbackId: 'low_battery_warning', options: { channel: 1 }, style: { bgcolor: combineRgb(200, 120, 0), color: BLACK } },
			{ feedbackId: 'low_battery_warning', options: { channel: 2 }, style: { bgcolor: combineRgb(200, 120, 0), color: BLACK } },
			{ feedbackId: 'critical_battery_warning', options: { channel: 1 }, style: { bgcolor: combineRgb(140, 0, 0), color: WHITE } },
			{ feedbackId: 'critical_battery_warning', options: { channel: 2 }, style: { bgcolor: combineRgb(140, 0, 0), color: WHITE } },
			{ feedbackId: 'dropout_warning', options: { channel: 1 }, style: { bgcolor: RED, color: WHITE } },
			{ feedbackId: 'dropout_warning', options: { channel: 2 }, style: { bgcolor: RED, color: WHITE } },
		],
	}

	for (const ch of [1, 2] as const) {
		presets[`mute_ch${ch}`] = {
			type: 'simple',
			name: `Mute Ch ${ch}`,
			style: { text: `ch${ch}\\nMUTE`, size: 14, color: WHITE, bgcolor: DARK, show_topbar: false },
			steps: [{ down: [{ actionId: 'mute', options: { channel: ch, state: 'toggle' } }], up: [] }],
			feedbacks: [{ feedbackId: 'mute_state', options: { channel: ch }, style: { bgcolor: RED, color: WHITE } }],
		}

		presets[`audio_left_ch${ch}`] = {
			type: 'simple',
			name: `Audio meter Ch ${ch} (left)`,
			style: { text: `ch${ch}\\n$(dpa-wireless:ch${ch}_audio_db)`, size: 14, color: WHITE, bgcolor: BLACK, show_topbar: false },
			steps: [],
			feedbacks: [{ feedbackId: 'audio_level', options: { channel: ch, position: 'left' } }],
		}

		presets[`audio_right_ch${ch}`] = {
			type: 'simple',
			name: `Audio meter Ch ${ch} (right)`,
			style: { text: `ch${ch}\\n$(dpa-wireless:ch${ch}_audio_db)`, size: 14, color: WHITE, bgcolor: BLACK, show_topbar: false },
			steps: [],
			feedbacks: [{ feedbackId: 'audio_level', options: { channel: ch, position: 'right' } }],
		}

		presets[`rf_a_left_ch${ch}`] = {
			type: 'simple',
			name: `RF meter Ch ${ch} Ant A (left)`,
			style: { text: `ch${ch}\\n$(dpa-wireless:ch${ch}_rf_a_dbm)`, size: 14, color: WHITE, bgcolor: BLACK, show_topbar: false },
			steps: [],
			feedbacks: [{ feedbackId: 'rf_strength', options: { channel: ch, antenna: 'A', position: 'left' } }],
		}

		presets[`rf_b_left_ch${ch}`] = {
			type: 'simple',
			name: `RF meter Ch ${ch} Ant B (left)`,
			style: { text: `ch${ch}\\n$(dpa-wireless:ch${ch}_rf_b_dbm)`, size: 14, color: WHITE, bgcolor: BLACK, show_topbar: false },
			steps: [],
			feedbacks: [{ feedbackId: 'rf_strength', options: { channel: ch, antenna: 'B', position: 'left' } }],
		}

		presets[`tx_ch${ch}`] = {
			type: 'simple',
			name: `TX status Ch ${ch}`,
			style: {
				text: `$(dpa-wireless:ch${ch}_tx_name)\\n$(dpa-wireless:ch${ch}_battery_pct) · $(dpa-wireless:ch${ch}_battery_min)m`,
				size: 12,
				color: WHITE,
				bgcolor: DARK,
				show_topbar: false,
			},
			steps: [],
			feedbacks: [				{ feedbackId: 'battery_level', options: { channel: ch, position: 'bottom' } },				{ feedbackId: 'tx_active', options: { channel: ch }, style: { bgcolor: DARK, color: WHITE } },
				{ feedbackId: 'low_battery_warning', options: { channel: ch }, style: { bgcolor: combineRgb(200, 120, 0), color: BLACK } },
				{ feedbackId: 'critical_battery_warning', options: { channel: ch }, style: { bgcolor: combineRgb(140, 0, 0), color: WHITE } },
				{ feedbackId: 'dropout_warning', options: { channel: ch }, style: { bgcolor: RED, color: WHITE } },
			],
		}
	}

	self.setPresetDefinitions(structure, presets)
}
