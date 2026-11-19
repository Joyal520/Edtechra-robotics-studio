import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  Plus,
  RotateCw,
  RotateCcw,
  Square,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  COMPONENT_CATEGORIES,
  COMPONENT_LIBRARY,
  WIRE_COLORS,
  getComponentDef,
} from '../data/components';
import type {
  CircuitDiagnostic,
  CircuitWire,
  ComponentCategory,
  PinDef,
  PlacedComponent,
} from '../types';

interface CircuitSimulatorProps {
  preset?: 'single-led' | 'traffic-light' | 'button-led' | 'two-leds' | 'sandbox';
  expectedGpio?: string; // e.g., 'GPIO23'
  onCircuitValid?: () => void;
}

function getPinWorldPos(comp: PlacedComponent, pin: PinDef): { x: number; y: number } {
  const def = getComponentDef(comp.type);
  if (!def) return { x: comp.x + pin.x, y: comp.y + pin.y };
  const cx = def.width / 2;
  const cy = def.height / 2;
  const dx = pin.x - cx;
  const dy = pin.y - cy;
  const rad = (comp.rotation * Math.PI) / 180;
  const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
  return { x: comp.x + cx + rx, y: comp.y + cy + ry };
}

function buildPreset(preset: NonNullable<CircuitSimulatorProps['preset']>): {
  components: PlacedComponent[];
  wires: CircuitWire[];
} {
  if (preset === 'single-led') {
    return {
      components: [
        { id: 'esp1', type: 'esp32-devkit', x: 50, y: 60, rotation: 0 },
        { id: 'r1', type: 'resistor', x: 270, y: 134, rotation: 0 },
        { id: 'led1', type: 'led-red', x: 440, y: 120, rotation: 0 },
      ],
      wires: [],
    };
  }
  if (preset === 'two-leds') {
    return {
      components: [
        { id: 'esp1', type: 'esp32-devkit', x: 40, y: 50, rotation: 0 },
        { id: 'r1', type: 'resistor', x: 250, y: 110, rotation: 0 },
        { id: 'led1', type: 'led-red', x: 410, y: 75, rotation: 0 },
        { id: 'r2', type: 'resistor', x: 250, y: 220, rotation: 0 },
        { id: 'led2', type: 'led-blue', x: 410, y: 185, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromCompId: 'esp1', fromPinId: 'GPIO23', toCompId: 'r1', toPinId: 'a', color: '#22d3ee' },
        { id: 'w2', fromCompId: 'r1', fromPinId: 'b', toCompId: 'led1', toPinId: 'anode', color: '#f97316' },
        { id: 'w3', fromCompId: 'led1', fromPinId: 'cathode', toCompId: 'esp1', toPinId: 'GND', color: '#64748b' },
      ],
    };
  }
  if (preset === 'traffic-light') {
    return {
      components: [
        { id: 'esp1', type: 'esp32-devkit', x: 40, y: 50, rotation: 0 },
        { id: 'r1', type: 'resistor', x: 250, y: 80, rotation: 0 },
        { id: 'ledR', type: 'led-red', x: 420, y: 45, rotation: 0 },
        { id: 'r2', type: 'resistor', x: 250, y: 170, rotation: 0 },
        { id: 'ledY', type: 'led-yellow', x: 420, y: 135, rotation: 0 },
        { id: 'r3', type: 'resistor', x: 250, y: 260, rotation: 0 },
        { id: 'ledG', type: 'led-green', x: 420, y: 225, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromCompId: 'esp1', fromPinId: 'GPIO23', toCompId: 'r1', toPinId: 'a', color: '#ef4444' },
        { id: 'w2', fromCompId: 'r1', fromPinId: 'b', toCompId: 'ledR', toPinId: 'anode', color: '#ef4444' },
        { id: 'w3', fromCompId: 'ledR', fromPinId: 'cathode', toCompId: 'esp1', toPinId: 'GND', color: '#64748b' },
        { id: 'w4', fromCompId: 'esp1', fromPinId: 'GPIO22', toCompId: 'r2', toPinId: 'a', color: '#facc15' },
        { id: 'w5', fromCompId: 'r2', fromPinId: 'b', toCompId: 'ledY', toPinId: 'anode', color: '#facc15' },
        { id: 'w6', fromCompId: 'ledY', fromPinId: 'cathode', toCompId: 'esp1', toPinId: 'GND', color: '#64748b' },
        { id: 'w7', fromCompId: 'esp1', fromPinId: 'GPIO21', toCompId: 'r3', toPinId: 'a', color: '#22c55e' },
        { id: 'w8', fromCompId: 'r3', fromPinId: 'b', toCompId: 'ledG', toPinId: 'anode', color: '#22c55e' },
        { id: 'w9', fromCompId: 'ledG', fromPinId: 'cathode', toCompId: 'esp1', toPinId: 'GND', color: '#64748b' },
      ],
    };
  }
  if (preset === 'button-led') {
    return {
      components: [
        { id: 'esp1', type: 'esp32-devkit', x: 40, y: 50, rotation: 0 },
        { id: 'btn1', type: 'push-button', x: 250, y: 220, rotation: 0 },
        { id: 'r1', type: 'resistor', x: 250, y: 100, rotation: 0 },
        { id: 'led1', type: 'led-green', x: 420, y: 70, rotation: 0 },
      ],
      wires: [
        { id: 'w1', fromCompId: 'esp1', fromPinId: 'GPIO23', toCompId: 'r1', toPinId: 'a', color: '#22c55e' },
        { id: 'w2', fromCompId: 'r1', fromPinId: 'b', toCompId: 'led1', toPinId: 'anode', color: '#22c55e' },
        { id: 'w3', fromCompId: 'led1', fromPinId: 'cathode', toCompId: 'esp1', toPinId: 'GND', color: '#64748b' },
        { id: 'w4', fromCompId: 'esp1', fromPinId: '3V3', toCompId: 'btn1', toPinId: 'a', color: '#ef4444' },
        { id: 'w5', fromCompId: 'btn1', fromPinId: 'b', toCompId: 'esp1', toPinId: 'GPIO18', color: '#facc15' },
      ],
    };
  }
  return {
    components: [
      { id: 'esp1', type: 'esp32-devkit', x: 50, y: 60, rotation: 0 },
      { id: 'bb1', type: 'breadboard-small', x: 250, y: 110, rotation: 0 },
    ],
    wires: [],
  };
}

