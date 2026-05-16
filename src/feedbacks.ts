import { combineRgb } from '@companion-module/base'
import { graphics } from 'companion-module-utils'
import type ModuleInstance from './main.js'

// Battery meter: light grey bar on dark background
const BATTERY_COLORS: graphics.BarColor[] = [
	{ size: 100, color: combineRgb(200, 200, 200), background: combineRgb(30, 30, 30), backgroundOpacity: 255 },
]

// Audio meter: green → yellow → red (traffic light)
const AUDIO_COLORS: graphics.BarColor[] = [
	{ size: 60, color: combineRgb(209, 220, 71), background: combineRgb(10, 10, 10), backgroundOpacity: 60 },
	{ size: 25, color: combineRgb(220, 200, 0), background: combineRgb(10, 10, 10), backgroundOpacity: 60 },
	{ size: 15, color: combineRgb(220, 40, 0), background: combineRgb(10, 10, 10), backgroundOpacity: 60 },
]

// RF/antenna meter: DPA software blue #485CE5 = rgb(72, 92, 229) — solid signal, dark background
const RF_COLORS: graphics.BarColor[] = [
	{ size: 100, color: combineRgb(72, 92, 229), background: combineRgb(18, 23, 57), backgroundOpacity: 255 },
]

type BarPosition = 'left' | 'mid-left' | 'mid-right' | 'right' | 'top' | 'bottom'

const BAR_WIDTH = 8
const BAR_PADDING = 2

function meterBarImage(
	imgWidth: number,
	imgHeight: number,
	position: BarPosition,
	value: number,
	colors: graphics.BarColor[],
): string {
	const isVertical = position !== 'top' && position !== 'bottom'

	let offsetX: number
	let offsetY: number
	let barLength: number

	if (isVertical) {
		barLength = imgHeight - BAR_PADDING * 2
		offsetY = BAR_PADDING
		// 4 evenly spaced vertical bars across the button width
		const spacing = Math.max(1, Math.floor((imgWidth - BAR_PADDING * 2 - BAR_WIDTH * 4) / 3))
		if (position === 'left') offsetX = BAR_PADDING
		else if (position === 'mid-left') offsetX = BAR_PADDING + BAR_WIDTH + spacing
		else if (position === 'mid-right') offsetX = BAR_PADDING + (BAR_WIDTH + spacing) * 2
		else offsetX = imgWidth - BAR_PADDING - BAR_WIDTH
	} else {
		barLength = imgWidth - BAR_PADDING * 2
		offsetX = BAR_PADDING
		offsetY = position === 'top' ? BAR_PADDING : imgHeight - BAR_WIDTH - BAR_PADDING
	}

	const barData = graphics.bar({
		width: imgWidth,
		height: imgHeight,
		colors,
		barLength,
		barWidth: BAR_WIDTH,
		value,
		type: isVertical ? 'vertical' : 'horizontal',
		offsetX,
		offsetY,
	})

	return Buffer.from(barData).toString('base64')
}

function normalizeAudio(rawTimes10: number | null): number {
	if (rawTimes10 === null) return 0
	const dbfs = rawTimes10 / 10
	return Math.max(0, Math.min(100, ((dbfs + 60) / 60) * 100))
}

function normalizeRf(rawTimes10: number | null): number {
	if (rawTimes10 === null) return 0
	const dbm = rawTimes10 / 10
	return Math.max(0, Math.min(100, ((dbm + 120) / 80) * 100))
}

const POSITION_CHOICES = [
	{ id: 'left', label: 'Left' },
	{ id: 'mid-left', label: 'Mid-left' },
	{ id: 'mid-right', label: 'Mid-right' },
	{ id: 'right', label: 'Right' },
	{ id: 'top', label: 'Top' },
	{ id: 'bottom', label: 'Bottom' },
]

const CHANNEL_CHOICES = [
	{ id: 1, label: 'Channel 1' },
	{ id: 2, label: 'Channel 2' },
]

