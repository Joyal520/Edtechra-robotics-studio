import type { BadgeDef, CodeCheckRule, SessionDef } from '../types';

export const BADGES: BadgeDef[] = [
  {
    id: 'first-connection',
    title: 'First Hardware Connection',
    description: 'Connected a real ESP32 board to your computer over USB.',
    icon: '🏅',
    xpBonus: 50,
  },
  {
    id: 'first-upload',
    title: 'First Upload',
    description: 'Uploaded your very first program to an ESP32 microcontroller.',
    icon: '🚀',
    xpBonus: 60,
  },
  {
    id: 'first-blinking-led',
    title: 'First Blinking LED',
    description: 'Modified blink timing and controlled the onboard LED speed.',
    icon: '💡',
    xpBonus: 60,
  },
  {
    id: 'code-explorer',
    title: 'Code Explorer',
    description: 'Mastered setup(), loop(), pinMode(), digitalWrite(), and delay().',
    icon: '🔍',
    xpBonus: 70,
  },
  {
    id: 'circuit-builder',
    title: 'Circuit Builder',
    description: 'Built and programmed your first external LED breadboard circuit.',
    icon: '⚡',
    xpBonus: 80,
  },
  {
    id: 'led-master',
    title: 'LED Master',
    description: 'Programmed single and multiple external LEDs independently.',
    icon: '🌟',
    xpBonus: 90,
  },
  {
    id: 'traffic-light-engineer',
    title: 'Traffic Light Engineer',
    description: 'Built and programmed a 3-LED sequential traffic light controller.',
    icon: '🚦',
    xpBonus: 120,
  },
  {
    id: 'sensor-explorer',
    title: 'Sensor Explorer',
    description: 'Read real-world data from light, moisture, temperature, and distance sensors.',
    icon: '📡',
    xpBonus: 130,
  },
  {
    id: 'automation-engineer',
    title: 'Automation Engineer',
    description: 'Automated a relay and water pump using sensor thresholds.',
    icon: '⚙️',
    xpBonus: 150,
  },
  {
    id: 'robotics-builder',
    title: 'Robotics Builder',
    description: 'Controlled DC motors with L298N and built an obstacle-avoiding robot.',
    icon: '🤖',
    xpBonus: 200,
  },
];

export const BLINK_CODE = `void setup() {
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(1000);

  digitalWrite(2, LOW);
  delay(1000);
}`;

function makeBasicRules(opts: {
  requireVar?: boolean;
  pin?: number;
  delays?: number[];
  requireHighLow?: boolean;
  requireInput?: boolean;
  requireIfElse?: boolean;
  requireSerial?: boolean;
  requireAnalogRead?: boolean;
  extra?: CodeCheckRule[];
}): CodeCheckRule[] {
  const rules: CodeCheckRule[] = [
    {
      id: 'setup',
      label: 'Defines void setup() { ... }',
      hint: 'Add void setup() { } to configure your pins once at startup.',
      test: (c) => /void\s+setup\s*\(\s*\)\s*\{/.test(c),
    },
    {
      id: 'loop',
      label: 'Defines void loop() { ... }',
      hint: 'Add void loop() { } to repeat your instructions continuously.',
      test: (c) => /void\s+loop\s*\(\s*\)\s*\{/.test(c),
    },
  ];

  if (opts.requireVar) {
    rules.push({
      id: 'var',
      label: opts.pin ? `Declares a variable for GPIO ${opts.pin}` : 'Declares pin variable(s)',
      hint: opts.pin ? `Declare a variable like: int ledPin = ${opts.pin};` : 'Declare int pin variables at the top.',
      test: (c) =>
        opts.pin
          ? new RegExp(`(const\\s+)?int\\s+\\w+\\s*=\\s*${opts.pin}\\s*;`).test(c)
          : /(const\s+)?int\s+\w+\s*=\s*\d+\s*;/.test(c),
    });
  }

  rules.push({
    id: 'pinMode-out',
    label: 'Configures GPIO pin as OUTPUT using pinMode()',
    hint: 'Use pinMode(ledPin, OUTPUT); inside setup().',
    test: (c) => /pinMode\s*\([^)]+,\s*OUTPUT\s*\)\s*;/.test(c),
  });

  if (opts.requireInput) {
    rules.push({
      id: 'pinMode-in',
      label: 'Configures input pin using pinMode(..., INPUT)',
      hint: 'Use pinMode(buttonPin, INPUT); or INPUT_PULLUP inside setup().',
      test: (c) => /pinMode\s*\([^)]+,\s*INPUT(_PULLUP)?\s*\)\s*;/.test(c),
    });
  }

  if (opts.requireHighLow !== false) {
    rules.push({
      id: 'high',
      label: 'Turns output ON with digitalWrite(..., HIGH)',
      hint: 'Use digitalWrite(pin, HIGH); inside loop().',
      test: (c) => /digitalWrite\s*\([^)]+,\s*HIGH\s*\)\s*;/.test(c),
    });
    rules.push({
      id: 'low',
      label: 'Turns output OFF with digitalWrite(..., LOW)',
      hint: 'Use digitalWrite(pin, LOW); inside loop().',
      test: (c) => /digitalWrite\s*\([^)]+,\s*LOW\s*\)\s*;/.test(c),
    });
  }

  if (opts.delays && opts.delays.length > 0) {
    opts.delays.forEach((ms) => {
      rules.push({
        id: `delay-${ms}`,
        label: `Uses delay(${ms}) (${ms / 1000}s)`,
        hint: `Include delay(${ms}); to wait ${ms / 1000} second(s).`,
        test: (c) => new RegExp(`delay\\s*\\(\\s*${ms}\\s*\\)\\s*;`).test(c),
      });
    });
  }

  if (opts.requireIfElse) {
    rules.push({
      id: 'if-else',
      label: 'Uses an if / else decision statement',
      hint: 'Use if (condition) { ... } else { ... } to decide when the output turns ON or OFF.',
      test: (c) => /if\s*\([^)]+\)\s*\{[\s\S]*\}\s*else\s*\{/.test(c),
    });
  }

  if (opts.requireSerial) {
    rules.push({
      id: 'serial',
      label: 'Initializes Serial.begin(115200) and prints readings',
      hint: 'Add Serial.begin(115200); in setup() and Serial.println(...); in loop().',
      test: (c) => /Serial\.begin\s*\(\s*\d+\s*\)\s*;/.test(c) && /Serial\.print(ln)?\s*\(/.test(c),
    });
  }

  if (opts.requireAnalogRead) {
    rules.push({
      id: 'analogRead',
      label: 'Reads sensor value using analogRead()',
      hint: 'Call analogRead(sensorPin); inside loop().',
      test: (c) => /analogRead\s*\([^)]+\)/.test(c),
    });
  }

  if (opts.extra) {
    rules.push(...opts.extra);
  }

  return rules;
}