/**
 * Rule-based circuit analyzer (zero AI).
 * Builds an electrical net graph including breadboard internal column connections and detects:
 * - Short circuits (3V3/5V directly to GND)
 * - Missing GPIO connection
 * - Missing Ground connection
 * - Missing Resistor (GPIO directly to LED anode)
 * - Reversed LED polarity (GPIO/resistor connected to cathode instead of anode)
 * - Incorrect GPIO (when expectedGpio is specified)
 */
function analyzeCircuit(
  components: PlacedComponent[],
  wires: CircuitWire[],
  expectedGpio?: string
): { diagnostics: CircuitDiagnostic[]; poweredLeds: Set<string>; valid: boolean } {
  const diagnostics: CircuitDiagnostic[] = [];
  const poweredLeds = new Set<string>();

  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };

  // Add wire edges
  for (const w of wires) {
    link(`${w.fromCompId}:${w.fromPinId}`, `${w.toCompId}:${w.toPinId}`);
  }

  // Add internal breadboard column connections (R1-Ck <-> R2-Ck and R3-Ck <-> R4-Ck)
  for (const c of components) {
    if (c.type.startsWith('breadboard-')) {
      const def = getComponentDef(c.type);
      if (!def) continue;
      for (let col = 1; col <= 12; col++) {
        if (def.pins.some((p) => p.id === `R1-C${col}`) && def.pins.some((p) => p.id === `R2-C${col}`)) {
          link(`${c.id}:R1-C${col}`, `${c.id}:R2-C${col}`);
        }
        if (def.pins.some((p) => p.id === `R3-C${col}`) && def.pins.some((p) => p.id === `R4-C${col}`)) {
          link(`${c.id}:R3-C${col}`, `${c.id}:R4-C${col}`);
        }
      }
    }
    if (c.type === 'power-rails') {
      link(`${c.id}:V1`, `${c.id}:V2`);
      link(`${c.id}:V2`, `${c.id}:V3`);
      link(`${c.id}:G1`, `${c.id}:G2`);
      link(`${c.id}:G2`, `${c.id}:G3`);
    }
    if (c.type.startsWith('jumper-')) {
      link(`${c.id}:a`, `${c.id}:b`);
    }
  }

  const reachableDirect = (start: string, target: string): boolean => {
    const visited = new Set<string>([start]);
    const q = [start];
    while (q.length) {
      const cur = q.shift()!;
      if (cur === target) return true;
      for (const nxt of adj.get(cur) || []) {
        if (!visited.has(nxt)) {
          visited.add(nxt);
          q.push(nxt);
        }
      }
    }
    return false;
  };

  const mcu = components.find((c) => ['esp32-devkit', 'esp32-wroom', 'arduino-uno', 'arduino-nano'].includes(c.type));
  const leds = components.filter((c) => c.type.startsWith('led-'));
  const resistors = components.filter((c) => c.type === 'resistor');

  if (!mcu) {
    diagnostics.push({
      id: 'no-mcu',
      severity: 'warning',
      title: 'No microcontroller on canvas',
      explanation: 'Add an ESP32 DevKit V1 from the Microcontrollers category to power your circuit.',
    });
    return { diagnostics, poweredLeds, valid: false };
  }

  const mcuDef = getComponentDef(mcu.type)!;
  const powerPins = mcuDef.pins.filter((p) => p.type === 'power').map((p) => `${mcu.id}:${p.id}`);
  const gndPins = mcuDef.pins.filter((p) => p.type === 'gnd').map((p) => `${mcu.id}:${p.id}`);
  const gpioPins = mcuDef.pins.filter((p) => p.type === 'gpio').map((p) => `${mcu.id}:${p.id}`);

  // 1. Short circuit check
  let shortFound = false;
  for (const pp of powerPins) {
    for (const gp of gndPins) {
      if (reachableDirect(pp, gp)) {
        shortFound = true;
      }
    }
  }
  if (shortFound) {
    diagnostics.push({
      id: 'short-circuit',
      severity: 'error',
      title: 'Short Circuit Detected!',
      explanation: 'A power pin (3V3 or 5V) is connected directly to GND. Remove that wire immediately to protect your ESP32.',
    });
  } else {
    diagnostics.push({
      id: 'no-short',
      severity: 'ok',
      title: 'No short circuits detected',
      explanation: 'Power rails and Ground are safely separated.',
    });
  }

  if (leds.length === 0) {
    diagnostics.push({
      id: 'no-led',
      severity: 'warning',
      title: 'Add an LED to test output wiring',
      explanation: 'Drag or click an LED and a 220Ω resistor from Basic Components to build an LED circuit.',
    });
    return { diagnostics, poweredLeds, valid: !shortFound };
  }

  let allLedsGood = true;

  leds.forEach((led, idx) => {
    const label = leds.length > 1 ? `LED ${idx + 1}` : 'LED';
    const anode = `${led.id}:anode`;
    const cathode = `${led.id}:cathode`;

    // Check if cathode reaches any GND
    const cathodeToGnd = gndPins.some((gp) => reachableDirect(cathode, gp));

    // Check if GPIO directly touches anode without resistor
    const directGpioToAnode = gpioPins.find((gp) => reachableDirect(gp, anode));

    // Check if GPIO reaches resistor and other end of resistor reaches anode
    let resistorGpio: string | null = null;
    let reversedPolarity = false;

    for (const r of resistors) {
      const ra = `${r.id}:a`;
      const rb = `${r.id}:b`;
      for (const gp of gpioPins) {
        if (
          (reachableDirect(gp, ra) && reachableDirect(rb, anode)) ||
          (reachableDirect(gp, rb) && reachableDirect(ra, anode))
        ) {
          resistorGpio = gp;
        }
        if (
          (reachableDirect(gp, ra) && reachableDirect(rb, cathode)) ||
          (reachableDirect(gp, rb) && reachableDirect(ra, cathode))
        ) {
          reversedPolarity = true;
        }
      }
    }

    if (gpioPins.some((gp) => reachableDirect(gp, cathode))) {
      reversedPolarity = true;
    }

    if (reversedPolarity) {
      allLedsGood = false;
      diagnostics.push({
        id: `rev-${led.id}`,
        severity: 'error',
        title: `${label} polarity is reversed`,
        explanation: `The GPIO/resistor signal is connected to the Cathode (-) of ${label}. Swap the wires so the resistor connects to Anode (+) and Cathode (-) connects to GND.`,
      });
    } else if (directGpioToAnode) {
      allLedsGood = false;
      diagnostics.push({
        id: `no-res-${led.id}`,
        severity: 'error',
        title: `Resistor missing for ${label}`,
        explanation: `${directGpioToAnode.split(':')[1]} is wired directly to ${label} Anode (+). Always place a 220Ω resistor in series to protect the LED!`,
      });
    } else if (!resistorGpio) {
      allLedsGood = false;
      diagnostics.push({
        id: `no-gpio-${led.id}`,
        severity: 'error',
        title: `${label} is not connected to a GPIO through a resistor`,
        explanation: `Wire ${expectedGpio || 'a GPIO pin'} → 220Ω Resistor → ${label} Anode (+).`,
      });
    } else if (expectedGpio && !resistorGpio.endsWith(`:${expectedGpio}`)) {
      allLedsGood = false;
      diagnostics.push({
        id: `wrong-gpio-${led.id}`,
        severity: 'error',
        title: `Incorrect GPIO for ${label} (${resistorGpio.split(':')[1]} instead of ${expectedGpio})`,
        explanation: `This lesson expects ${label} on ${expectedGpio}. Reconnect the wire to ${expectedGpio}.`,
      });
    } else if (!cathodeToGnd) {
      allLedsGood = false;
      diagnostics.push({
        id: `no-gnd-${led.id}`,
        severity: 'error',
        title: `Ground (GND) missing for ${label}`,
        explanation: `Connect ${label} Cathode (-) to an ESP32 GND pin to complete the electrical loop.`,
      });
    } else {
      poweredLeds.add(led.id);
      diagnostics.push({
        id: `ok-${led.id}`,
        severity: 'ok',
        title: `${label} wired correctly (${resistorGpio.split(':')[1]} → 220Ω → LED → GND)`,
        explanation: 'Current flows safely through the resistor and LED back to Ground.',
      });
    }
  });

  return { diagnostics, poweredLeds, valid: !shortFound && allLedsGood };
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  preset = 'single-led',
  expectedGpio,
  onCircuitValid,
}) => {
  const initial = useMemo(() => buildPreset(preset), [preset]);
  const [components, setComponents] = useState<PlacedComponent[]>(initial.components);
  const [wires, setWires] = useState<CircuitWire[]>(initial.wires);
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('Basic Components');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ compId: string; pinId: string } | null>(null);
  const [wireColor, setWireColor] = useState<string>(WIRE_COLORS[0].hex);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simTick, setSimTick] = useState<boolean>(true);

  const draggingRef = useRef<{
    mode: 'comp' | 'pan';
    id?: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    const p = buildPreset(preset);
    setComponents(p.components);
    setWires(p.wires);
    setPendingPin(null);
    setSelectedCompId(null);
    setSimRunning(false);
  }, [preset]);

  const analysis = useMemo(
    () => analyzeCircuit(components, wires, expectedGpio),
    [components, wires, expectedGpio]
  );

  useEffect(() => {
    if (analysis.valid && onCircuitValid) {
      onCircuitValid();
    }
  }, [analysis.valid, onCircuitValid]);

  useEffect(() => {
    if (!simRunning) return;
    const id = window.setInterval(() => setSimTick((t) => !t), 550);
    return () => window.clearInterval(id);
  }, [simRunning]);

  const addComponent = (type: string) => {
    const newId = `${type}-${Date.now().toString(36).slice(-4)}`;
    setComponents((prev) => [
      ...prev,
      {
        id: newId,
        type,
        x: 240 + (prev.length % 4) * 35,
        y: 80 + (prev.length % 3) * 45,
        rotation: 0,
      },
    ]);
    setSelectedCompId(newId);
  };

  const rotateSelected = () => {
    if (!selectedCompId) return;
    setComponents((prev) =>
      prev.map((c) => (c.id === selectedCompId ? { ...c, rotation: (c.rotation + 90) % 360 } : c))
    );
  };

  const deleteSelected = () => {
    if (!selectedCompId) return;
    setComponents((prev) => prev.filter((c) => c.id !== selectedCompId));
    setWires((prev) =>
      prev.filter((w) => w.fromCompId !== selectedCompId && w.toCompId !== selectedCompId)
    );
    setSelectedCompId(null);
  };

  const handlePinClick = (e: React.MouseEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (!pendingPin) {
      setPendingPin({ compId, pinId });
      return;
    }
    if (pendingPin.compId === compId && pendingPin.pinId === pinId) {
      setPendingPin(null);
      return;
    }
    // Check if wire already exists -> toggle remove
    const existsIdx = wires.findIndex(
      (w) =>
        (w.fromCompId === pendingPin.compId &&
          w.fromPinId === pendingPin.pinId &&
          w.toCompId === compId &&
          w.toPinId === pinId) ||
        (w.toCompId === pendingPin.compId &&
          w.toPinId === pendingPin.pinId &&
          w.fromCompId === compId &&
          w.fromPinId === pinId)
    );
    if (existsIdx >= 0) {
      setWires((prev) => prev.filter((_, i) => i !== existsIdx));
    } else {
      setWires((prev) => [
        ...prev,
        {
          id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          fromCompId: pendingPin.compId,
          fromPinId: pendingPin.pinId,
          toCompId: compId,
          toPinId: pinId,
          color: wireColor,
        },
      ]);
    }
    setPendingPin(null);
  };

  const handleReset = () => {
    const p = buildPreset(preset);
    setComponents(p.components);
    setWires(p.wires);
    setPendingPin(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSimRunning(false);
  };

  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const drag = draggingRef.current;
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / zoom;
    const dy = (e.clientY - drag.startY) / zoom;
    if (drag.mode === 'comp' && drag.id) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === drag.id
            ? { ...c, x: Math.round((drag.origX + dx) / 5) * 5, y: Math.round((drag.origY + dy) / 5) * 5 }
            : c
        )
      );
    } else if (drag.mode === 'pan') {
      setPan({ x: drag.origX + (e.clientX - drag.startX), y: drag.origY + (e.clientY - drag.startY) });
    }
  };

  const onSvgMouseUp = () => {
    draggingRef.current = null;
  };

  const categoryComponents = COMPONENT_LIBRARY.filter((c) => c.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Toolbar */}
      <div
        className="card-sm"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${simRunning ? 'btn-danger' : 'btn-success'}`}
            onClick={() => setSimRunning((r) => !r)}
          >
            {simRunning ? <Square size={14} /> : <Play size={14} />}
            {simRunning ? 'Stop Simulation' : 'Simulate Circuit'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={rotateSelected} disabled={!selectedCompId}>
            <RotateCw size={14} /> Rotate
          </button>
          <button className="btn btn-danger btn-sm" onClick={deleteSelected} disabled={!selectedCompId}>
            <Trash2 size={14} /> Delete
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}>
            <ZoomIn size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}>
            <ZoomOut size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Wire Color Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
            Wire Color:
          </span>
          {WIRE_COLORS.map((wc) => (
            <button
              key={wc.hex}
              title={wc.name}
              onClick={() => setWireColor(wc.hex)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: wc.hex,
                border: wireColor === wc.hex ? '3px solid #fff' : '2px solid #1e293b',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* 3-Column Lab Layout */}
      <div className="circuit-layout">
        {/* Left: 7-Category Component Palette */}
        <div className="card" style={{ padding: 14, maxHeight: 540, overflowY: 'auto' }}>
          <h3 style={{ marginBottom: 10 }}>Component Library (7 Categories)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {COMPONENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="btn btn-sm"
                style={{
                  minHeight: 28,
                  padding: '4px 8px',
                  fontSize: 11.5,
                  background: activeCategory === cat ? 'var(--cyan)' : 'var(--panel-2)',
                  color: activeCategory === cat ? '#04101f' : 'var(--muted)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {categoryComponents.map((comp) => (
              <button
                key={comp.type}
                onClick={() => addComponent(comp.type)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'left',
                  padding: '9px 10px',
                  borderRadius: 9,
                  background: '#132240',
                  border: '1px solid #243c69',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{comp.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {comp.description.slice(0, 52)}...
                  </div>
                </div>
                <Plus size={16} color="#22d3ee" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Center: Interactive SVG Workbench */}
        <div className="circuit-canvas-wrap">
          <div
            style={{
              padding: '8px 12px',
              background: '#0a1428',
              borderBottom: '1px solid #233861',
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
              color: '#93a7cc',
            }}
          >
            <span>
              {pendingPin
                ? `Wiring from ${pendingPin.pinId} — click another pin to connect (or same pin to cancel)`
                : 'Drag components to move • Click two pins to connect a wire • Click a wire to delete it'}
            </span>
            <span>Zoom {Math.round(zoom * 100)}%</span>
          </div>
          <svg
            viewBox="0 0 640 420"
            style={{ width: '100%', height: 470, display: 'block', cursor: 'grab' }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedCompId(null);
                draggingRef.current = {
                  mode: 'pan',
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: pan.x,
                  origY: pan.y,
                };
              }
            }}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#12213d" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="640" height="420" fill="url(#grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Wires */}
              {wires.map((w) => {
                const c1 = components.find((c) => c.id === w.fromCompId);
                const c2 = components.find((c) => c.id === w.toCompId);
                const d1 = c1 ? getComponentDef(c1.type) : null;
                const d2 = c2 ? getComponentDef(c2.type) : null;
                const p1 = d1?.pins.find((p) => p.id === w.fromPinId);
                const p2 = d2?.pins.find((p) => p.id === w.toPinId);
                if (!c1 || !c2 || !p1 || !p2) return null;
                const a = getPinWorldPos(c1, p1);
                const b = getPinWorldPos(c2, p2);
                const midX = (a.x + b.x) / 2;
                const pathD = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
                return (
                  <g
                    key={w.id}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWires((prev) => prev.filter((x) => x.id !== w.id));
                    }}
                  >
                    <path d={pathD} fill="none" stroke="transparent" strokeWidth="14" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={w.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Components */}
              {components.map((comp) => {
                const def = getComponentDef(comp.type);
                if (!def) return null;
                const isSel = selectedCompId === comp.id;
                const isLedLit =
                  simRunning && simTick && comp.type.startsWith('led-') && analysis.poweredLeds.has(comp.id);
                const cx = def.width / 2;
                const cy = def.height / 2;

                return (
                  <g
                    key={comp.id}
                    transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation}, ${cx}, ${cy})`}
                    style={{ cursor: 'move' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedCompId(comp.id);
                      draggingRef.current = {
                        mode: 'comp',
                        id: comp.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        origX: comp.x,
                        origY: comp.y,
                      };
                    }}
                  >
                    {/* Component Visual Body */}
                    {comp.type.startsWith('led-') ? (
                      <>
                        {isLedLit && (
                          <circle cx={cx} cy={36} r={34} fill={def.color} opacity={0.35} />
                        )}
                        <circle
                          cx={cx}
                          cy={36}
                          r={22}
                          fill={isLedLit ? def.color : '#232c3d'}
                          stroke={def.color}
                          strokeWidth={isSel ? 3.5 : 2.5}
                        />
                        <line x1={22} y1={58} x2={22} y2={84} stroke="#cbd5e1" strokeWidth="3" />
                        <line x1={50} y1={58} x2={50} y2={84} stroke="#94a3b8" strokeWidth="3" />
                        <text x={cx} y={40} textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700">
                          LED
                        </text>
                      </>
                    ) : comp.type === 'resistor' ? (
                      <>
                        <line x1={8} y1={22} x2={104} y2={22} stroke="#cbd5e1" strokeWidth="3" />
                        <rect
                          x={22}
                          y={8}
                          width={68}
                          height={28}
                          rx={8}
                          fill="#d6a56e"
                          stroke={isSel ? '#22d3ee' : '#8a5a2b'}
                          strokeWidth={isSel ? 3 : 2}
                        />
                        {/* 220 ohm color bands: Red, Red, Brown, Gold */}
                        <rect x={34} y={8} width={6} height={28} fill="#ef4444" />
                        <rect x={46} y={8} width={6} height={28} fill="#ef4444" />
                        <rect x={58} y={8} width={6} height={28} fill="#78350f" />
                        <rect x={74} y={8} width={5} height={28} fill="#eab308" />
                        <text x={cx} y={48} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">
                          220Ω
                        </text>
                      </>
                    ) : (
                      <>
                        <rect
                          x={0}
                          y={0}
                          width={def.width}
                          height={def.height}
                          rx={10}
                          fill={def.color}
                          stroke={isSel ? '#22d3ee' : '#3b598a'}
                          strokeWidth={isSel ? 3 : 2}
                        />
                        <text
                          x={cx}
                          y={20}
                          textAnchor="middle"
                          fill={comp.type.startsWith('breadboard') ? '#0f172a' : '#e2e8f0'}
                          fontSize="11"
                          fontWeight="800"
                        >
                          {def.name}
                        </text>
                      </>
                    )}

                    {/* Pins */}
                    {def.pins.map((pin) => {
                      const isPending =
                        pendingPin?.compId === comp.id && pendingPin?.pinId === pin.id;
                      return (
                        <g
                          key={pin.id}
                          style={{ cursor: 'crosshair' }}
                          onClick={(e) => handlePinClick(e, comp.id, pin.id)}
                        >
                          <circle cx={pin.x} cy={pin.y} r={11} fill="transparent" />
                          <circle
                            cx={pin.x}
                            cy={pin.y}
                            r={5.5}
                            fill={
                              isPending
                                ? '#ffffff'
                                : pin.type === 'power'
                                ? '#ef4444'
                                : pin.type === 'gnd'
                                ? '#64748b'
                                : '#22d3ee'
                            }
                            stroke="#04101f"
                            strokeWidth="2"
                          />
                          {!comp.type.startsWith('breadboard-') && (
                            <text
                              x={pin.x > cx ? pin.x - 10 : pin.x < cx ? pin.x + 10 : pin.x}
                              y={pin.y > def.height - 14 ? pin.y - 10 : pin.y + 3.5}
                              textAnchor={pin.x > cx ? 'end' : pin.x < cx ? 'start' : 'middle'}
                              fill="#e2e8f0"
                              fontSize="8.5"
                              fontWeight="700"
                            >
                              {pin.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right: Rule-Based Diagnostics (No AI) */}
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Circuit Checks</h3>
            <span className={analysis.valid ? 'tag tag-ok' : 'tag tag-warn'}>
              {analysis.valid ? 'Ready' : 'Check Wiring'}
            </span>
          </div>

          <ul className="checklist">
            {analysis.diagnostics.map((d) => (
              <li
                key={d.id}
                className={`check-item ${d.severity === 'ok' ? 'ok' : d.severity === 'error' ? 'err' : ''}`}
              >
                {d.severity === 'ok' ? (
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                ) : (
                  <AlertTriangle
                    size={16}
                    color={d.severity === 'error' ? '#f43f5e' : '#f59e0b'}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{d.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {d.explanation}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="card-sm" style={{ fontSize: 12, color: '#93a7cc' }}>
            <strong>Wires connected:</strong> {wires.length} • <strong>Components:</strong> {components.length}
          </div>
        </div>
      </div>
    </div>
  );
};
