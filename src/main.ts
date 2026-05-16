import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, updateVariableValues, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { DpaConnection } from './connection.js'
import { defaultState, type DeviceState } from './state.js'
import { encodeMessage } from './osc.js'
import type { OscMessage } from './connection.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig
	state: DeviceState = defaultState()
	connection: DpaConnection

	constructor(internal: unknown) {
		super(internal)
		this.connection = new DpaConnection({
			onMessage: (msg) => this.handleOscMessage(msg),
			onStatusChange: (status, message) => this.updateStatus(status, message),
		})
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.setupConnection()
	}

	async destroy(): Promise<void> {
		this.connection.destroy()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.state = defaultState()
		this.setupConnection()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	private setupConnection(): void {
		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
			return
		}
		this.connection.connect(this.config.host, this.config.port ?? 1993)
	}

	private onConnected(): void {
		// Request static settings
		this.connection.send('/settings/retrieve', [])
		this.connection.send('/model', [])
		this.connection.send('/serial', [])
		this.connection.send('/advanced/lan/name', [])

		const interval = this.config.meterInterval ?? 100

		// Subscribe to live metering data
		this.subscribe('/ch/1/audiolevel', interval)
		this.subscribe('/ch/2/audiolevel', interval)
		this.subscribe('/advanced/1/antenna/rfstrength', interval)
		this.subscribe('/advanced/2/antenna/rfstrength', interval)

		// Subscribe to TX active / name
		this.subscribe('/ch/1/tx/active', 500)
		this.subscribe('/ch/2/tx/active', 500)
		this.subscribe('/ch/1/tx/name', 500)
		this.subscribe('/ch/2/tx/name', 500)

		// Subscribe to battery status
		this.subscribe('/ch/1/tx/batterystatus', 5000)
		this.subscribe('/ch/2/tx/batterystatus', 5000)
	}

	private subscribe(address: string, intervalMs: number): void {
		const blob = encodeMessage(address, [])
		this.connection.send('/subscribe', [
			{ type: 'i', value: intervalMs },
			{ type: 'i', value: 0 },
			{ type: 'b', value: blob },
		])
	}

	private handleOscMessage(msg: OscMessage): void {
		const { address, args } = msg

		if (address === '/model') {
			this.state.model = args[0]?.type === 's' ? args[0].value : ''
		} else if (address === '/serial') {
			this.state.serial = args[0]?.type === 's' ? args[0].value : ''
		} else if (address === '/advanced/lan/name') {
			this.state.deviceName = args[0]?.type === 's' ? args[0].value : ''
		} else if (address === '/heartbeat') {
			// Connection confirmed alive
		} else if (address.startsWith('/ch/')) {
			this.handleChannelMessage(address, args)
		} else if (address.startsWith('/advanced/') && address.endsWith('/antenna/rfstrength')) {
			this.handleAntennaMessage(address, args)
		} else if (address.startsWith('/warning/')) {
			this.handleWarningMessage(address, args)
		}

		// Detect connect event (first message received after connecting)
		if (address === '/heartbeat' || address === '/find') {
			// Already connected, subscriptions were set up
		}

		this.checkFeedbacks('audio_level', 'rf_strength', 'battery_level', 'mute_state', 'tx_active', 'dropout_warning', 'low_battery_warning', 'critical_battery_warning', 'interference_warning')
		updateVariableValues(this)
	}

	private handleChannelMessage(address: string, args: OscMessage['args']): void {
		const m = address.match(/^\/ch\/([12])\/(.+)$/)
		if (!m) return
		const ch = parseInt(m[1]) as 1 | 2
		const sub = m[2]

		if (sub === 'audiolevel') {
			this.state.ch[ch].audioLevel = args[0]?.type === 'i' ? args[0].value : null
		} else if (sub === 'name') {
			this.state.ch[ch].name = args[0]?.type === 's' ? args[0].value : ''
		} else if (sub === 'rx/mute') {
			this.state.ch[ch].rxMute = args[0]?.type === 'i' ? args[0].value !== 0 : false
		} else if (sub === 'tx/active') {
			const wasActive = this.state.ch[ch].txActive
			this.state.ch[ch].txActive = args[0]?.type === 'i' ? args[0].value !== 0 : false
			// Subscribe to audio level on first TX activation
			if (!wasActive && this.state.ch[ch].txActive) {
				this.onConnected()
			}
		} else if (sub === 'tx/name') {
			this.state.ch[ch].txName = args[0]?.type === 's' ? args[0].value : ''
		} else if (sub === 'tx/batterystatus') {
			if (args.length >= 5 && args.every((a) => a.type === 'i')) {
				this.state.ch[ch].txBattery = [
					(args[0] as { type: 'i'; value: number }).value,
					(args[1] as { type: 'i'; value: number }).value,
					(args[2] as { type: 'i'; value: number }).value,
					(args[3] as { type: 'i'; value: number }).value,
					(args[4] as { type: 'i'; value: number }).value,
				]
			}
		}
	}

	private handleAntennaMessage(address: string, args: OscMessage['args']): void {
		const m = address.match(/^\/advanced\/([12])\/antenna\/rfstrength$/)
		if (!m) return
		const ch = parseInt(m[1]) as 1 | 2
		// args: [status, rfA×10, rfB×10]
		this.state.antenna[ch].rfA = args[1]?.type === 'i' ? args[1].value : null
		this.state.antenna[ch].rfB = args[2]?.type === 'i' ? args[2].value : null
	}

	private handleWarningMessage(address: string, args: OscMessage['args']): void {
		// /warning/N/name or /warning/name
		const key = address.replace('/warning/', '')
		this.state.warnings[key] = args[0]?.type === 'i' ? args[0].value !== 0 : false
	}

	// Called when TCP connects so we can subscribe
	private _connectedOnce = false

	override updateStatus(status: InstanceStatus, message?: string): void {
		super.updateStatus(status, message)
		if (status === InstanceStatus.Ok && !this._connectedOnce) {
			this._connectedOnce = true
			this.onConnected()
		} else if (status !== InstanceStatus.Ok) {
			this._connectedOnce = false
		}
	}
}
