import React, { useState } from 'react';
import { CircuitSimulator } from '../components/CircuitSimulator';

type PresetKey = 'single-led' | 'two-leds' | 'traffic-light' | 'button-led' | 'sandbox';

export const CircuitLabPage: React.FC = () => {
  const [preset, setPreset] = useState<PresetKey>('single-led');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <span className="tag" style={{ marginBottom: 8 }}>7-CATEGORY VIRTUAL COMPONENT LIBRARY</span>
          <h1>Circuit Lab Simulator</h1>
          <p className="muted" style={{ margin: 0 }}>
            Drag, rotate, and wire real ESP32 circuits. Built-in rule diagnostics catch reversed LEDs, missing resistors, missing ground, and short circuits automatically.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { key: 'single-led' as const, label: 'Level 5: Single LED (GPIO 23)' },
          { key: 'two-leds' as const, label: 'Level 8: Two LEDs' },
          { key: 'traffic-light' as const, label: 'Level 9: Traffic Light 🚦' },
          { key: 'button-led' as const, label: 'Level 10: Button + LED' },
          { key: 'sandbox' as const, label: 'Free Breadboard Sandbox' },
        ].map((p) => (
          <button
            key={p.key}
            className={`btn btn-sm ${preset === p.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPreset(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <CircuitSimulator
        preset={preset}
        expectedGpio={preset === 'single-led' ? 'GPIO23' : undefined}
      />
    </div>
  );
};