export const SESSIONS: SessionDef[] = [
  // LEVEL 1
  {
    id: 1,
    level: 1,
    levelTitle: 'Meet Your ESP32 🤖',
    title: 'Connect Your ESP32',
    subtitle: 'Identify your ESP32 board parts and connect it to your computer over USB.',
    objective: 'Students learn how to identify the ESP32 DevKit components and connect the board to their computer.',
    explanation:
      'No breadboard and no coding yet! First, explore your real ESP32 board, plug it into your computer with a USB data cable, and establish a genuine USB connection.',
    xpReward: 100,
    badgeReward: 'first-connection',
    hardwareFocused: true,
    category: 'hardware-connect',
    components: ['ESP32 DevKit V1', 'USB Data Cable'],
  },
  // LEVEL 2
  {
    id: 2,
    level: 2,
    levelTitle: 'Your First Program',
    title: 'Upload Your First Code',
    subtitle: 'Upload a ready-made Blink program and watch the onboard LED blink.',
    objective: 'Students upload a prepared program to their ESP32 and verify that the onboard LED blinks.',
    explanation:
      'A program is a set of instructions that tells a microcontroller what to do. Upload the prepared Blink program to see your ESP32 come alive!',
    xpReward: 120,
    badgeReward: 'first-upload',
    hardwareFocused: true,
    category: 'hardware-upload',
    components: ['ESP32 DevKit V1', 'USB Data Cable'],
    starterCode: BLINK_CODE,
    solutionCode: BLINK_CODE,
  },
  // LEVEL 3
  {
    id: 3,
    level: 3,
    levelTitle: 'Understand the Code',
    title: 'How Does the LED Blink?',
    subtitle: 'Break down setup(), pinMode(), digitalWrite(), delay(), and loop() step by step.',
    objective: 'Students understand each line of the Blink program through interactive micro-exercises.',
    explanation:
      'Now that your ESP32 is blinking, let us open the hood and understand exactly what every single line of that program tells the microcontroller to do.',
    xpReward: 130,
    badgeReward: 'code-explorer',
    hardwareFocused: true,
    category: 'code-understand',
    starterCode: BLINK_CODE,
  },
  // LEVEL 4
  {
    id: 4,
    level: 4,
    levelTitle: 'Modify Your First Program',
    title: 'Control the Blinking Speed',
    subtitle: 'Complete 4 progressive timing challenges by modifying delay() values.',
    objective: 'Students modify existing code to blink slowly, quickly, every 5 seconds, and asymmetrically.',
    explanation:
      'Before writing programs from scratch, real engineers learn by modifying working code. Complete all 4 timing challenges and upload them to your ESP32!',
    xpReward: 140,
    badgeReward: 'first-blinking-led',
    hardwareFocused: true,
    category: 'code-modify',
    starterCode: BLINK_CODE,
  },
  // LEVEL 5
  {
    id: 5,
    level: 5,
    levelTitle: 'Connect an External LED',
    title: 'Build Your First Circuit',
    subtitle: 'Learn LED polarity and 220Ω resistors, then wire GPIO 23 → 220Ω → LED → GND.',
    objective: 'Students identify LED anode/cathode, understand why resistors protect LEDs, and wire their first breadboard circuit.',
    explanation:
      'Now we move from the built-in LED to real physical electronics! Follow the guided wiring steps one connection at a time.',
    xpReward: 150,
    category: 'circuit-guided',
    components: ['ESP32', 'Breadboard', 'LED', '220Ω Resistor', 'Jumper Wires'],
  },
  // LEVEL 6
  {
    id: 6,
    level: 6,
    levelTitle: 'Write Your First External LED Program',
    title: 'Guided Coding',
    subtitle: 'Complete the program line by line from variable declaration to full upload.',
    objective: 'Students progressively write their first external LED program on GPIO 23 and upload it to the ESP32.',
    explanation:
      'Instead of copying finished code, you will build the program one piece at a time. Only after every stage is correct will the full program unlock for upload.',
    xpReward: 160,
    badgeReward: 'circuit-builder',
    category: 'code-guided',
    components: ['ESP32', 'Breadboard', 'LED (GPIO 23)', '220Ω Resistor'],
    solutionCode: `int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}`,
  },
  // LEVEL 7
  {
    id: 7,
    level: 7,
    levelTitle: 'Independent Programming',
    title: 'Program an LED Yourself',
    subtitle: 'Write an asymmetric blink program (3s ON, 1s OFF on GPIO 23) from instructions only.',
    objective: 'Students independently write a complete ESP32 program with progressive hints and rule-based assessment.',
    explanation:
      'Connect an LED to GPIO 23. Write a program that turns the LED ON, waits 3 seconds, turns the LED OFF, waits 1 second, and repeats forever.',
    xpReward: 180,
    category: 'code-independent',
    components: ['ESP32', 'LED on GPIO 23', '220Ω Resistor'],
    starterCode: `// Write your ESP32 program here:
// 1. Declare a variable for GPIO 23
// 2. Configure the pin as OUTPUT in setup()
// 3. Turn ON (3s), Turn OFF (1s) in loop()

`,
    solutionCode: `int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(3000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}`,
    hints: [
      'Hint 1: Start at the top with a variable: int ledPin = 23; then add void setup() { pinMode(ledPin, OUTPUT); }.',
      'Hint 2: Inside void loop(), turn the LED ON using digitalWrite(ledPin, HIGH); and wait 3 seconds with delay(3000);.',
      'Hint 3: Next, turn the LED OFF using digitalWrite(ledPin, LOW); and wait 1 second with delay(1000);.',
    ],
    rules: makeBasicRules({ requireVar: true, pin: 23, delays: [3000, 1000] }),
  },
  // LEVEL 8
  {
    id: 8,
    level: 8,
    levelTitle: 'Multiple LEDs',
    title: 'Two LEDs Alternating',
    subtitle: 'Control LED 1 (GPIO 23) and LED 2 (GPIO 22) so they blink alternately.',
    objective: 'Students wire and program two independent LEDs to alternate ON and OFF.',
    explanation:
      'Real robots control many outputs at once. Wire LED 1 to GPIO 23 and LED 2 to GPIO 22 (each with its own 220Ω resistor to GND) and alternate them.',
    xpReward: 180,
    badgeReward: 'led-master',
    category: 'multi-led',
    components: ['ESP32', 'Breadboard', '2 LEDs (GPIO 23 & 22)', '2× 220Ω Resistors', 'Jumper Wires'],
    starterCode: `int led1 = 23;
int led2 = 22;

void setup() {
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
}

void loop() {
  // Turn LED 1 ON and LED 2 OFF, wait 500ms
  digitalWrite(led1, HIGH);
  digitalWrite(led2, LOW);
  delay(500);

  // Now turn LED 1 OFF and LED 2 ON, wait 500ms
  
}`,
    solutionCode: `int led1 = 23;
int led2 = 22;

void setup() {
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
}

void loop() {
  digitalWrite(led1, HIGH);
  digitalWrite(led2, LOW);
  delay(500);

  digitalWrite(led1, LOW);
  digitalWrite(led2, HIGH);
  delay(500);
}`,
    hints: [
      'Hint 1: Both led1 (23) and led2 (22) must be set as OUTPUT in setup().',
      'Hint 2: In the second half of loop(), write digitalWrite(led1, LOW); and digitalWrite(led2, HIGH);.',
      'Hint 3: Finish loop() with delay(500); so you can clearly see both states.',
    ],
    rules: [
      {
        id: 'pins',
        label: 'Uses GPIO 23 and GPIO 22',
        hint: 'Define int led1 = 23; and int led2 = 22;.',
        test: (c) => /23/.test(c) && /22/.test(c),
      },
      {
        id: 'two-outputs',
        label: 'Sets both pins as OUTPUT',
        hint: 'Call pinMode(..., OUTPUT); twice in setup().',
        test: (c) => (c.match(/pinMode\s*\([^)]+,\s*OUTPUT\s*\)/g) || []).length >= 2,
      },
      {
        id: 'alternate-1',
        label: 'Turns LED 1 ON and LED 2 OFF',
        hint: 'Include digitalWrite(led1, HIGH); and digitalWrite(led2, LOW);.',
        test: (c) =>
          /digitalWrite\s*\(\s*(led1|23)\s*,\s*HIGH\s*\)/.test(c) &&
          /digitalWrite\s*\(\s*(led2|22)\s*,\s*LOW\s*\)/.test(c),
      },
      {
        id: 'alternate-2',
        label: 'Turns LED 1 OFF and LED 2 ON',
        hint: 'Include digitalWrite(led1, LOW); and digitalWrite(led2, HIGH);.',
        test: (c) =>
          /digitalWrite\s*\(\s*(led1|23)\s*,\s*LOW\s*\)/.test(c) &&
          /digitalWrite\s*\(\s*(led2|22)\s*,\s*HIGH\s*\)/.test(c),
      },
      {
        id: 'two-delays',
        label: 'Uses at least two delay() calls',
        hint: 'Put a delay(500); after each LED state.',
        test: (c) => (c.match(/delay\s*\(\s*\d+\s*\)/g) || []).length >= 2,
      },
    ],
  },
  // LEVEL 9
  {
    id: 9,
    level: 9,
    levelTitle: 'Traffic Light 🚦',
    title: 'Build a Traffic Light',
    subtitle: 'Red (GPIO 23, 3s) → Yellow (GPIO 22, 2s) → Green (GPIO 21, 3s) → Repeat.',
    objective: 'Students build and program a realistic 3-LED sequential traffic light system.',
    explanation:
      'Your first major engineering project! Wire Red (GPIO 23), Yellow (GPIO 22), and Green (GPIO 21), write the sequential logic, watch the live virtual traffic light animate from your code, and upload it to your ESP32.',
    xpReward: 220,
    badgeReward: 'traffic-light-engineer',
    category: 'traffic-light',
    components: ['ESP32', 'Breadboard', 'Red LED (23)', 'Yellow LED (22)', 'Green LED (21)', '3× 220Ω Resistors', 'Jumper Wires'],
    starterCode: `int redLED = 23;
int yellowLED = 22;
int greenLED = 21;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
}

void loop() {
  // Step 1: Red ON for 3 seconds
  digitalWrite(redLED, HIGH);
  delay(3000);
  digitalWrite(redLED, LOW);

  // Step 2: Yellow ON for 2 seconds
  digitalWrite(yellowLED, HIGH);
  delay(2000);
  digitalWrite(yellowLED, LOW);

  // Step 3: Green ON for 3 seconds
  digitalWrite(greenLED, HIGH);
  delay(3000);
  digitalWrite(greenLED, LOW);
}`,
    solutionCode: `int redLED = 23;
int yellowLED = 22;
int greenLED = 21;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
}

void loop() {
  digitalWrite(redLED, HIGH);
  delay(3000);
  digitalWrite(redLED, LOW);

  digitalWrite(yellowLED, HIGH);
  delay(2000);
  digitalWrite(yellowLED, LOW);

  digitalWrite(greenLED, HIGH);
  delay(3000);
  digitalWrite(greenLED, LOW);
}`,
    hints: [
      'Hint 1: Configure redLED (23), yellowLED (22), and greenLED (21) as OUTPUT in setup().',
      'Hint 2: Turn Red HIGH, delay(3000), then Red LOW before turning Yellow HIGH.',
      'Hint 3: Yellow stays ON for delay(2000), then Green stays ON for delay(3000).',
    ],
    rules: [
      {
        id: 'pins',
        label: 'Configures Red (23), Yellow (22), and Green (21)',
        hint: 'Use GPIOs 23, 22, and 21 for Red, Yellow, and Green LEDs.',
        test: (c) => /23/.test(c) && /22/.test(c) && /21/.test(c),
      },
      {
        id: 'outputs',
        label: 'Sets all 3 LED pins as OUTPUT',
        hint: 'Call pinMode(..., OUTPUT); for all 3 LEDs in setup().',
        test: (c) => (c.match(/pinMode\s*\([^)]+,\s*OUTPUT\s*\)/g) || []).length >= 3,
      },
      {
        id: 'red',
        label: 'Controls Red LED (HIGH and LOW)',
        hint: 'Turn redLED HIGH and then LOW.',
        test: (c) => /digitalWrite\s*\(\s*(redLED|23)\s*,\s*HIGH\s*\)/.test(c) && /digitalWrite\s*\(\s*(redLED|23)\s*,\s*LOW\s*\)/.test(c),
      },
      {
        id: 'yellow',
        label: 'Controls Yellow LED (HIGH and LOW)',
        hint: 'Turn yellowLED HIGH and then LOW.',
        test: (c) => /digitalWrite\s*\(\s*(yellowLED|22)\s*,\s*HIGH\s*\)/.test(c) && /digitalWrite\s*\(\s*(yellowLED|22)\s*,\s*LOW\s*\)/.test(c),
      },
      {
        id: 'green',
        label: 'Controls Green LED (HIGH and LOW)',
        hint: 'Turn greenLED HIGH and then LOW.',
        test: (c) => /digitalWrite\s*\(\s*(greenLED|21)\s*,\s*HIGH\s*\)/.test(c) && /digitalWrite\s*\(\s*(greenLED|21)\s*,\s*LOW\s*\)/.test(c),
      },
      {
        id: 'timings',
        label: 'Uses 3000ms (Red/Green) and 2000ms (Yellow) delays',
        hint: 'Use delay(3000); for Red & Green and delay(2000); for Yellow.',
        test: (c) => /delay\s*\(\s*3000\s*\)/.test(c) && /delay\s*\(\s*2000\s*\)/.test(c),
      },
    ],
  },
  // LEVEL 10
  {
    id: 10,
    level: 10,
    levelTitle: 'Buttons',
    title: 'Control an LED Using a Button',
    subtitle: 'Read digital input on GPIO 18 to turn the LED on GPIO 23 ON and OFF.',
    objective: 'Students learn digital input, digitalRead(), and connecting a push button to control an LED.',
    explanation:
      'So far, your ESP32 only sent signals out. Now it will listen! Read a push button on GPIO 18 with digitalRead() and turn the LED ON when pressed.',
    xpReward: 190,
    category: 'buttons',
    components: ['ESP32', 'Breadboard', 'Push Button (GPIO 18)', 'LED (GPIO 23)', '220Ω & 10kΩ Resistors'],
    starterCode: `int buttonPin = 18;
int ledPin = 23;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,
    solutionCode: `int buttonPin = 18;
int ledPin = 23;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,
    hints: [
      'Hint 1: Set buttonPin (18) as INPUT and ledPin (23) as OUTPUT.',
      'Hint 2: Read the button with int buttonState = digitalRead(buttonPin);.',
      'Hint 3: Use if (buttonState == HIGH) { digitalWrite(ledPin, HIGH); } else { digitalWrite(ledPin, LOW); }.',
    ],
    rules: makeBasicRules({
      requireVar: true,
      requireInput: true,
      requireIfElse: true,
      extra: [
        {
          id: 'digitalRead',
          label: 'Reads button state using digitalRead()',
          hint: 'Use digitalRead(buttonPin); inside loop().',
          test: (c) => /digitalRead\s*\([^)]+\)/.test(c),
        },
      ],
    }),
  },
  // LEVEL 11
  {
    id: 11,
    level: 11,
    levelTitle: 'Conditional Programming',
    title: 'Smart LED with if / else',
    subtitle: 'Master conditional logic to make your ESP32 make smart decisions.',
    objective: 'Students write if / else conditional code to react to input states.',
    explanation:
      'Every intelligent robot uses if and else to make decisions. Write a Smart LED controller that turns ON a status LED when the button is pressed and turns it OFF otherwise.',
    xpReward: 190,
    category: 'conditionals',
    components: ['ESP32', 'Push Button (GPIO 18)', 'LED (GPIO 23)', 'Resistors'],
    starterCode: `int buttonPin = 18;
int ledPin = 23;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int state = digitalRead(buttonPin);
  // Write an if / else block to turn ledPin HIGH when state == HIGH
  
}`,
    solutionCode: `int buttonPin = 18;
int ledPin = 23;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int state = digitalRead(buttonPin);
  if (state == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,
    hints: [
      'Hint 1: Check the button with if (state == HIGH) { ... }.',
      'Hint 2: Inside the if block, call digitalWrite(ledPin, HIGH);.',
      'Hint 3: Add else { digitalWrite(ledPin, LOW); } so the LED turns off when released.',
    ],
    rules: makeBasicRules({ requireInput: true, requireIfElse: true }),
  },
  // LEVEL 12 — SENSORS (Sessions 12–17)
  {
    id: 12,
    level: 12,
    levelTitle: 'Sensors',
    title: 'Introduction to Sensors',
    subtitle: 'Understand how analog and digital sensors convert the physical world into numbers.',
    objective: 'Students learn how ESP32 ADC pins read analog sensor values and print them over Serial.',
    explanation:
      'Sensors are the eyes and ears of a robot. On the ESP32, analogRead() converts voltage into a number from 0 to 4095.',
    xpReward: 140,
    category: 'sensors',
    sensorType: 'ldr',
    components: ['ESP32', 'Analog Sensor (GPIO 34)'],
    starterCode: `int sensorPin = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(sensorPin);
  Serial.println(value);
  delay(500);
}`,
    solutionCode: `int sensorPin = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(sensorPin);
  Serial.println(value);
  delay(500);
}`,
    rules: [
      { id: 'setup', label: 'Defines setup() with Serial.begin(115200)', hint: 'Add Serial.begin(115200); inside setup().', test: (c) => /Serial\.begin\s*\(\s*115200\s*\)/.test(c) },
      { id: 'read', label: 'Reads sensor with analogRead()', hint: 'Use analogRead(sensorPin); in loop().', test: (c) => /analogRead\s*\([^)]+\)/.test(c) },
      { id: 'print', label: 'Prints value with Serial.println()', hint: 'Use Serial.println(value);.', test: (c) => /Serial\.println\s*\([^)]+\)/.test(c) },
    ],
  },
  {
    id: 13,
    level: 12,
    levelTitle: 'Sensors',
    title: 'Light Sensor (LDR) — Automatic Night Light',
    subtitle: 'Turn the LED ON automatically when the room gets dark.',
    objective: 'Students build an Automatic Night Light using an LDR sensor and threshold condition.',
    explanation:
      'Use an LDR on GPIO 34 and an LED on GPIO 23. When light level drops below 1500 (dark), turn the LED ON; otherwise turn it OFF.',
    xpReward: 180,
    category: 'sensors',
    sensorType: 'ldr',
    components: ['ESP32', 'LDR Sensor (GPIO 34)', 'LED (GPIO 23)', '10kΩ & 220Ω Resistors'],
    starterCode: `int ldrPin = 34;
