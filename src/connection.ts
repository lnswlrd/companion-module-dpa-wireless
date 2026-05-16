import { TCPHelper, InstanceStatus } from '@companion-module/base'
import { type OscArgument, type OscMessage, decodeMessage, encodeMessage, wrapLengthPrefix } from './osc.js'

export type { OscArgument, OscMessage }

export interface DpaConnectionCallbacks {
	onMessage: (msg: OscMessage) => void
	onStatusChange: (status: InstanceStatus, message?: string) => void
}

export class DpaConnection {
	private tcp: TCPHelper | null = null
	private rxBuf: Buffer = Buffer.alloc(0)
	private callbacks: DpaConnectionCallbacks

	constructor(callbacks: DpaConnectionCallbacks) {
		this.callbacks = callbacks
	}

	get isConnected(): boolean {
		return this.tcp?.isConnected ?? false
	}

	connect(host: string, port: number): void {
		this.destroy()
		this.rxBuf = Buffer.alloc(0)

		const tcp = new TCPHelper(host, port, { reconnect: true, reconnect_interval: 5000 })
		this.tcp = tcp

		tcp.on('status_change', (status, message) => {
			this.callbacks.onStatusChange(status, message)
		})

		tcp.on('connect', () => {
			this.callbacks.onStatusChange(InstanceStatus.Ok)
		})

		tcp.on('error', (err) => {
			this.callbacks.onStatusChange(InstanceStatus.ConnectionFailure, err.message)
		})

		tcp.on('end', () => {
			this.callbacks.onStatusChange(InstanceStatus.Disconnected, 'Connection closed')
		})

		tcp.on('data', (data) => {
			this.rxBuf = Buffer.concat([this.rxBuf, data])
			this.flush()
		})
	}

	destroy(): void {
		if (this.tcp) {
			this.tcp.destroy()
			this.tcp = null
		}
	}

	send(address: string, args: OscArgument[]): void {
		if (!this.tcp?.isConnected) return
		const msg = encodeMessage(address, args)
		this.tcp.send(wrapLengthPrefix(msg))
	}

	private flush(): void {
		while (this.rxBuf.length >= 4) {
			const msgLen = this.rxBuf.readUInt32BE(0)
			if (this.rxBuf.length < 4 + msgLen) break

			const msgBuf = this.rxBuf.slice(4, 4 + msgLen)
			this.rxBuf = this.rxBuf.slice(4 + msgLen)

			const msg = decodeMessage(msgBuf)
			if (msg) {
				this.callbacks.onMessage(msg)
			}
		}
	}
}
