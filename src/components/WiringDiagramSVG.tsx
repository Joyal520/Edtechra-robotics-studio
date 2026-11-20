import React from 'react';

export type WiringType = 'external-led' | 'traffic-light' | 'button-led' | 'buzzer' | 'four-leds';

export const WiringDiagramSVG: React.FC<{ type: WiringType }> = ({ type }) => {
  return (
    <div className="card-sm" style={{ background: '#FFFFFF', padding: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: 'var(--text)' }}>
        Accurate Wiring Diagram
      </div>

      {type === 'external-led' && (
        <svg viewBox="0 0 560 185" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* ESP32 Box */}
          <rect x="16" y="24" width="130" height="136" rx="12" fill="#0F172A" />
          <text x="81" y="54" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">ESP32</text>
          <circle cx="146" cy="76" r="6" fill="#2563EB" />
          <text x="132" y="80" textAnchor="end" fill="#93C5FD" fontWeight="700" fontSize="12">GPIO 23</text>
          <circle cx="146" cy="132" r="6" fill="#64748B" />
          <text x="132" y="136" textAnchor="end" fill="#CBD5E1" fontWeight="700" fontSize="12">GND</text>

          {/* Wire GPIO23 -> Resistor */}
          <line x1="152" y1="76" x2="230" y2="76" stroke="#2563EB" strokeWidth="4" />
          {/* 330 Ohm Resistor */}
          <rect x="230" y="62" width="90" height="28" rx="8" fill="#D97706" />
          <rect x="248" y="62" width="7" height="28" fill="#F97316" />
          <rect x="264" y="62" width="7" height="28" fill="#F97316" />
          <rect x="280" y="62" width="7" height="28" fill="#78350F" />
          <text x="275" y="108" textAnchor="middle" fill="#172033" fontWeight="700" fontSize="12">330Ω Resistor</text>

          {/* Wire Resistor -> LED Anode (+) */}
          <line x1="320" y1="76" x2="410" y2="76" stroke="#F59E0B" strokeWidth="4" />
          {/* LED */}
          <circle cx="445" cy="76" r="24" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3.5" />
          <text x="445" y="81" textAnchor="middle" fill="#DC2626" fontWeight="800" fontSize="13">LED</text>
          <text x="405" y="64" textAnchor="end" fill="#16A34A" fontWeight="800" fontSize="12">+ Long</text>
          <text x="488" y="64" textAnchor="start" fill="#64748B" fontWeight="800" fontSize="12">- Short</text>

          {/* Wire LED Cathode (-) -> GND */}
          <path d="M 469 76 H 518 V 132 H 152" fill="none" stroke="#475569" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      )}

      {type === 'traffic-light' && (
        <svg viewBox="0 0 560 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <rect x="16" y="18" width="130" height="184" rx="12" fill="#0F172A" />
          <text x="81" y="44" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">ESP32</text>

          {[
            { label: 'GPIO 23', y: 70, color: '#DC2626', fill: '#FEE2E2', name: 'RED' },
            { label: 'GPIO 22', y: 116, color: '#D97706', fill: '#FEF3C7', name: 'YELLOW' },
            { label: 'GPIO 21', y: 162, color: '#16A34A', fill: '#DCFCE7', name: 'GREEN' },
          ].map((row) => (
            <g key={row.name}>
              <circle cx="146" cy={row.y} r="5.5" fill={row.color} />
              <text x="132" y={row.y + 4} textAnchor="end" fill="#E2E8F0" fontWeight="700" fontSize="11.5">{row.label}</text>
              <line x1="152" y1={row.y} x2="224" y2={row.y} stroke={row.color} strokeWidth="3.5" />
              <rect x="224" y={row.y - 10} width="76" height="20" rx="6" fill="#D97706" />
              <text x="262" y={row.y + 4} textAnchor="middle" fill="#FFF" fontWeight="700" fontSize="10">330Ω</text>
              <line x1="300" y1={row.y} x2="365" y2={row.y} stroke={row.color} strokeWidth="3.5" />
              <circle cx="388" cy={row.y} r="16" fill={row.fill} stroke={row.color} strokeWidth="3" />
              <text x="414" y={row.y + 4} fill="#172033" fontWeight="700" fontSize="11">{row.name}</text>
              <line x1="404" y1={row.y} x2="508" y2={row.y} stroke="#475569" strokeWidth="3" />
            </g>
          ))}

          {/* Shared GND Bus */}
          <circle cx="146" cy="190" r="5.5" fill="#64748B" />
          <text x="132" y="194" textAnchor="end" fill="#CBD5E1" fontWeight="700" fontSize="11.5">GND</text>
          <path d="M 508 70 V 190 H 152" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinejoin="round" />
          <text x="516" y="135" fill="#475569" fontWeight="700" fontSize="11">GND</text>
        </svg>
      )}

      {type === 'button-led' && (
        <svg viewBox="0 0 560 205" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <rect x="16" y="18" width="130" height="168" rx="12" fill="#0F172A" />
          <text x="81" y="46" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">ESP32</text>

          {/* LED Row */}
          <circle cx="146" cy="74" r="5.5" fill="#2563EB" />
          <text x="132" y="78" textAnchor="end" fill="#93C5FD" fontWeight="700" fontSize="11.5">GPIO 23</text>
          <line x1="152" y1="74" x2="225" y2="74" stroke="#2563EB" strokeWidth="3.5" />
          <rect x="225" y="63" width="76" height="22" rx="6" fill="#D97706" />
          <text x="263" y="78" textAnchor="middle" fill="#FFF" fontWeight="700" fontSize="10.5">330Ω</text>
          <line x1="301" y1="74" x2="368" y2="74" stroke="#2563EB" strokeWidth="3.5" />
          <circle cx="390" cy="74" r="18" fill="#DCFCE7" stroke="#16A34A" strokeWidth="3" />
          <text x="390" y="78" textAnchor="middle" fill="#15803D" fontWeight="800" fontSize="11">LED</text>
          <line x1="408" y1="74" x2="504" y2="74" stroke="#475569" strokeWidth="3.5" />

          {/* Button Row */}
          <circle cx="146" cy="130" r="5.5" fill="#F59E0B" />
          <text x="132" y="134" textAnchor="end" fill="#FDE68A" fontWeight="700" fontSize="11.5">GPIO 18</text>
          <line x1="152" y1="130" x2="345" y2="130" stroke="#F59E0B" strokeWidth="3.5" />
          <rect x="345" y="110" width="90" height="40" rx="9" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2.5" />
          <text x="390" y="134" textAnchor="middle" fill="#1D4ED8" fontWeight="800" fontSize="12">BUTTON</text>
          <line x1="435" y1="130" x2="504" y2="130" stroke="#475569" strokeWidth="3.5" />

          {/* Shared GND */}
          <circle cx="146" cy="168" r="5.5" fill="#64748B" />
          <text x="132" y="172" textAnchor="end" fill="#CBD5E1" fontWeight="700" fontSize="11.5">GND</text>
          <path d="M 504 74 V 168 H 152" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      )}

      {type === 'buzzer' && (
        <svg viewBox="0 0 560 170" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <rect x="16" y="20" width="130" height="130" rx="12" fill="#0F172A" />
          <text x="81" y="50" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">ESP32</text>

          <circle cx="146" cy="72" r="6" fill="#2563EB" />
          <text x="132" y="76" textAnchor="end" fill="#93C5FD" fontWeight="700" fontSize="12">GPIO 25</text>
          <line x1="152" y1="72" x2="310" y2="72" stroke="#2563EB" strokeWidth="4" />

          <circle cx="365" cy="96" r="44" fill="#1E293B" stroke="#2563EB" strokeWidth="3" />
          <circle cx="365" cy="96" r="14" fill="#475569" />
          <text x="365" y="156" textAnchor="middle" fill="#172033" fontWeight="800" fontSize="12">Piezo Buzzer</text>
          <text x="305" y="64" textAnchor="end" fill="#16A34A" fontWeight="800" fontSize="12">+</text>
          <text x="305" y="136" textAnchor="end" fill="#64748B" fontWeight="800" fontSize="12">-</text>

          <circle cx="146" cy="122" r="6" fill="#64748B" />
          <text x="132" y="126" textAnchor="end" fill="#CBD5E1" fontWeight="700" fontSize="12">GND</text>
          <line x1="152" y1="122" x2="318" y2="122" stroke="#475569" strokeWidth="4" />
        </svg>
      )}

      {type === 'four-leds' && (
        <svg viewBox="0 0 560 245" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <rect x="16" y="16" width="130" height="214" rx="12" fill="#0F172A" />
          <text x="81" y="42" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">ESP32</text>

          {[
            { label: 'GPIO 23', y: 66, color: '#DC2626', fill: '#FEE2E2', name: 'LED 1' },
            { label: 'GPIO 22', y: 106, color: '#F59E0B', fill: '#FEF3C7', name: 'LED 2' },
            { label: 'GPIO 21', y: 146, color: '#16A34A', fill: '#DCFCE7', name: 'LED 3' },
            { label: 'GPIO 19', y: 186, color: '#2563EB', fill: '#DBEAFE', name: 'LED 4' },
          ].map((row) => (
            <g key={row.name}>
              <circle cx="146" cy={row.y} r="5" fill={row.color} />
              <text x="132" y={row.y + 4} textAnchor="end" fill="#E2E8F0" fontWeight="700" fontSize="11">{row.label}</text>
              <line x1="152" y1={row.y} x2="225" y2={row.y} stroke={row.color} strokeWidth="3.5" />
              <rect x="225" y={row.y - 9} width="72" height="18" rx="5" fill="#D97706" />
              <text x="261" y={row.y + 3.5} textAnchor="middle" fill="#FFF" fontWeight="700" fontSize="9.5">330Ω</text>
              <line x1="297" y1={row.y} x2="365" y2={row.y} stroke={row.color} strokeWidth="3.5" />
              <circle cx="386" cy={row.y} r="14" fill={row.fill} stroke={row.color} strokeWidth="2.5" />
              <text x="410" y={row.y + 4} fill="#172033" fontWeight="700" fontSize="11">{row.name}</text>
              <line x1="400" y1={row.y} x2="508" y2={row.y} stroke="#475569" strokeWidth="3" />
            </g>
          ))}

          <circle cx="146" cy="216" r="5" fill="#64748B" />
          <text x="132" y="220" textAnchor="end" fill="#CBD5E1" fontWeight="700" fontSize="11">GND</text>
          <path d="M 508 66 V 216 H 152" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};
