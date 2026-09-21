/**
 * CENTRAL HARDWARE CONFIGURATION — SINGLE SOURCE OF TRUTH
 * 
 * Authoritative Hardware Pin Map for physical ESP32 water-quality monitoring prototype.
 * Every UI component, API definition, diagnostic tool, and firmware generator must use this configuration.
 */

export interface HardwarePinMapping {
  component: string;
  name: string;
  type: "measured" | "output" | "derived" | "calculated";
  interface: "UART2" | "ADC" | "INTERRUPT" | "I2C" | "DIGITAL" | "DERIVED" | "CALCULATED";
  pin?: number;
  rxPin?: number;
  txPin?: number;
  baudRate?: number;
  sda?: number;
  scl?: number;
  i2cAddress?: string;
  unit: string;
  operatingRange?: string;
  description: string;
  packetFormat?: string;
  source?: string;
  calibrationRequired: boolean;
  calibrationNote?: string;
}

export const hardwareConfig = {
  ph: {
    component: "pH Glass Electrode + 4-in-1 UART Module",
    name: "pH",
    type: "measured",
    interface: "UART2",
    rxPin: 16,
    txPin: 17,
    baudRate: 9600,
    unit: "pH",
    operatingRange: "0.00 — 14.00 pH",
    description: "4-in-1 UART sensor module communicating via HardwareSerial2. ESP32 parses the PH field from packet: 'PH:7.31, W:1, L:74, T:59,'.",
    packetFormat: "PH:7.31, W:1, L:74, T:59,",
    calibrationRequired: true,
    calibrationNote: "pH standard buffer calibration support (4.01, 7.00, 10.01)",
  },

  turbidity: {
    component: "Optical Turbidity Sensor",
    name: "Turbidity",
    type: "measured",
    interface: "ADC",
    pin: 32,
    unit: "Raw ADC / NTU",
    operatingRange: "0 — 4095 ADC (0 — 4000 NTU)",
    description: "Analog light-scattering sensor connected to ESP32 ADC1 GPIO32. Initially stores raw ADC value. NTU output requires physical calibration.",
    calibrationRequired: true,
    calibrationNote: "Calibration Required for NTU conversion. Returns null if uncalibrated.",
  },

  waterLevel: {
    component: "Water Level Sensor",
    name: "Water Level",
    type: "measured",
    interface: "ADC",
    pin: 34,
    unit: "Raw ADC / %",
    operatingRange: "0 — 4095 ADC (0 — 100%)",
    description: "Analog water level sensor connected to ESP32 ADC1 GPIO34. Initially stores raw ADC value. Percentage output requires physical calibration.",
    calibrationRequired: true,
    calibrationNote: "Calibration Required for percentage conversion. Returns null if uncalibrated.",
  },

  flow: {
    component: "Hall-Effect Flow Meter",
    name: "Flow Rate",
    type: "measured",
    interface: "INTERRUPT",
    pin: 27,
    unit: "Pulses / L/min",
    operatingRange: "1.0 — 80.0 L/min",
    description: "Hall-effect pulse counting via GPIO27 hardware interrupt. Stores raw pulse counts. L/min flow rate requires physical calibration coefficient.",
    calibrationRequired: true,
    calibrationNote: "Calibration Required for L/min conversion. Returns null if uncalibrated.",
  },

  lcd: {
    component: "16x2 I2C Liquid Crystal Display",
    name: "LCD Display",
    type: "output",
    interface: "I2C",
    sda: 21,
    scl: 22,
    i2cAddress: "0x27",
    unit: "Display",
    description: "16x2 character LCD with PCF8574 I2C backpack. Connected to default ESP32 I2C bus pins.",
    calibrationRequired: false,
  },

  buzzer: {
    component: "Active / Passive Piezo Buzzer",
    name: "Incident Buzzer",
    type: "output",
    interface: "DIGITAL",
    pin: 25,
    unit: "Digital High/Low",
    description: "Audible alarm buzzer triggered on critical threshold breach or system faults.",
    calibrationRequired: false,
  },

  waterVolume: {
    component: "Accumulated Water Volume",
    name: "Accumulated Volume",
    type: "derived",
    interface: "DERIVED",
    unit: "Liters",
    operatingRange: "0 — 9,999,999 L",
    source: "flow_pulse_integration",
    description: "Derived mathematically by integrating calibrated flow volume over discrete measurement intervals.",
    calibrationRequired: true,
    calibrationNote: "Depends on valid flow calibration coefficient.",
  },

  dissolvedOxygen: {
    component: "Calculated Dissolved Oxygen",
    name: "Dissolved Oxygen",
    type: "calculated",
    interface: "CALCULATED",
    unit: "mg/L",
    operatingRange: "0.0 — 20.0 mg/L",
    source: "backend_aeration_model",
    description: "Calculated from backend aeration dynamics model. No physical sensor exists. Returns null or 'Calculation unavailable' when inputs are insufficient.",
    calibrationRequired: false,
    calibrationNote: "Strictly labeled as CALCULATED, never MEASURED.",
  },
} as const;