int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.println(lightLevel);

  if (lightLevel < 1500) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(300);
}`,
    solutionCode: `int ldrPin = 34;
int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.println(lightLevel);

  if (lightLevel < 1500) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(300);
}`,
    rules: makeBasicRules({ requireAnalogRead: true, requireIfElse: true, requireSerial: true }),
  },
  {
    id: 14,
    level: 12,
    levelTitle: 'Sensors',
    title: 'Soil Moisture Sensor',
    subtitle: 'Measure soil moisture levels and alert when soil is dry.',
    objective: 'Students read soil moisture values and display dry/wet status.',
    explanation:
      'Soil moisture sensors measure how much water is in plant soil. Read the sensor on GPIO 35 and light an indicator LED when the soil is too dry.',
    xpReward: 180,
    category: 'sensors',
    sensorType: 'moisture',
    components: ['ESP32', 'Soil Moisture Sensor (GPIO 35)', 'LED (GPIO 23)'],
    starterCode: `int moisturePin = 35;
int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int moisture = analogRead(moisturePin);
  Serial.println(moisture);

  if (moisture < 1800) {
    digitalWrite(ledPin, HIGH); // Soil is dry!
  } else {
    digitalWrite(ledPin, LOW);  // Soil is moist
  }
  delay(500);
}`,
    solutionCode: `int moisturePin = 35;