export type FeedbacksSchema = {
	audio_level: {
		type: 'advanced'
		options: {
			channel: number
			position: string
		}
	}
	rf_strength: {
		type: 'advanced'
		options: {
			channel: number
			antenna: string
			position: string
		}
	}
	battery_level: {
		type: 'advanced'
		options: {
			channel: number
			position: string
		}
	}
	mute_state: {
		type: 'boolean'
		options: {
			channel: number
		}
	}
	tx_active: {
		type: 'boolean'
		options: {
			channel: number
		}
	}
	dropout_warning: {
		type: 'boolean'
		options: {
			channel: number
		}
	}
	low_battery_warning: {
		type: 'boolean'
		options: {
			channel: number
		}
	}
	critical_battery_warning: {
		type: 'boolean'
		options: {
			channel: number
		}
	}
	interference_warning: {
		type: 'boolean'
		options: {
			channel: number
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		audio_level: {
			name: 'Audio level meter',
			type: 'advanced',
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
				{ id: 'position', type: 'dropdown', label: 'Bar position', default: 'left', choices: POSITION_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				const position = feedback.options.position as BarPosition
				const w = feedback.image?.width ?? 72
				const h = feedback.image?.height ?? 72
				const value = normalizeAudio(self.state.ch[ch].audioLevel)
				return {
					imageBuffer: meterBarImage(w, h, position, value, AUDIO_COLORS),
					imageBufferEncoding: { pixelFormat: 'ARGB' },
				}
			},
		},

		rf_strength: {
			name: 'RF antenna strength meter',
			type: 'advanced',
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
				{
					id: 'antenna',
					type: 'dropdown',
					label: 'Antenna',
					default: 'A',
					choices: [
						{ id: 'A', label: 'Antenna A' },
						{ id: 'B', label: 'Antenna B' },
					],
				},
				{ id: 'position', type: 'dropdown', label: 'Bar position', default: 'left', choices: POSITION_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				const position = feedback.options.position as BarPosition
				const w = feedback.image?.width ?? 72
				const h = feedback.image?.height ?? 72
				const raw = feedback.options.antenna === 'B' ? self.state.antenna[ch].rfB : self.state.antenna[ch].rfA
				const value = normalizeRf(raw)
				return {
					imageBuffer: meterBarImage(w, h, position, value, RF_COLORS),
					imageBufferEncoding: { pixelFormat: 'ARGB' },
				}
			},
		},

		battery_level: {
			name: 'Battery level meter',
			type: 'advanced',
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
				{ id: 'position', type: 'dropdown', label: 'Bar position', default: 'bottom', choices: POSITION_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				const position = feedback.options.position as BarPosition
				const w = feedback.image?.width ?? 72
				const h = feedback.image?.height ?? 72
				const bat = self.state.ch[ch].txBattery
				const value = bat !== null ? Math.max(0, Math.min(100, bat[0])) : 0
				return {
					imageBuffer: meterBarImage(w, h, position, value, BATTERY_COLORS),
					imageBufferEncoding: { pixelFormat: 'ARGB' },
				}
			},
		},

		mute_state: {
			name: 'Mute state',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(200, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				return self.state.ch[ch].rxMute
			},
		},

		tx_active: {
			name: 'TX active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 180, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				return self.state.ch[ch].txActive
			},
		},

		dropout_warning: {
			name: 'Dropout warning',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(220, 50, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				return self.state.warnings[`${ch}/txdropout`] ?? false
			},
		},

		low_battery_warning: {
			name: 'Low battery warning',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(200, 120, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				return self.state.warnings[`${ch}/lowbattery`] ?? false
			},
		},

		critical_battery_warning: {
			name: 'Critical battery warning (<7.5%)',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(140, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				const battery = self.state.ch[ch].txBattery
				return battery !== null && battery[0] < 7.5
			},
		},

		interference_warning: {
			name: 'RF interference warning',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(180, 0, 180),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{ id: 'channel', type: 'dropdown', label: 'Channel', default: 1, choices: CHANNEL_CHOICES },
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as 1 | 2
				return self.state.warnings[`${ch}/interference`] ?? false
			},
		},
	})
}
