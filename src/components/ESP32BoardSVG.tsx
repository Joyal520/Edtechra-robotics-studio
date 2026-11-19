import React from 'react';

export type BoardPartId =
  | 'usb'
  | 'mcu'
  | 'gpio'
  | '3v3'
  | 'gnd'
  | 'en'
  | 'boot'
  | 'led';

export interface BoardPartInfo {
  id: BoardPartId;
  name: string;
  shortDesc: string;
  details: string;
}

export const ESP32_PARTS: Record<BoardPartId, BoardPartInfo> = {
  usb: {
    id: 'usb',
    name: 'USB Port',
    shortDesc: 'Power & Programming Port',
    details:
      'Connects your ESP32 to your computer using a USB data cable. It supplies power to the board and carries the programs you upload.',
  },
  mcu: {
    id: 'mcu',
    name: 'ESP32 Microcontroller',
    shortDesc: 'The Brain of the Board',
    details:
      'The silver metal shield houses the ESP32-WROOM chip — a dual-core processor with built-in Wi-Fi and Bluetooth that runs your code.',
  },
  gpio: {
    id: 'gpio',
    name: 'GPIO Pins',
    shortDesc: 'General Purpose Input/Output',
    details:
      'Numbered metal pins (like GPIO 2, 18, 21, 22, 23) that send signals out to LEDs/motors or read signals in from buttons and sensors.',
  },
  '3v3': {
    id: '3v3',
    name: '3.3V Power Pin',
    shortDesc: 'Positive 3.3 Volt Supply',
    details:
      'Provides regulated 3.3V power for external sensors and components. Never connect 3.3V directly to GND (that causes a short circuit!).',
  },
  gnd: {
    id: 'gnd',
    name: 'GND (Ground) Pins',
    shortDesc: 'Negative Reference (0V)',
    details:
      'Ground (0V) completes every electrical circuit. Every external LED, sensor, or button needs a return path back to GND.',
  },
  en: {
    id: 'en',
    name: 'EN (Reset) Button',
    shortDesc: 'Restart Your Program',
    details:
      'Pressing EN restarts the ESP32 and runs your uploaded program from the beginning (starting at void setup()).',
  },
  boot: {
    id: 'boot',
    name: 'BOOT Button',
    shortDesc: 'Firmware Download Mode',
    details:
      'Hold BOOT if your computer ever has trouble syncing with the ESP32 during upload. It puts the chip into flashing mode.',
  },
  led: {
    id: 'led',
    name: 'Onboard Built-in LED (GPIO 2)',
    shortDesc: 'Programmable Blue Status LED',
    details:
      'A tiny blue LED soldered right onto the ESP32 board and wired internally to GPIO 2 — perfect for your very first Blink program!',
  },
};

interface ESP32BoardSVGProps {
  selectedPart?: BoardPartId | null;
  exploredParts?: BoardPartId[];
  onSelectPart?: (part: BoardPartId) => void;
  ledOn?: boolean;
  highlightLed?: boolean;
  compact?: boolean;
}

