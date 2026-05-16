export type OscArgument = { type: 'i'; value: number } | { type: 's'; value: string } | { type: 'b'; value: Buffer }

export interface OscMessage {
	address: string
	args: OscArgument[]
}

function pad4(n: number): number {
	return (n + 3) & ~3
}

function encodeString(s: string): Buffer {
	const padded = pad4(s.length + 1)
	const buf = Buffer.alloc(padded)
	buf.write(s, 0, 'utf8')
	return buf
}

export function encodeMessage(address: string, args: OscArgument[]): Buffer {
	const parts: Buffer[] = []
	parts.push(encodeString(address))

	let tags = ','
	for (const arg of args) tags += arg.type
	parts.push(encodeString(tags))

	for (const arg of args) {
		if (arg.type === 'i') {
			const buf = Buffer.alloc(4)
			buf.writeInt32BE(arg.value)
			parts.push(buf)
		} else if (arg.type === 's') {
			parts.push(encodeString(arg.value))
		} else if (arg.type === 'b') {
			const lenBuf = Buffer.alloc(4)
			lenBuf.writeUInt32BE(arg.value.length)
			const padded = Buffer.alloc(pad4(arg.value.length))
			arg.value.copy(padded)
			parts.push(lenBuf, padded)
		}
	}

	return Buffer.concat(parts)
}

export function wrapLengthPrefix(buf: Buffer): Buffer {
	const prefix = Buffer.alloc(4)
	prefix.writeUInt32BE(buf.length)
	return Buffer.concat([prefix, buf])
}

export function decodeMessage(buf: Buffer): OscMessage | null {
	try {
		let offset = 0

		const addrEnd = buf.indexOf(0, offset)
		if (addrEnd < 0) return null
		const address = buf.toString('utf8', offset, addrEnd)
		offset = pad4(addrEnd + 1)

		if (buf[offset] !== 0x2c) return null
		const tagEnd = buf.indexOf(0, offset)
		if (tagEnd < 0) return null
		const tags = buf.toString('utf8', offset + 1, tagEnd)
		offset = pad4(tagEnd + 1)

		const args: OscArgument[] = []
		for (const tag of tags) {
			if (tag === 'i' || tag === 'I') {
				if (offset + 4 > buf.length) return null
				args.push({ type: 'i', value: buf.readInt32BE(offset) })
				offset += 4
			} else if (tag === 's') {
				const strEnd = buf.indexOf(0, offset)
				if (strEnd < 0) return null
				args.push({ type: 's', value: buf.toString('utf8', offset, strEnd) })
				offset = pad4(strEnd + 1)
			} else if (tag === 'b') {
				if (offset + 4 > buf.length) return null
				const blobLen = buf.readUInt32BE(offset)
				offset += 4
				if (offset + blobLen > buf.length) return null
				args.push({ type: 'b', value: buf.slice(offset, offset + blobLen) })
				offset += pad4(blobLen)
			}
		}

		return { address, args }
	} catch {
		return null
	}
}