int ledPin = 23;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int moisture = analogRead(moisturePin);
  Serial.println(moisture);

  if (moisture < 1800) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(500);
}`,
    rules: makeBasicRules({ requireAnalogRead: true, requireIfElse: true, requireSerial: true }),
  },
  {
    id: 15,
    level: 12,
    levelTitle: 'Sensors',
    title: 'DHT11 Temperature Sensor',
    subtitle: 'Build a real-time temperature and humidity monitor.',
    objective: 'Students interface with a DHT11 digital temperature sensor and log readings to Serial.',
    explanation:
      'The DHT11 measures both temperature (°C) and humidity (%). Read it on GPIO 4 and print live climate readings to the Serial Monitor.',
    xpReward: 180,
    category: 'sensors',
    sensorType: 'dht11',
    components: ['ESP32', 'DHT11 Sensor (GPIO 4)', 'Jumper Wires'],
    starterCode: `#include "DHT.h"
#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print(" C | Humidity: ");
  Serial.println(hum);
  delay(2000);
}`,
    solutionCode: `#include "DHT.h"
#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print(" C | Humidity: ");
  Serial.println(hum);
  delay(2000);
}`,
    rules: [
      { id: 'dht', label: 'Includes DHT library and calls dht.begin()', hint: 'Include DHT.h and call dht.begin() in setup().', test: (c) => /DHT/.test(c) && /dht\.begin\s*\(\s*\)/.test(c) },
      { id: 'readTemp', label: 'Reads temperature using dht.readTemperature()', hint: 'Call dht.readTemperature() in loop().', test: (c) => /readTemperature\s*\(\s*\)/.test(c) },
      { id: 'serial', label: 'Prints readings to Serial Monitor', hint: 'Use Serial.begin(115200) and Serial.println().', test: (c) => /Serial\.begin/.test(c) && /Serial\.print/.test(c) },
    ],
  },
  {
    id: 16,
    level: 12,
    levelTitle: 'Sensors',
    title: 'Temperature-Based LED Indicator',
    subtitle: 'Red LED ON when hot (> 30°C), Green LED ON when normal.',
    objective: 'Students combine DHT11 temperature readings with dual-LED threshold alerting.',
    explanation:
      'If temperature exceeds 30°C, turn the Red LED (GPIO 23) ON and Green LED (GPIO 21) OFF. Otherwise turn Green ON and Red OFF.',
    xpReward: 190,
    category: 'sensors',
    sensorType: 'dht11-led',
    components: ['ESP32', 'DHT11 (GPIO 4)', 'Red LED (23)', 'Green LED (21)', '2× 220Ω Resistors'],
    starterCode: `#include "DHT.h"
