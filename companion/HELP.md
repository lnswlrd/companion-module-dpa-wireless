## DPA Wireless – Companion Module

Controls and monitors DPA Microphones wireless microphone receivers via OSC over TCP.

### Connection

Enter the receiver's IP address and port (default: 1993) in the module settings. OSC over TCP must be enabled in the receiver's Advanced menu or via DPA Audio Controller software.

---

### Actions

| Action | Description |
|--------|-------------|
| Set mute | Mute, unmute or toggle a channel |
| Set channel name | Set the display name for a channel |
| Trigger IR sync | Initiate IR sync on a channel |
| Set radio preset | Set frequency group and channel preset |
| Set RF output power | Set transmitter RF output power |
| Identify device | Flash the receiver display for identification |

---

### Feedbacks

**Graphical (bar meters)**

| Feedback | Description |
|----------|-------------|
| Audio level meter | Vertical bar showing audio level in dBFS. Green→yellow→red. |
| RF antenna strength meter | Vertical bar showing RF signal in dBm. Blue. |
| Battery level meter | Vertical bar showing battery level. Grey. |

Bar position can be set to: left, mid-left, mid-right, right, top or bottom — allowing multiple meters on a single button.

**Boolean (button colour)**

| Feedback | Description |
|----------|-------------|
| Mute state | Active when channel is muted |
| TX active | Active when transmitter is on and linked |
| Dropout warning | Active on RF dropout (red) |
| Low battery warning | Active at ~15% battery (orange) |
| Critical battery warning | Active below 7.5% battery (dark red) |
| RF interference warning | Active on RF interference (purple) |

---

### Variables

| Variable | Description |
|----------|-------------|
| `$(dpa-wireless:model)` | Device model |
| `$(dpa-wireless:serial)` | Serial number |
| `$(dpa-wireless:device_name)` | Device name |
| `$(dpa-wireless:ch1_name)` / `ch2_name` | Channel name |
| `$(dpa-wireless:ch1_mute)` / `ch2_mute` | Mute state |
| `$(dpa-wireless:ch1_tx_active)` / `ch2_tx_active` | TX active state |
| `$(dpa-wireless:ch1_audio_db)` / `ch2_audio_db` | Audio level in dBFS |
| `$(dpa-wireless:ch1_battery_pct)` / `ch2_battery_pct` | Battery percentage |
| `$(dpa-wireless:ch1_battery_min)` / `ch2_battery_min` | Battery remaining (minutes) |
| `$(dpa-wireless:ch1_rf_a_dbm)` / `ch1_rf_b_dbm` | Ch 1 RF antenna A/B in dBm |
| `$(dpa-wireless:ch2_rf_a_dbm)` / `ch2_rf_b_dbm` | Ch 2 RF antenna A/B in dBm |
| `$(dpa-wireless:ch1_tx_name)` / `ch2_tx_name` | Transmitter name |