export type HardwareConfig = typeof hardwareConfig;

/**
 * Expected Pin Definition for Diagnostic Verification
 */
export const EXPECTED_HARDWARE_PINS = [
  { pin: 16, label: "GPIO16", component: "pH UART RX", interface: "UART2 RX", status: "ASSIGNED" },
  { pin: 17, label: "GPIO17", component: "pH UART TX", interface: "UART2 TX", status: "ASSIGNED" },
  { pin: 21, label: "GPIO21", component: "LCD SDA", interface: "I2C SDA", status: "ASSIGNED" },
  { pin: 22, label: "GPIO22", component: "LCD SCL", interface: "I2C SCL", status: "ASSIGNED" },
  { pin: 25, label: "GPIO25", component: "Buzzer", interface: "Digital Output", status: "ASSIGNED" },
  { pin: 27, label: "GPIO27", component: "Flow Meter Pulse", interface: "Hardware Interrupt", status: "ASSIGNED" },
  { pin: 32, label: "GPIO32", component: "Turbidity Sensor", interface: "Analog ADC1", status: "ASSIGNED" },
  { pin: 34, label: "GPIO34", component: "Water Level Sensor", interface: "Analog ADC1", status: "ASSIGNED" },
  { pin: 35, label: "GPIO35", component: "Unassigned / Reserved", interface: "None", status: "UNUSED" },
] as const;

/**
 * Validates a given pin configuration against expected hardware architecture
 */
export function verifyHardwareIntegrity(configuredMap: Record<string, any>) {
  const issues: string[] = [];

  if (configuredMap.ph?.rxPin !== 16 || configuredMap.ph?.txPin !== 17) {
    issues.push(`pH sensor must be configured on UART2 (RX: GPIO16, TX: GPIO17). Found RX:${configuredMap.ph?.rxPin}, TX:${configuredMap.ph?.txPin}`);
  }

  if (configuredMap.turbidity?.pin !== 32) {
    issues.push(`Turbidity sensor must be configured on ADC GPIO32. Found GPIO${configuredMap.turbidity?.pin}. GPIO35 is incorrect.`);
  }

  if (configuredMap.waterLevel?.pin !== 34) {
    issues.push(`Water Level sensor must be configured on ADC GPIO34. Found GPIO${configuredMap.waterLevel?.pin}.`);
  }

  if (configuredMap.flow?.pin !== 27) {
    issues.push(`Flow sensor must be configured on Interrupt GPIO27. Found GPIO${configuredMap.flow?.pin}.`);
  }

  if (configuredMap.lcd?.sda !== 21 || configuredMap.lcd?.scl !== 22) {
    issues.push(`LCD must be configured on I2C (SDA: GPIO21, SCL: GPIO22).`);
  }

  if (configuredMap.buzzer?.pin !== 25) {
    issues.push(`Buzzer must be configured on Digital GPIO25.`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    timestamp: new Date().toISOString(),
  };
}