DHT dht(4, DHT11);
int redLED = 23;
int greenLED = 21;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  if (temp > 30.0) {
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
  } else {
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, HIGH);
  }
  delay(1000);
}`,
    solutionCode: `#include "DHT.h"
DHT dht(4, DHT11);
int redLED = 23;
int greenLED = 21;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  if (temp > 30.0) {
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
  } else {
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, HIGH);
  }
  delay(1000);
}`,
    rules: makeBasicRules({ requireIfElse: true }),
  },
  {
    id: 17,
    level: 12,
    levelTitle: 'Sensors',
    title: 'Ultrasonic Sensor — Distance Measurement',
    subtitle: 'Measure distance in centimeters using the HC-SR04 ultrasonic sensor.',
    objective: 'Students trigger ultrasonic sound pulses and calculate obstacle distance in cm.',
    explanation:
      'The HC-SR04 sends an ultrasonic sound wave on TRIG (GPIO 5) and times the echo on ECHO (GPIO 18) to measure distance: distance = duration * 0.034 / 2.',
    xpReward: 200,
    badgeReward: 'sensor-explorer',
    category: 'sensors',
    sensorType: 'ultrasonic',
    components: ['ESP32', 'HC-SR04 Ultrasonic Sensor (TRIG 5, ECHO 18)'],
    starterCode: `int trigPin = 5;