export const ESP32BoardSVG: React.FC<ESP32BoardSVGProps> = ({
  selectedPart,
  exploredParts = [],
  onSelectPart,
  ledOn = false,
  highlightLed = false,
  compact = false,
}) => {
  const isSel = (id: BoardPartId) => selectedPart === id;
  const isExp = (id: BoardPartId) => exploredParts.includes(id);

  const ringStroke = (id: BoardPartId) => {
    if (isSel(id)) return '#22d3ee';
    if (isExp(id)) return '#10b981';
    return 'rgba(34,211,238,0.45)';
  };

  const clickable = Boolean(onSelectPart);

  return (
    <svg
      viewBox="0 0 360 470"
      style={{
        width: '100%',
        maxWidth: compact ? 250 : 340,
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        userSelect: 'none',
      }}
      role="img"
      aria-label="Interactive ESP32 DevKit V1 Board"
    >
      {/* PCB Body */}
      <rect
        x="70"
        y="24"
        width="220"
        height="412"
        rx="14"
        fill="#0d1b30"
        stroke="#2c4975"
        strokeWidth="3"
      />
      {/* Mounting Holes */}
      {[
        [86, 40],
        [274, 40],
        [86, 420],
        [274, 420],
      ].map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="6" fill="#060b16" stroke="#d4a74a" strokeWidth="2.5" />
      ))}

      {/* Wi-Fi Antenna Area */}
      <rect x="115" y="28" width="130" height="44" rx="4" fill="#132542" stroke="#243e66" />
      <path
        d="M130 62 V38 H144 V56 H158 V38 H172 V56 H186 V38 H200 V56 H214 V38 H230"
        fill="none"
        stroke="#d4a74a"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* ESP32-WROOM Metal Shield (Microcontroller) */}
      <g
        onClick={() => onSelectPart?.('mcu')}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        <rect
          x="112"
          y="74"
          width="136"
          height="136"
          rx="8"
          fill="#94a3b8"
          stroke={isSel('mcu') ? '#22d3ee' : '#cbd5e1'}
          strokeWidth={isSel('mcu') ? 4 : 2}
        />
        <rect x="122" y="84" width="116" height="116" rx="4" fill="#64748b" opacity="0.35" />
        <text x="180" y="132" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="14">
          ESP-WROOM-32
        </text>
        <text x="180" y="152" textAnchor="middle" fill="#1e293b" fontWeight="600" fontSize="10.5">
          Wi-Fi + BLE MCU
        </text>
        {clickable && (
          <circle
            cx="180"
            cy="182"
            r="10"
            fill={isExp('mcu') ? '#10b981' : '#0b182e'}
            stroke={ringStroke('mcu')}
            strokeWidth="2.5"
          />
        )}
        {clickable && (
          <text x="180" y="186" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
            {isExp('mcu') ? '✓' : '1'}
          </text>
        )}
      </g>

      {/* Left Pin Header (3V3, GND, GPIOs) */}
      {[
        { label: '3V3', y: 90, part: '3v3' as BoardPartId, color: '#ef4444' },
        { label: 'GND', y: 118, part: 'gnd' as BoardPartId, color: '#64748b' },
        { label: 'D15', y: 146, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D2', y: 174, part: 'gpio' as BoardPartId, color: '#22d3ee' },
        { label: 'D4', y: 202, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D5', y: 230, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D18', y: 258, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D19', y: 286, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D34', y: 314, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D35', y: 342, part: 'gpio' as BoardPartId, color: '#eab308' },
      ].map((p) => (
        <g
          key={p.label}
          onClick={() => onSelectPart?.(p.part)}
          style={{ cursor: clickable ? 'pointer' : 'default' }}
        >
          <rect
            x="64"
            y={p.y - 8}
            width="28"
            height="16"
            rx="3"
            fill={isSel(p.part) ? 'rgba(34,211,238,0.28)' : 'transparent'}
          />
          <circle
            cx="82"
            cy={p.y}
            r="5.5"
            fill={p.color}
            stroke={isSel(p.part) ? '#fff' : '#0f172a'}
            strokeWidth="2"
          />
          <text x="58" y={p.y + 4} textAnchor="end" fill="#cbd5e1" fontSize="10.5" fontWeight="700">
            {p.label}
          </text>
        </g>
      ))}

      {/* Right Pin Header (5V, GND, GPIO 23, 22, 21...) */}
      {[
        { label: '5V', y: 90, part: '3v3' as BoardPartId, color: '#ef4444' },
        { label: 'GND', y: 118, part: 'gnd' as BoardPartId, color: '#64748b' },
        { label: 'D23', y: 146, part: 'gpio' as BoardPartId, color: '#22d3ee' },
        { label: 'D22', y: 174, part: 'gpio' as BoardPartId, color: '#22d3ee' },
        { label: 'D21', y: 202, part: 'gpio' as BoardPartId, color: '#22d3ee' },
        { label: 'D25', y: 230, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D26', y: 258, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D27', y: 286, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D14', y: 314, part: 'gpio' as BoardPartId, color: '#eab308' },
        { label: 'D12', y: 342, part: 'gpio' as BoardPartId, color: '#eab308' },
      ].map((p) => (
        <g
          key={p.label}
          onClick={() => onSelectPart?.(p.part)}
          style={{ cursor: clickable ? 'pointer' : 'default' }}
        >
          <rect
            x="268"
            y={p.y - 8}
            width="28"
            height="16"
            rx="3"
            fill={isSel(p.part) ? 'rgba(34,211,238,0.28)' : 'transparent'}
          />
          <circle
            cx="278"
            cy={p.y}
            r="5.5"
            fill={p.color}
            stroke={isSel(p.part) ? '#fff' : '#0f172a'}
            strokeWidth="2"
          />
          <text x="302" y={p.y + 4} textAnchor="start" fill="#cbd5e1" fontSize="10.5" fontWeight="700">
            {p.label}
          </text>
        </g>
      ))}

      {/* USB-to-Serial Chip */}
      <rect x="160" y="255" width="40" height="40" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <text x="180" y="279" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontWeight="700">
        CP2102
      </text>

      {/* Power Red LED */}
      <rect x="130" y="330" width="12" height="7" rx="2" fill="#ef4444" opacity="0.85" />
      <text x="136" y="348" textAnchor="middle" fill="#94a3b8" fontSize="8">
        PWR
      </text>

      {/* Onboard Blue Programmable LED (GPIO 2) */}
      <g
        onClick={() => onSelectPart?.('led')}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        {(highlightLed || ledOn) && (
          <circle
            cx="224"
            cy="334"
            r={ledOn ? 22 : 18}
            fill={ledOn ? 'rgba(56, 189, 248, 0.45)' : 'rgba(34, 211, 238, 0.18)'}
            stroke={highlightLed ? '#22d3ee' : 'none'}
            strokeWidth={highlightLed ? 2 : 0}
            strokeDasharray={highlightLed ? '4 3' : undefined}
          />
        )}
        <rect
          x="216"
          y="329"
          width="16"
          height="10"
          rx="2.5"
          fill={ledOn ? '#38bdf8' : '#1e3a5f'}
          stroke={ledOn ? '#e0f2fe' : '#64748b'}
          strokeWidth="1.5"
        />
        <text x="224" y="352" textAnchor="middle" fill={ledOn || highlightLed ? '#38bdf8' : '#94a3b8'} fontSize="9" fontWeight="700">
          LED (D2)
        </text>
      </g>

      {/* EN Button */}
      <g
        onClick={() => onSelectPart?.('en')}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        <rect
          x="108"
          y="366"
          width="36"
          height="28"
          rx="5"
          fill="#334155"
          stroke={isSel('en') ? '#22d3ee' : isExp('en') ? '#10b981' : '#94a3b8'}
          strokeWidth={isSel('en') ? 3 : 1.5}
        />
        <circle cx="126" cy="380" r="6" fill="#0f172a" />
        <text x="126" y="407" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">
          EN
        </text>
      </g>

      {/* BOOT Button */}
      <g
        onClick={() => onSelectPart?.('boot')}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        <rect
          x="216"
          y="366"
          width="36"
          height="28"
          rx="5"
          fill="#334155"
          stroke={isSel('boot') ? '#22d3ee' : isExp('boot') ? '#10b981' : '#94a3b8'}
          strokeWidth={isSel('boot') ? 3 : 1.5}
        />
        <circle cx="234" cy="380" r="6" fill="#0f172a" />
        <text x="234" y="407" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">
          BOOT
        </text>
      </g>

      {/* USB Port */}
      <g
        onClick={() => onSelectPart?.('usb')}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        <rect
          x="152"
          y="404"
          width="56"
          height="42"
          rx="6"
          fill="#cbd5e1"
          stroke={isSel('usb') ? '#22d3ee' : isExp('usb') ? '#10b981' : '#64748b'}
          strokeWidth={isSel('usb') ? 3.5 : 2}
        />
        <rect x="160" y="416" width="40" height="16" rx="3" fill="#475569" />
        <text x="180" y="462" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">
          USB PORT
        </text>
      </g>
    </svg>
  );
};
