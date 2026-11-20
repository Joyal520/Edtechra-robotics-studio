export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BeginnerBadge {
  id: string;
  level: number;
  name: string;
  icon: string;
  description: string;
}

export interface BeginnerLevelDef {
  level: number;
  title: string;
  theme: string;
  icon: string;
  description: string;
  objectives: string[];
  badge: BeginnerBadge;
  stageStatus: 'ready' | 'coming-next';
  firmwareIds?: string[];
  quiz?: QuizQuestion[];
}

export const XP_RULES = {
  lesson: 20,
  quizPassed: 30,
  hardwareConnected: 25,
  firmwareUploaded: 40,
  projectCompleted: 50,
} as const;

export const BEGINNER_LEVELS: BeginnerLevelDef[] = [
  {
    level: 1,
    title: 'Meet the ESP32',
    theme: 'Welcome to the World of Robotics!',
    icon: '🤖',
    description:
      'Discover what an ESP32 microcontroller is, explore all 10 hardware parts on the board, and pass your first quiz.',
    objectives: [
      'Understand what ESP32, microcontrollers, robotics, and IoT are',
      'Identify all 10 major components on the ESP32 DevKit board',
      'Explore real projects you can build with ESP32',
      'Pass the 10-question Level 1 Quiz (80% or higher)',
    ],
    badge: {
      id: 'esp32-explorer',
      level: 1,
      name: 'ESP32 EXPLORER',
      icon: '🧭',
      description: 'Explored the ESP32 board and mastered Level 1 fundamentals.',
    },
    stageStatus: 'ready',
    quiz: [
      {
        id: 'l1q1',
        question: 'What is an ESP32?',
        options: [
          'A type of battery for toy cars',
          'A programmable microcontroller board with Wi-Fi and Bluetooth',
          'A computer screen for drawing circuits',
          'A plastic case for wires',
        ],
        correctIndex: 1,
        explanation:
          'ESP32 is a powerful microcontroller board that runs programs, controls electronics, and supports Wi-Fi and Bluetooth.',
      },
      {
        id: 'l1q2',
        question: 'What is a microcontroller?',
        options: [
          'A tiny computer on a single chip designed to control electronic devices',
          'A very small screwdriver',
          'A website for storing photos',
          'A power cable that charges phones',
        ],
        correctIndex: 0,
        explanation:
          'A microcontroller is a compact computer on a chip that reads inputs (like buttons/sensors) and controls outputs (like LEDs/motors).',
      },
      {
        id: 'l1q3',
        question: 'Which part is the "brain" of the ESP32 board?',
        options: [
          'The USB port',
          'The plastic pin headers',
          'The ESP-WROOM-32 microcontroller chip under the silver metal shield',
          'The red power LED',
        ],
        correctIndex: 2,
        explanation:
          'The ESP-WROOM-32 chip under the metal shield executes your instructions and makes all the decisions.',
      },
      {
        id: 'l1q4',
        question: 'What are GPIO pins used for?',
        options: [
          'Only for holding the board on a desk',
          'Connecting electronic components to send outputs or read inputs',
          'Cooling down the board with air',
          'Playing music directly from the pins',
        ],
        correctIndex: 1,
        explanation:
          'GPIO stands for General Purpose Input/Output — they connect LEDs, buttons, buzzers, sensors, and motors.',
      },
      {
        id: 'l1q5',
        question: 'What does GND mean on the ESP32?',
        options: [
          'Green Node Display',
          'Ground — the 0V negative return path of a circuit',
          'General Network Device',
          'Good New Data',
        ],
        correctIndex: 1,
        explanation:
          'GND stands for Ground (0V). Every electrical circuit needs a return path to GND so current can flow.',
      },
      {
        id: 'l1q6',
        question: 'What is the USB port on the ESP32 used for?',
        options: [
          'Only for decoration',
          'Supplying power and uploading programs from your computer',
          'Connecting directly to a TV antenna',
          'Measuring room temperature',
        ],
        correctIndex: 1,
        explanation:
          'The USB port both powers the ESP32 and lets your computer transfer programs to the board.',
      },
      {
        id: 'l1q7',
        question: 'What happens when you press the EN button on the ESP32?',
        options: [
          'It erases the board permanently',
          'It restarts (resets) the ESP32 and runs your program from the beginning',
          'It turns on Wi-Fi automatically',
          'It increases the battery voltage',
        ],
        correctIndex: 1,
        explanation:
          'EN (Enable) acts as the Reset button — pressing it restarts your ESP32 cleanly.',
      },
      {
        id: 'l1q8',
        question: 'What is the built-in Wi-Fi on the ESP32 used for?',
        options: [
          'Connecting wirelessly to networks and the internet for IoT projects',
          'Making the LED blink faster',
          'Powering the board without a cable',
          'Replacing the need for GND pins',
        ],
        correctIndex: 0,
        explanation:
          'Built-in Wi-Fi allows the ESP32 to send sensor data, receive commands, and power Internet of Things (IoT) devices.',
      },
      {
        id: 'l1q9',
        question: 'Can the ESP32 control real electronic components like LEDs, buzzers, and motors?',
        options: [
          'No, it can only show text on a computer',
          'Yes — it can control LEDs, buzzers, displays, relays, and motors',
          'Only if you connect it to a printer',
          'Only on weekends',
        ],
        correctIndex: 1,
        explanation:
          'Yes! Controlling real-world electronic components is the core purpose of a robotics microcontroller.',
      },
      {
        id: 'l1q10',
        question: 'Which of these is a real project you can build with an ESP32?',
        options: [
          'A smart traffic light or automatic plant watering system',
          'A wooden chair',
          'A paper notebook',
          'A glass water bottle',
        ],
        correctIndex: 0,
        explanation:
          'Traffic lights, smart lights, weather stations, automatic irrigation, and robots are all classic ESP32 projects.',
      },
    ],
  },
  {
    level: 2,
    title: 'Connect Your ESP32',
    theme: 'Establish Your First Connection',
    icon: '🔌',
    description:
      'Learn how USB data cables and serial communication work, then physically connect your real ESP32 to your computer.',
    objectives: [
      'Understand USB ports and data cables',
      'Physically connect your ESP32 board to your computer',
      'Verify a real USB connection in the browser',
      'Pass the 5-question Level 2 Quiz (80% or higher)',
    ],
    badge: {
      id: 'hardware-connector',
      level: 2,
      name: 'HARDWARE CONNECTOR',
      icon: '🔗',
      description: 'Established a genuine USB serial connection with an ESP32 board.',
    },
    stageStatus: 'ready',
    quiz: [
      {
        id: 'l2q1',
        question: 'How does your computer send programs to the ESP32?',
        options: [
          'Through the USB data cable',
          'By holding the board near the screen',
          'Through the headphone jack',
          'By pressing the spacebar',
        ],
        correctIndex: 0,
        explanation: 'Your computer sends programs to the ESP32 through a USB data cable.',
      },
      {
        id: 'l2q2',
        question: 'Why do some phone USB cables not work with the ESP32?',
        options: [
          'They only carry power and have no data wires',
          'They are the wrong color',
          'They are too long',
          'They only work on TVs',
        ],
        correctIndex: 0,
        explanation: 'Charge-only cables power the board, but cannot transfer data or programs.',
      },
      {
        id: 'l2q3',
        question: 'Which browsers work best for connecting your ESP32 over USB?',
        options: [
          'Google Chrome or Microsoft Edge on a computer',
          'A calculator app',
          'A music player',
          'A PDF viewer',
        ],
        correctIndex: 0,
        explanation: 'Chrome and Edge on a computer support connecting directly to USB boards.',
      },
      {
        id: 'l2q4',
        question: 'What lights up on the ESP32 when it receives power from USB?',
        options: [
          'The small red Power (PWR) LED',
          'The Wi-Fi antenna',
          'The plastic pins',
          'The computer keyboard',
        ],
        correctIndex: 0,
        explanation: 'The small red PWR LED turns on as soon as your ESP32 has power.',
      },
      {
        id: 'l2q5',
        question: 'What should you do when the browser popup asks you to pick a port?',
        options: [
          'Click your ESP32 port and then click Connect',
          'Unplug the USB cable right away',
          'Close the browser',
          'Press Cancel',
        ],
        correctIndex: 0,
        explanation: 'Select the ESP32 port in the list so the Connect button turns active.',
      },
    ],
  },
  {
    level: 3,
    title: 'Blink Your ESP32',
    theme: 'My First Program',
    icon: '💡',
    description:
      'Learn how programs control the built-in LED, explore the Blink code, and upload it to your ESP32!',
    objectives: [
      'Understand programs, LEDs, ON/OFF, and delays',
      'Explore each line of the Blink program',
      'Upload Slow, Normal, and Fast Blink to your ESP32',
      'Pass the 5-question Level 3 Quiz (80% or higher)',
    ],
    badge: {
      id: 'first-programmer',
      level: 3,
      name: 'FIRST PROGRAMMER',
      icon: '🚀',
      description: 'Uploaded your first precompiled Blink program and made the ESP32 LED blink.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-3-blink', 'level-3-blink-slow', 'level-3-blink-fast'],
    quiz: [
      {
        id: 'l3q1',
        question: 'What is a program?',
        options: [
          'A list of step-by-step instructions for the ESP32',
          'A type of USB cable',
          'A plastic breadboard',
          'A battery charger',
        ],
        correctIndex: 0,
        explanation: 'A program tells the ESP32 what to do, step by step.',
      },
      {
        id: 'l3q2',
        question: 'What does HIGH mean when controlling an LED?',
        options: [
          'Turn the LED ON',
          'Turn the LED OFF',
          'Unplug the board',
          'Restart the computer',
        ],
        correctIndex: 0,
        explanation: 'Sending HIGH turns the LED ON, and sending LOW turns it OFF.',
      },
      {
        id: 'l3q3',
        question: 'What does LOW mean when controlling an LED?',
        options: [
          'Turn the LED OFF',
          'Make the LED brighter',
          'Change the LED color',
          'Turn on Wi-Fi',
        ],
        correctIndex: 0,
        explanation: 'LOW turns the LED OFF.',
      },
      {
        id: 'l3q4',
        question: 'What does delay(1000); make the ESP32 do?',
        options: [
          'Wait for 1 second',
          'Wait for 1 hour',
          'Turn off the USB port',
          'Delete the program',
        ],
        correctIndex: 0,
        explanation: '1,000 milliseconds equals 1 second, so delay(1000) pauses for 1 second.',
      },
      {
        id: 'l3q5',
        question: 'Why does the LED keep blinking again and again?',
        options: [
          'Because the code is inside loop(), which repeats forever',
          'Because you keep clicking the mouse',
          'Because the USB cable is loose',
          'Because the computer screen is on',
        ],
        correctIndex: 0,
        explanation: 'Everything inside loop() repeats over and over automatically!',
      },
    ],
  },
  {
    level: 4,
    title: 'Control an External LED',
    theme: 'Light Up the World',
    icon: '⚡',
    description:
      'Build your first breadboard circuit with an external LED and 330Ω resistor, then upload precompiled external LED firmware.',
    objectives: [
      'Understand breadboard rows, columns, and internal connections',
      'Identify LED anode (+ long leg) and cathode (- short leg)',
      'Explain why a 330Ω resistor protects an LED',
      'Wire and test Slow, Medium, and Fast external LED firmware',
    ],
    badge: {
      id: 'circuit-builder',
      level: 4,
      name: 'CIRCUIT BUILDER',
      icon: '🔧',
      description: 'Built and powered your first external LED breadboard circuit.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 5,
    title: 'SOS Signal',
    theme: 'Become a Signal Engineer',
    icon: '📡',
    description:
      'Learn Morse code timing sequences (3 short, 3 long, 3 short) and broadcast an SOS distress beacon with your LED.',
    objectives: [
      'Understand short vs. long signal timing',
      'Visualize the S-O-S Morse pattern',
      'Upload and test precompiled SOS firmware',
    ],
    badge: {
      id: 'signal-master',
      level: 5,
      name: 'SIGNAL MASTER',
      icon: '📶',
      description: 'Engineered a timed Morse code SOS signal on ESP32.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 6,
    title: 'Traffic Light System',
    theme: 'Become a Traffic Engineer',
    icon: '🚦',
    description:
      'Wire Red, Yellow, and Green LEDs with 330Ω resistors and run a realistic traffic light + pedestrian crossing sequence.',
    objectives: [
      'Control 3 independent GPIO outputs in sequence',
      'Build a clean 3-LED breadboard circuit',
      'Experiment with Red → Green → Yellow timing',
    ],
    badge: {
      id: 'traffic-engineer',
      level: 6,
      name: 'TRAFFIC ENGINEER',
      icon: '🚦',
      description: 'Built and tested a multi-LED traffic light controller.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 7,
    title: 'Button Controller',
    theme: 'Control Your Robot',
    icon: '🔘',
    description:
      'Add a push button input to turn an LED ON when pressed, then upgrade to toggle-on / toggle-off control.',
    objectives: [
      'Understand digital inputs vs. digital outputs',
      'Wire a push button to an ESP32 GPIO pin',
      'Test momentary and toggle button firmware',
    ],
    badge: {
      id: 'controller-engineer',
      level: 7,
      name: 'CONTROLLER ENGINEER',
      icon: '🎮',
      description: 'Controlled hardware outputs using physical push-button inputs.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 8,
    title: 'Reaction Speed Game',
    theme: 'Test Your Reflexes',
    icon: '⏱️',
    description:
      'Build an interactive reflex game that waits randomly, lights the LED, and measures your reaction time in milliseconds.',
    objectives: [
      'Combine random timing, LEDs, and button inputs',
      'Read live reaction time measurements (ms) from ESP32',
      'Compete to beat your personal best reflex score',
    ],
    badge: {
      id: 'reflex-champion',
      level: 8,
      name: 'REFLEX CHAMPION',
      icon: '⚡',
      description: 'Built and played the ESP32 millisecond reaction speed game.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 9,
    title: 'Electronic Buzzer',
    theme: 'Make Some Noise',
    icon: '🔔',
    description:
      'Connect a buzzer to build an alarm, doorbell, countdown timer, and warning signal.',
    objectives: [
      'Understand sound frequency and digital tone output',
      'Wire a piezo buzzer safely to the ESP32',
      'Test alarm, doorbell, and countdown patterns',
    ],
    badge: {
      id: 'sound-engineer',
      level: 9,
      name: 'SOUND ENGINEER',
      icon: '🔊',
      description: 'Generated electronic sound patterns and alarms with a buzzer.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 10,
    title: 'Electronic Music',
    theme: 'Become an Electronic Musician',
    icon: '🎵',
    description:
      'Compose melodies, game sound effects, and celebration tunes using musical frequencies and timing.',
    objectives: [
      'Map musical notes to sound frequencies (Hz)',
      'Sequence melodies and game sound effects',
      'Upload and play electronic music on your ESP32',
    ],
    badge: {
      id: 'music-creator',
      level: 10,
      name: 'MUSIC CREATOR',
      icon: '🎶',
      description: 'Programmed musical notes and celebration melodies on ESP32.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 11,
    title: 'LED Patterns',
    theme: 'Light Artist',
    icon: '✨',
    description:
      'Create Running LEDs, Knight Rider sweeps, Police strobes, Alternating lights, and Wave effects.',
    objectives: [
      'Coordinate multi-LED visual patterns and sequences',
      'Explore Knight Rider, Police, and Wave effects',
      'Understand timing loops across multiple outputs',
    ],
    badge: {
      id: 'light-artist',
      level: 11,
      name: 'LIGHT ARTIST',
      icon: '🌈',
      description: 'Built multi-LED visual patterns and light animations.',
    },
    stageStatus: 'coming-next',
  },
  {
    level: 12,
    title: 'DJ Light',
    theme: 'Build Your Own Mini Light Show',
    icon: '🎉',
    description:
      'Build the ultimate capstone mini light show with 5 party modes: Disco, LED Chase, Alternating, Police, and Party Mode!',
    objectives: [
      'Assemble the complete multi-LED DJ Light breadboard build',
      'Upload precompiled DJ Light firmware with 5 modes',
      'Design your own custom LED sequence',
    ],
    badge: {
      id: 'dj-light-engineer',
      level: 12,
      name: 'DJ LIGHT ENGINEER',
      icon: '🏆',
      description: 'Completed the 12-level journey and built the ESP32 DJ Light Show!',
    },
    stageStatus: 'coming-next',
  },
];