int echoPin = 18;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;
  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(300);
}`,
    solutionCode: `int trigPin = 5;
int echoPin = 18;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;
  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(300);
}`,
    rules: makeBasicRules({
      requireInput: true,
      requireSerial: true,
      extra: [
        {
          id: 'pulseIn',
          label: 'Measures echo pulse with pulseIn()',
          hint: 'Use pulseIn(echoPin, HIGH); to time the returning echo.',
          test: (c) => /pulseIn\s*\([^)]+\)/.test(c),
        },
      ],
    }),
  },
  // LEVEL 13 — AUTOMATION (Sessions 18–22)
  {
    id: 18,
    level: 13,
    levelTitle: 'Automation',
    title: 'Introduction to Relay',
    subtitle: 'Learn how a relay lets a 3.3V ESP32 safely switch higher-power devices.',
    objective: 'Students understand relay isolation, NO/NC/COM terminals, and digital control.',
    explanation:
      'An ESP32 pin can only power tiny components like LEDs. A relay is an electrically operated switch that lets your ESP32 safely control pumps, fans, and lamps.',
    xpReward: 150,
    category: 'automation',
    sensorType: 'relay',
    components: ['ESP32', '5V Relay Module (GPIO 26)'],
    starterCode: `int relayPin = 26;

void setup() {
  pinMode(relayPin, OUTPUT);
}

void loop() {
  digitalWrite(relayPin, HIGH); // Relay ON
  delay(2000);
  digitalWrite(relayPin, LOW);  // Relay OFF
  delay(2000);
}`,
    solutionCode: `int relayPin = 26;

void setup() {
  pinMode(relayPin, OUTPUT);
}

void loop() {
  digitalWrite(relayPin, HIGH);
  delay(2000);
  digitalWrite(relayPin, LOW);
  delay(2000);
}`,
    rules: makeBasicRules({ requireVar: true, pin: 26 }),
  },
  {
    id: 19,
    level: 13,
    levelTitle: 'Automation',
    title: 'Relay Programming',
    subtitle: 'Program timed relay switching cycles with Serial status logging.',
    objective: 'Students control relay timing and verify state transitions over Serial.',
    explanation:
      'Program your relay on GPIO 26 to stay ON for 3 seconds and OFF for 3 seconds while reporting its status to the Serial Monitor.',
    xpReward: 160,
    category: 'automation',
    sensorType: 'relay',
    components: ['ESP32', 'Relay Module (GPIO 26)'],
    starterCode: `int relayPin = 26;

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(relayPin, HIGH);
  Serial.println("Relay: ON");
  delay(3000);

  digitalWrite(relayPin, LOW);
  Serial.println("Relay: OFF");
  delay(3000);
}`,
    solutionCode: `int relayPin = 26;

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(relayPin, HIGH);
  Serial.println("Relay: ON");
  delay(3000);

  digitalWrite(relayPin, LOW);
  Serial.println("Relay: OFF");
  delay(3000);
}`,
    rules: makeBasicRules({ requireVar: true, pin: 26, delays: [3000], requireSerial: true }),
  },
  {
    id: 20,
    level: 13,
    levelTitle: 'Automation',
    title: 'Controlling a Small DC Load',
    subtitle: 'Switch a 5V DC fan or lamp through a relay using a button.',
    objective: 'Students wire and program a button-controlled DC load through a relay.',
    explanation:
      'Combine your button input (GPIO 18) with your relay output (GPIO 26) to safely toggle a DC load.',
    xpReward: 170,
    category: 'automation',
    sensorType: 'relay',
    components: ['ESP32', 'Relay (26)', 'Button (18)', 'DC Load + Battery'],
    starterCode: `int buttonPin = 18;
int relayPin = 26;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(relayPin, OUTPUT);
}

void loop() {
  if (digitalRead(buttonPin) == HIGH) {
    digitalWrite(relayPin, HIGH);
  } else {
    digitalWrite(relayPin, LOW);
  }
}`,
    solutionCode: `int buttonPin = 18;
int relayPin = 26;

void setup() {
  pinMode(buttonPin, INPUT);
  pinMode(relayPin, OUTPUT);
}

void loop() {
  if (digitalRead(buttonPin) == HIGH) {
    digitalWrite(relayPin, HIGH);
  } else {
    digitalWrite(relayPin, LOW);
  }
}`,
    rules: makeBasicRules({ requireInput: true, requireIfElse: true }),
  },
  {
    id: 21,
    level: 13,
    levelTitle: 'Automation',
    title: 'Introduction to Water Pumps',
    subtitle: 'Safely power and pulse a mini submersible DC water pump via relay.',
    objective: 'Students learn pump power safety and timed watering pulses.',
    explanation:
      'Mini 5V DC water pumps draw more current than an ESP32 pin can supply. Always power the pump from a separate supply switched by a relay!',
    xpReward: 180,
    category: 'automation',
    sensorType: 'pump',
    components: ['ESP32', 'Relay (26)', 'Mini DC Water Pump', '5V Power Supply'],
    starterCode: `int pumpRelay = 26;

