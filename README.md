# companion-module-dpa-wireless

[Bitfocus Companion](https://bitfocus.io/companion) module for controlling and monitoring DPA Microphones wireless systems via OSC over TCP.
> **This was the original development repository for this module.**
> It has since moved to [bitfocus/companion-module-dpa-wireless](https://github.com/bitfocus/companion-module-dpa-wireless) where it is now officially maintained.

## Supported Devices

- N-DR1

## Setup

1. Enable OSC over TCP in the receiver's Advanced menu (or via DPA Audio Controller)
2. Add the module in Companion and enter the receiver's IP address
3. Default port is 1993

## Features

- **Actions** — Mute/unmute channels, set channel name, IR sync, radio preset, RF power, identify
- **Feedbacks** — Audio level, RF strength and battery bar meters; mute, TX active, dropout, low/critical battery and interference warnings
- **Variables** — Audio levels (dBFS), RF strength (dBm), battery %, battery remaining (minutes), TX name, channel name and more
- **Presets** — Ready-to-use button layouts for meters, mute and TX status

## Documentation

See [HELP.md](./companion/HELP.md) for full details on actions, feedbacks and variables.

## License

MIT
