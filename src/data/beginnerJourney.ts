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
    description: 'Wire an external LED and 330Ω resistor on a breadboard, then upload Slow, Medium, or Fast Blink.',
    objectives: [
      'Understand breadboard rows and columns',
      'Identify LED long leg (+) and short leg (-)',
      'Use a 330Ω resistor to protect the LED',
      'Upload and test external LED firmware',
    ],
    badge: {
      id: 'circuit-builder',
      level: 4,
      name: 'CIRCUIT BUILDER',
      icon: '🔧',
      description: 'Built and powered your first external LED breadboard circuit.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-4-slow', 'level-4-medium', 'level-4-fast'],
    quiz: [
      {
        id: 'l4q1',
        question: 'Why do we put a 330Ω resistor in series with an LED?',
        options: [
          'To limit current and protect the LED from burning out',
          'To change the LED color',
          'To make the breadboard heavier',
          'To turn on Wi-Fi',
        ],
        correctIndex: 0,
        explanation: 'A resistor slows down electrical current so the LED stays safe and bright.',
      },
      {
        id: 'l4q2',
        question: 'Which leg of an LED is the positive (+) side (Anode)?',
        options: ['The longer leg', 'The shorter leg', 'Both legs are equal', 'Neither leg'],
        correctIndex: 0,
        explanation: 'The longer leg is the positive Anode (+); the shorter leg is the negative Cathode (-).',
      },
      {
        id: 'l4q3',
        question: 'Where does the short leg (Cathode -) of the LED connect?',
        options: ['To GND (Ground)', 'To the USB cable', 'To the Wi-Fi antenna', 'To the EN button'],
        correctIndex: 0,
        explanation: 'The negative leg connects back to GND to complete the circuit loop.',
      },
      {
        id: 'l4q4',
        question: 'What is a breadboard used for?',
        options: [
          'Building and testing circuits without soldering',
          'Baking bread',
          'Charging a laptop',
          'Playing videos',
        ],
        correctIndex: 0,
        explanation: 'Breadboards let you plug in components and wires easily and reuse them.',
      },
      {
        id: 'l4q5',
        question: 'Which ESP32 pin powers our external LED in Level 4?',
        options: ['GPIO 23', 'GPIO 99', 'EN', 'BOOT'],
        correctIndex: 0,
        explanation: 'We wire GPIO 23 → 330Ω resistor → LED (+) → LED (-) → GND.',
      },
    ],
  },
  {
    level: 5,
    title: 'SOS Signal',
    theme: 'Become a Signal Engineer',
    icon: '📡',
    description: 'Broadcast a Morse code S-O-S beacon: 3 short flashes, 3 long flashes, 3 short flashes.',
    objectives: [
      'Understand short vs. long signal timing',
      'Visualize the S-O-S Morse pattern',
      'Upload and test SOS firmware on your ESP32',
    ],
    badge: {
      id: 'signal-master',
      level: 5,
      name: 'SIGNAL MASTER',
      icon: '📶',
      description: 'Engineered a timed Morse code SOS signal on ESP32.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-5-sos', 'level-5-sos-fast'],
    quiz: [
      {
        id: 'l5q1',
        question: 'What is the Morse code pattern for SOS?',
        options: [
          '3 short, 3 long, 3 short flashes',
          '1 long flash only',
          '10 short flashes',
          'LED stays off',
        ],
        correctIndex: 0,
        explanation: 'S = 3 short dots (· · ·), O = 3 long dashes (— — —), S = 3 short dots (· · ·).',
      },
      {
        id: 'l5q2',
        question: 'How does the ESP32 make a "long" flash instead of a "short" flash?',
        options: [
          'It waits longer with delay() while the LED is ON',
          'It uses a bigger USB cable',
          'It turns off the board',
          'It changes the LED color',
        ],
        correctIndex: 0,
        explanation: 'A longer delay() keeps the LED turned ON for more time.',
      },
      {
        id: 'l5q3',
        question: 'What does SOS stand for in emergency signaling?',
        options: [
          'A universal distress signal asking for help',
          'Switch Off Screen',
          'Super Old Sensor',
          'Start On Sunday',
        ],
        correctIndex: 0,
        explanation: 'SOS is the international Morse distress signal because it is easy to recognize.',
      },
      {
        id: 'l5q4',
        question: 'Why do we add a pause between each SOS repeat?',
        options: [
          'So people can clearly tell where one SOS ends and the next begins',
          'To cool the USB cable',
          'Because the LED gets tired',
          'To erase the code',
        ],
        correctIndex: 0,
        explanation: 'Clear spacing makes Morse signals easy to read.',
      },
      {
        id: 'l5q5',
        question: 'Can you change how fast the SOS signal blinks?',
        options: [
          'Yes, by changing the delay times in the program',
          'No, LEDs only blink at one fixed speed',
          'Only by shaking the board',
          'Only in the dark',
        ],
        correctIndex: 0,
        explanation: 'Shorter delays produce a faster SOS beacon!',
      },
    ],
  },
  {
    level: 6,
    title: 'Traffic Light System',
    theme: 'Become a Traffic Engineer',
    icon: '🚦',
    description: 'Wire Red, Yellow, and Green LEDs and run a real traffic light + pedestrian crossing sequence.',
    objectives: [
      'Control 3 separate LED outputs (GPIO 23, 22, 21)',
      'Build a 3-LED traffic light breadboard circuit',
      'Test standard and pedestrian crossing modes',
    ],
    badge: {
      id: 'traffic-engineer',
      level: 6,
      name: 'TRAFFIC ENGINEER',
      icon: '🚦',
      description: 'Built and tested a multi-LED traffic light controller.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-6-traffic', 'level-6-pedestrian'],
    quiz: [
      {
        id: 'l6q1',
        question: 'How many resistors do we need for 3 separate LEDs?',
        options: ['3 resistors (one for each LED)', '0 resistors', '10 resistors', '100 resistors'],
        correctIndex: 0,
        explanation: 'Each LED should have its own 330Ω resistor for safe, even brightness.',
      },
      {
        id: 'l6q2',
        question: 'What is the traffic light sequence in Level 6?',
        options: [
          'Red → Green → Yellow → Red',
          'All lights stay off',
          'Yellow forever',
          'Blue → Purple → White',
        ],
        correctIndex: 0,
        explanation: 'Cars stop on Red, go on Green, slow down on Yellow, then stop on Red again.',
      },
      {
        id: 'l6q3',
        question: 'Which 3 GPIO pins control our Red, Yellow, and Green LEDs?',
        options: ['GPIO 23, 22, and 21', 'GPIO 1, 2, and 3', 'EN, BOOT, and USB', 'Only GND'],
        correctIndex: 0,
        explanation: 'Red connects to GPIO 23, Yellow to GPIO 22, and Green to GPIO 21.',
      },
      {
        id: 'l6q4',
        question: 'Why does the Pedestrian Crossing mode flash Green before Yellow?',
        options: [
          'To warn drivers and walkers that the light is about to change',
          'Because the battery is empty',
          'To turn off the ESP32',
          'To make noise',
        ],
        correctIndex: 0,
        explanation: 'Flashing Green gives people a clear warning before Yellow and Red.',
      },
      {
        id: 'l6q5',
        question: 'Can all 3 LEDs share the same GND rail on the breadboard?',
        options: [
          'Yes — every LED cathode (-) can return to the same GND',
          'No, each needs its own separate ESP32',
          'No, GND is only for buttons',
          'Only Red uses GND',
        ],
        correctIndex: 0,
        explanation: 'Sharing a common GND rail keeps breadboard wiring clean and simple.',
      },
    ],
  },
  {
    level: 7,
    title: 'Button Controller',
    theme: 'Control Your Robot',
    icon: '🔘',
    description: 'Use a physical push button to control an LED — both Press-and-Hold and Toggle On/Off modes.',
    objectives: [
      'Understand digital inputs vs. outputs',
      'Wire a push button to GPIO 18 and GND',
      'Test Press-to-Light and Toggle Switch firmware',
    ],
    badge: {
      id: 'controller-engineer',
      level: 7,
      name: 'CONTROLLER ENGINEER',
      icon: '🎮',
      description: 'Controlled hardware outputs using physical push-button inputs.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-7-momentary', 'level-7-toggle'],
    quiz: [
      {
        id: 'l7q1',
        question: 'Is a push button an INPUT or an OUTPUT?',
        options: ['INPUT (it sends a signal into the ESP32)', 'OUTPUT', 'A battery', 'A screen'],
        correctIndex: 0,
        explanation: 'Buttons and sensors are inputs; LEDs and buzzers are outputs.',
      },
      {
        id: 'l7q2',
        question: 'In Press & Hold mode, what happens when you release the button?',
        options: ['The LED turns OFF', 'The LED explodes', 'The ESP32 unplugs', 'The LED changes color'],
        correctIndex: 0,
        explanation: 'In momentary mode, the LED stays ON only while you hold the button.',
      },
      {
        id: 'l7q3',
        question: 'How does Toggle Switch mode work?',
        options: [
          'Press once to turn ON, press again to turn OFF',
          'Hold the button for 10 minutes',
          'Press 50 times',
          'The button does nothing',
        ],
        correctIndex: 0,
        explanation: 'Toggle mode works just like a room light switch or TV power button!',
      },
      {
        id: 'l7q4',
        question: 'Which GPIO pin reads our push button in Level 7?',
        options: ['GPIO 18', 'GPIO 99', '3.3V', 'USB'],
        correctIndex: 0,
        explanation: 'We wire the push button between GPIO 18 and GND.',
      },
      {
        id: 'l7q5',
        question: 'What happens inside a push button when you press it?',
        options: [
          'It closes the electrical connection so current can flow',
          'It turns into a resistor',
          'It connects to Wi-Fi',
          'It plays music',
        ],
        correctIndex: 0,
        explanation: 'Pressing the button closes the internal switch contacts.',
      },
    ],
  },
  {
    level: 8,
    title: 'Reaction Speed Game',
    theme: 'Test Your Reflexes',
    icon: '⏱️',
    description: 'Wait for the LED to light up, hit the button as fast as you can, and see your score in milliseconds!',
    objectives: [
      'Combine random delays, LEDs, and button inputs',
      'Play the reflex game in the browser and on ESP32',
      'Measure reaction speed in milliseconds (ms)',
    ],
    badge: {
      id: 'reflex-champion',
      level: 8,
      name: 'REFLEX CHAMPION',
      icon: '⚡',
      description: 'Built and played the ESP32 millisecond reaction speed game.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-8-reaction'],
    quiz: [
      {
        id: 'l8q1',
        question: 'What unit do we use to measure your reaction time in this game?',
        options: ['Milliseconds (ms)', 'Kilometers', 'Liters', 'Degrees'],
        correctIndex: 0,
        explanation: 'Human reflexes take around 200–350 milliseconds (thousandths of a second).',
      },
      {
        id: 'l8q2',
        question: 'Why does the game wait a RANDOM amount of time before turning the LED ON?',
        options: [
          'So players cannot guess when the light will appear',
          'Because the ESP32 forgot how to count',
          'To save battery',
          'To make the LED dimmer',
        ],
        correctIndex: 0,
        explanation: 'A random wait keeps the game fair and tests true reflexes!',
      },
      {
        id: 'l8q3',
        question: 'Which score is FASTER: 220 ms or 450 ms?',
        options: ['220 ms (smaller time means faster reflex)', '450 ms', 'They are the same', 'Neither'],
        correctIndex: 0,
        explanation: 'Fewer milliseconds means you reacted much faster!',
      },
      {
        id: 'l8q4',
        question: 'When should you press the button in the Reaction Speed Game?',
        options: [
          'As soon as the LED turns ON',
          'Before the LED turns ON',
          'After unplugging the board',
          'Never',
        ],
        correctIndex: 0,
        explanation: 'Wait until the LED lights up, then press the button immediately!',
      },
      {
        id: 'l8q5',
        question: 'Where can you read your ESP32 hardware reaction time on the computer?',
        options: ['In the Serial Monitor', 'In a photo viewer', 'In a calendar', 'On the USB plug'],
        correctIndex: 0,
        explanation: 'The ESP32 prints your exact reaction time in milliseconds over USB Serial.',
      },
    ],
  },
  {
    level: 9,
    title: 'Electronic Buzzer',
    theme: 'Make Some Noise',
    icon: '🔔',
    description: 'Connect a buzzer to GPIO 25 and create real alarms, doorbells, and warning signals.',
    objectives: [
      'Learn how buzzers turn electricity into sound',
      'Wire a piezo buzzer to GPIO 25 and GND',
      'Upload Alarm Siren and Ding-Dong Doorbell firmware',
    ],
    badge: {
      id: 'sound-engineer',
      level: 9,
      name: 'SOUND ENGINEER',
      icon: '🔊',
      description: 'Generated electronic sound patterns and alarms with a buzzer.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-9-alarm', 'level-9-doorbell'],
    quiz: [
      {
        id: 'l9q1',
        question: 'Is a buzzer an INPUT or an OUTPUT component?',
        options: ['OUTPUT (it produces sound)', 'INPUT', 'A battery', 'A wire'],
        correctIndex: 0,
        explanation: 'A buzzer is an output component that creates audible tones.',
      },
      {
        id: 'l9q2',
        question: 'What changes whether a buzzer sound is high-pitched or low-pitched?',
        options: ['Its frequency (how fast it vibrates)', 'Its color', 'Its weight', 'The room temperature'],
        correctIndex: 0,
        explanation: 'Higher frequency makes a higher pitch; lower frequency makes a deeper tone.',
      },
      {
        id: 'l9q3',
        question: 'Which ESP32 pin drives our buzzer in Level 9?',
        options: ['GPIO 25', 'EN', 'BOOT', '3.3V only'],
        correctIndex: 0,
        explanation: 'Connect Buzzer (+) to GPIO 25 and Buzzer (-) to GND.',
      },
      {
        id: 'l9q4',
        question: 'Which everyday device uses a buzzer or sound alert?',
        options: ['Microwave timer, alarm clock, or doorbell', 'A wooden spoon', 'A pillow', 'A notebook'],
        correctIndex: 0,
        explanation: 'Alarms, doorbells, timers, and crosswalks all use electronic sounders.',
      },
      {
        id: 'l9q5',
        question: 'How does an alarm siren sound different from a doorbell?',
        options: [
          'It repeats fast alternating tones to grab attention',
          'It makes no sound at all',
          'It only uses LEDs',
          'It disconnects USB',
        ],
        correctIndex: 0,
        explanation: 'Different rhythms and pitches create distinct sound effects.',
      },
    ],
  },
  {
    level: 10,
    title: 'Electronic Music',
    theme: 'Become an Electronic Musician',
    icon: '🎵',
    description: 'Play musical notes, scales, and retro game celebration tunes on your ESP32 buzzer.',
    objectives: [
      'Explore musical notes and pitches (C to C)',
      'Play melodies in the browser mini-piano',
      'Upload Melody and Game Sounds firmware',
    ],
    badge: {
      id: 'music-creator',
      level: 10,
      name: 'MUSIC CREATOR',
      icon: '🎶',
      description: 'Programmed musical notes and celebration melodies on ESP32.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-10-melody', 'level-10-game'],
    quiz: [
      {
        id: 'l10q1',
        question: 'How does an ESP32 play different musical notes like C, D, E, and G?',
        options: [
          'By sending different sound frequencies (Hz) to the buzzer',
          'By changing the USB cable',
          'By pressing the EN button',
          'By turning off the LED',
        ],
        correctIndex: 0,
        explanation: 'Every musical note corresponds to a specific vibration frequency in Hertz (Hz).',
      },
      {
        id: 'l10q2',
        question: 'What makes a melody sound like a real song instead of one flat beep?',
        options: [
          'Combining different notes with timing (note lengths and pauses)',
          'Playing one frequency forever',
          'Unplugging the buzzer',
          'Using only GND',
        ],
        correctIndex: 0,
        explanation: 'Pitch + rhythm (timing) creates melodies and game sound effects!',
      },
      {
        id: 'l10q3',
        question: 'Does a higher number like 880 Hz sound HIGHER or LOWER than 262 Hz?',
        options: ['Higher pitched', 'Lower pitched', 'Silent', 'The exact same'],
        correctIndex: 0,
        explanation: 'Higher frequency (Hz) always produces a higher musical pitch.',
      },
      {
        id: 'l10q4',
        question: 'What kind of fun effects can we make with fast rising notes?',
        options: ['Video game coin, power-up, and victory sounds', 'A broken wire', 'A resistor', 'A breadboard'],
        correctIndex: 0,
        explanation: 'Classic arcade games use quick sequences of tones for coins and level-ups!',
      },
      {
        id: 'l10q5',
        question: 'Which pin does our buzzer stay connected to in Level 10?',
        options: ['GPIO 25 (same circuit as Level 9!)', 'GPIO 99', 'EN', 'BOOT'],
        correctIndex: 0,
        explanation: 'You can reuse the exact same Level 9 buzzer wiring on GPIO 25 and GND.',
      },
    ],
  },
  {
    level: 11,
    title: 'LED Patterns',
    theme: 'Light Artist',
    icon: '✨',
    description: 'Wire 4 LEDs and create Running Lights, Knight Rider sweeps, Police strobes, and Wave effects.',
    objectives: [
      'Wire 4 LEDs on GPIOs 23, 22, 21, and 19',
      'Preview Knight Rider, Police, and Wave patterns',
      'Upload multi-LED pattern firmware to ESP32',
    ],
    badge: {
      id: 'light-artist',
      level: 11,
      name: 'LIGHT ARTIST',
      icon: '🌈',
      description: 'Built multi-LED visual patterns and light animations.',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-11-knight', 'level-11-police'],
    quiz: [
      {
        id: 'l11q1',
        question: 'How does a "Knight Rider" running light animation work?',
        options: [
          'LEDs turn ON one after another across the row, then bounce back',
          'All LEDs stay off',
          'Only 1 LED turns on forever',
          'It uses a buzzer instead of LEDs',
        ],
        correctIndex: 0,
        explanation: 'Lighting one LED at a time in sequence creates the illusion of motion!',
      },
      {
        id: 'l11q2',
        question: 'Which 4 ESP32 pins control our 4-LED light bar?',
        options: ['GPIO 23, 22, 21, and 19', 'Only GPIO 2', 'EN and BOOT', '3.3V and 5V'],
        correctIndex: 0,
        explanation: 'Each of the 4 LEDs connects through its own 330Ω resistor to GPIOs 23, 22, 21, and 19.',
      },
      {
        id: 'l11q3',
        question: 'How do we make an LED pattern look smoother and faster?',
        options: [
          'Use shorter delay times between steps',
          'Remove all resistors',
          'Unplug the ESP32',
          'Use 10-second delays',
        ],
        correctIndex: 0,
        explanation: 'Short delays (like 100–150 ms) make light animations smooth and lively.',
      },
      {
        id: 'l11q4',
        question: 'How does a Police Strobe pattern work with 4 LEDs?',
        options: [
          'Left pair flashes rapidly, then right pair flashes rapidly',
          'All LEDs stay off',
          'Each LED stays on for 1 minute',
          'It only works with 1 LED',
        ],
        correctIndex: 0,
        explanation: 'Alternating fast double-flashes between two pairs creates the classic strobe effect.',
      },
      {
        id: 'l11q5',
        question: 'How many 330Ω resistors do we use for a 4-LED light bar?',
        options: ['4 resistors (one per LED)', '0 resistors', '1 resistor total', '20 resistors'],
        correctIndex: 0,
        explanation: 'Giving every LED its own 330Ω resistor keeps them safe and equally bright.',
      },
    ],
  },
  {
    level: 12,
    title: 'DJ Light',
    theme: 'Build Your Own Mini Light Show',
    icon: '🎉',
    description: 'Build the grand finale 5-mode DJ Light Show (Disco, Chase, Alternating, Police, Party) + design your own sequence!',
    objectives: [
      'Use the 4-LED breadboard light show circuit',
      'Experiment with all 5 DJ Light Show modes + custom sequencer',
      'Upload DJ Light firmware and earn the capstone badge',
    ],
    badge: {
      id: 'dj-light-engineer',
      level: 12,
      name: 'DJ LIGHT ENGINEER',
      icon: '🏆',
      description: 'Completed all 12 levels and built the ESP32 DJ Light Show!',
    },
    stageStatus: 'ready',
    firmwareIds: ['level-12-dj', 'level-12-disco'],
    quiz: [
      {
        id: 'l12q1',
        question: 'How many lighting modes are inside our DJ Light Show project?',
        options: ['5 modes (Disco, Chase, Alternating, Police, Party)', 'Only 1 mode', '0 modes', '100 modes'],
        correctIndex: 0,
        explanation: 'The DJ Light Show combines 5 energetic light patterns in one project!',
      },
      {
        id: 'l12q2',
        question: 'What makes Disco mode look exciting and unpredictable?',
        options: [
          'Randomly turning different LEDs ON and OFF to a fast beat',
          'Keeping every LED off',
          'Waiting 10 seconds between flashes',
          'Unplugging the USB cable',
        ],
        correctIndex: 0,
        explanation: 'Random LED selection at a fast tempo creates a fun disco sparkle.',
      },
      {
        id: 'l12q3',
        question: 'In Alternating mode, which LEDs light up together?',
        options: [
          'LEDs 1 & 3 light up, then LEDs 2 & 4 light up',
          'All LEDs stay off forever',
          'Only LED 1 blinks',
          'None of them',
        ],
        correctIndex: 0,
        explanation: 'Swapping between odd and even LEDs creates a rhythmic alternating beat.',
      },
      {
        id: 'l12q4',
        question: 'What have you learned by completing Levels 1 through 12?',
        options: [
          'ESP32 hardware, USB uploading, breadboards, LEDs, buttons, buzzers, and patterns',
          'Only how to plug in a mouse',
          'Nothing about electronics',
          'Only how to turn off a monitor',
        ],
        correctIndex: 0,
        explanation: 'You now have real hands-on skills to build your own robotics & IoT inventions!',
      },
      {
        id: 'l12q5',
        question: 'Where can you write and upload your own custom C++ code next?',
        options: ['In Code Lab and Arduino IDE right inside EdTechra Studio', 'In a photo album', 'Nowhere', 'In a calendar'],
        correctIndex: 0,
        explanation: 'You are ready to graduate to Code Lab and Arduino IDE to write your own custom programs!',
      },
    ],
  },
];