void setup() {
  pinMode(pumpRelay, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  Serial.println("Watering for 2 seconds...");
  digitalWrite(pumpRelay, HIGH);
  delay(2000);
  digitalWrite(pumpRelay, LOW);
  Serial.println("Pump OFF");
  delay(5000);
}`,
    solutionCode: `int pumpRelay = 26;

void setup() {
  pinMode(pumpRelay, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  Serial.println("Watering for 2 seconds...");
  digitalWrite(pumpRelay, HIGH);
  delay(2000);
  digitalWrite(pumpRelay, LOW);
  Serial.println("Pump OFF");
  delay(5000);
}`,
    rules: makeBasicRules({ requireVar: true, pin: 26, delays: [2000, 5000], requireSerial: true }),
  },
  {
    id: 22,
    level: 13,
    levelTitle: 'Automation',
    title: 'Automatic Irrigation System',
    subtitle: 'Dry soil triggers the relay and water pump until moisture reaches target.',
    objective: 'Students build a closed-loop automatic plant irrigation system.',
    explanation:
      'Soil moisture sensor (GPIO 35) detects dry soil (< 1800) → ESP32 activates the relay (GPIO 26) → Water pump runs until soil reaches the selected moisture level.',
    xpReward: 250,
    badgeReward: 'automation-engineer',
    category: 'automation',
    sensorType: 'irrigation',
    components: ['ESP32', 'Soil Moisture Sensor (35)', 'Relay (26)', 'Water Pump'],
    starterCode: `int moisturePin = 35;
int relayPin = 26;
int dryThreshold = 1800;

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int moisture = analogRead(moisturePin);
  Serial.println(moisture);

  if (moisture < dryThreshold) {
    digitalWrite(relayPin, HIGH); // Start pump
  } else {
    digitalWrite(relayPin, LOW);  // Stop pump
  }
  delay(500);
}`,
    solutionCode: `int moisturePin = 35;
int relayPin = 26;
int dryThreshold = 1800;

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int moisture = analogRead(moisturePin);
  Serial.println(moisture);

  if (moisture < dryThreshold) {
    digitalWrite(relayPin, HIGH);
  } else {
    digitalWrite(relayPin, LOW);
  }
  delay(500);
}`,
    rules: makeBasicRules({ requireAnalogRead: true, requireIfElse: true, requireSerial: true }),
  },
  // LEVEL 14 — ROBOTICS (Sessions 23–30)
  {
    id: 23,
    level: 14,
    levelTitle: 'Robotics',
    title: 'Introduction to Motors',
    subtitle: 'Understand how DC motors convert electricity into rotational motion.',
    objective: 'Students learn motor torque, direction reversal, and why motor drivers are required.',
    explanation:
      'Robots move using motors. Reversing the voltage polarity reverses the motor spin direction — and a motor driver lets our ESP32 do that digitally!',
    xpReward: 150,
    category: 'robotics',
    sensorType: 'motor',
    components: ['ESP32', 'DC Motor', 'L298N Driver', 'Battery Pack'],
    starterCode: `int motorPin = 25;

void setup() {
  pinMode(motorPin, OUTPUT);
}

void loop() {
  digitalWrite(motorPin, HIGH);
  delay(2000);
  digitalWrite(motorPin, LOW);
  delay(2000);
}`,
    solutionCode: `int motorPin = 25;

void setup() {
  pinMode(motorPin, OUTPUT);
}

void loop() {
  digitalWrite(motorPin, HIGH);
  delay(2000);
  digitalWrite(motorPin, LOW);
  delay(2000);
}`,
    rules: makeBasicRules({ requireVar: true }),
  },
  {
    id: 24,
    level: 14,
    levelTitle: 'Robotics',
    title: 'DC Motor Control',
    subtitle: 'Spin a DC motor clockwise, stop, and reverse counter-clockwise.',
    objective: 'Students control DC motor direction using two logic pins (IN1, IN2).',
    explanation:
      'Setting IN1=HIGH, IN2=LOW spins the motor forward. Setting IN1=LOW, IN2=HIGH reverses it. Both LOW stops the motor.',
    xpReward: 170,
    category: 'robotics',
    sensorType: 'motor',
    components: ['ESP32', 'DC Motor', 'L298N (IN1=25, IN2=26)'],
    starterCode: `int in1 = 25;
int in2 = 26;

void setup() {
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
}

void loop() {
  // Spin clockwise
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  delay(2000);

  // Spin counter-clockwise
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  delay(2000);
}`,
    solutionCode: `int in1 = 25;
int in2 = 26;

void setup() {
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
}

void loop() {
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  delay(2000);
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  delay(2000);
}`,
    rules: makeBasicRules({ requireVar: true }),
  },
  {
    id: 25,
    level: 14,
    levelTitle: 'Robotics',
    title: 'L298N Motor Driver',
    subtitle: 'Wire and test dual-channel H-bridge control for Left and Right wheels.',
    objective: 'Students configure all 4 L298N direction pins (IN1–IN4) on the ESP32.',
    explanation:
      'The L298N dual H-bridge drives two DC motors independently: Left Motor (IN1=25, IN2=26) and Right Motor (IN3=27, IN4=14).',
    xpReward: 180,
    category: 'robotics',
    sensorType: 'l298n',
    components: ['ESP32', 'L298N Motor Driver', '2× DC Motors + Wheels', 'Battery'],
    starterCode: `int in1 = 25, in2 = 26; // Left motor
int in3 = 27, in4 = 14; // Right motor

void setup() {
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
}

void loop() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
  delay(1500);
  digitalWrite(in1, LOW); digitalWrite(in2, LOW);
  digitalWrite(in3, LOW); digitalWrite(in4, LOW);
  delay(1000);
}`,
    solutionCode: `int in1 = 25, in2 = 26;
int in3 = 27, in4 = 14;

void setup() {
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
}

void loop() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
  delay(1500);
  digitalWrite(in1, LOW); digitalWrite(in2, LOW);
  digitalWrite(in3, LOW); digitalWrite(in4, LOW);
  delay(1000);
}`,
    rules: makeBasicRules({ requireVar: true }),
  },
  {
    id: 26,
    level: 14,
    levelTitle: 'Robotics',
    title: 'Forward Movement',
    subtitle: 'Write a reusable moveForward() function for your robot chassis.',
    objective: 'Students create a clean moveForward() function driving both wheels forward.',
    explanation:
      'Organizing motion into functions like moveForward() and stopRobot() makes robotics code clean and easy to expand.',
    xpReward: 180,
    category: 'robotics',
    sensorType: 'robot-move',
    components: ['ESP32', 'L298N', '2-Wheel Robot Chassis'],
    starterCode: `int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void moveForward() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
}

void stopRobot() {
  digitalWrite(in1, LOW); digitalWrite(in2, LOW);
  digitalWrite(in3, LOW); digitalWrite(in4, LOW);
}

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  moveForward();
  delay(2000);
  stopRobot();
  delay(1000);
}`,
    solutionCode: `int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void moveForward() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
}

void stopRobot() {
  digitalWrite(in1, LOW); digitalWrite(in2, LOW);
  digitalWrite(in3, LOW); digitalWrite(in4, LOW);
}

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  moveForward();
  delay(2000);
  stopRobot();
  delay(1000);
}`,
    rules: makeBasicRules({ requireVar: true }),
  },
  {
    id: 27,
    level: 14,
    levelTitle: 'Robotics',
    title: 'Backward Movement',
    subtitle: 'Add moveBackward() to reverse your robot safely.',
    objective: 'Students implement moveBackward() by inverting both motor channels.',
    explanation:
      'To reverse the robot, drive both Left and Right motors in reverse (IN1=LOW, IN2=HIGH, IN3=LOW, IN4=HIGH).',
    xpReward: 180,
    category: 'robotics',
    sensorType: 'robot-move',
    components: ['ESP32', 'L298N', 'Robot Chassis'],
    starterCode: `int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void moveBackward() {
  digitalWrite(in1, LOW); digitalWrite(in2, HIGH);
  digitalWrite(in3, LOW); digitalWrite(in4, HIGH);
}

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  moveBackward();
  delay(2000);
}`,
    solutionCode: `int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void moveBackward() {
  digitalWrite(in1, LOW); digitalWrite(in2, HIGH);
  digitalWrite(in3, LOW); digitalWrite(in4, HIGH);
}

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  moveBackward();
  delay(2000);
}`,
    rules: makeBasicRules({ requireVar: true }),
  },
  {
    id: 28,
    level: 14,
    levelTitle: 'Robotics',
    title: 'Turning Left & Right',
    subtitle: 'Implement differential steering with turnLeft() and turnRight().',
    objective: 'Students program differential turning by spinning wheels in opposite directions.',
    explanation:
      'To turn Right, spin the Left wheel forward and Right wheel backward. To turn Left, spin the Right wheel forward and Left wheel backward.',
    xpReward: 190,
    category: 'robotics',
    sensorType: 'robot-move',
    components: ['ESP32', 'L298N', 'Robot Chassis'],
    starterCode: `int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void turnRight() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);  digitalWrite(in4, HIGH);
}

void turnLeft() {
  digitalWrite(in1, LOW);  digitalWrite(in2, HIGH);
  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
}

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  turnRight();
  delay(800);
  turnLeft();
  delay(800);
}`,
    solutionCode: `int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void turnRight() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);  digitalWrite(in4, HIGH);
}

void turnLeft() {
  digitalWrite(in1, LOW);  digitalWrite(in2, HIGH);
  digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
}

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  turnRight();
  delay(800);
  turnLeft();
  delay(800);
}`,
    rules: makeBasicRules({ requireVar: true }),
  },
  {
    id: 29,
    level: 14,
    levelTitle: 'Robotics',
    title: 'Obstacle Avoiding Robot',
    subtitle: 'Combine HC-SR04 ultrasonic sensing with L298N motor control.',
    objective: 'Students program an autonomous robot that detects obstacles (< 25 cm) and turns away.',
    explanation:
      'Drive forward while the path is clear. When the ultrasonic sensor detects an obstacle closer than 25 cm, stop, reverse briefly, and turn right!',
    xpReward: 260,
    category: 'robotics',
    sensorType: 'robot-obstacle',
    components: ['ESP32', 'HC-SR04', 'L298N', '2× DC Motors', 'Chassis', 'Battery'],
    starterCode: `int trigPin = 5, echoPin = 18;
int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  float dist = pulseIn(echoPin, HIGH) * 0.034 / 2;

  if (dist < 25) {
    // Obstacle ahead: turn right
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, LOW);  digitalWrite(in4, HIGH);
    delay(500);
  } else {
    // Clear path: move forward
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
  }
}`,
    solutionCode: `int trigPin = 5, echoPin = 18;
int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  float dist = pulseIn(echoPin, HIGH) * 0.034 / 2;

  if (dist < 25) {
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, LOW);  digitalWrite(in4, HIGH);
    delay(500);
  } else {
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
  }
}`,
    rules: makeBasicRules({ requireInput: true, requireIfElse: true }),
  },
  {
    id: 30,
    level: 14,
    levelTitle: 'Robotics',
    title: 'Final Robotics Project',
    subtitle: 'Design, build, test, and upload your complete autonomous ESP32 robot!',
    objective: 'Students integrate sensors, status LEDs, and autonomous navigation into a capstone robotics project.',
    explanation:
      'Congratulations on reaching Session 30! Combine ultrasonic obstacle avoidance, LED status indicators, and Serial telemetry into your final autonomous robot.',
    xpReward: 350,
    badgeReward: 'robotics-builder',
    category: 'robotics',
    sensorType: 'robot-obstacle',
    components: ['ESP32', 'HC-SR04', 'L298N', '2× DC Motors', 'Status LEDs', 'Chassis', 'Battery'],
    starterCode: `int trigPin = 5, echoPin = 18, statusLed = 2;
int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT); pinMode(echoPin, INPUT);
  pinMode(statusLed, OUTPUT);
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  float dist = pulseIn(echoPin, HIGH) * 0.034 / 2;
  Serial.println(dist);

  if (dist < 25) {
    digitalWrite(statusLed, HIGH);
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, LOW);  digitalWrite(in4, HIGH);
    delay(500);
  } else {
    digitalWrite(statusLed, LOW);
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
  }
}`,
    solutionCode: `int trigPin = 5, echoPin = 18, statusLed = 2;
int in1 = 25, in2 = 26, in3 = 27, in4 = 14;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT); pinMode(echoPin, INPUT);
  pinMode(statusLed, OUTPUT);
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT); pinMode(in4, OUTPUT);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  float dist = pulseIn(echoPin, HIGH) * 0.034 / 2;
  Serial.println(dist);

  if (dist < 25) {
    digitalWrite(statusLed, HIGH);
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, LOW);  digitalWrite(in4, HIGH);
    delay(500);
  } else {
    digitalWrite(statusLed, LOW);
    digitalWrite(in1, HIGH); digitalWrite(in2, LOW);
    digitalWrite(in3, HIGH); digitalWrite(in4, LOW);
  }
}`,
    rules: makeBasicRules({ requireInput: true, requireIfElse: true, requireSerial: true }),
  },
];

export const LEVELS_SUMMARY = Array.from({ length: 14 }, (_, idx) => {
  const levelNum = idx + 1;
  const sessions = SESSIONS.filter((s) => s.level === levelNum);
  return {
    level: levelNum,
    title: sessions[0]?.levelTitle || `Level ${levelNum}`,
    sessions,
  };
});
