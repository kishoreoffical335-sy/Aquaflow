import ExcelJS from "exceljs";

export interface ExportRecord {
  recorded_at: string;
  device_name: string;
  device_uid: string;
  ph: number | null;
  turbidity_raw: number | null;
  turbidity_ntu: number | null;
  water_level_raw: number | null;
  water_level_percent: number | null;
  flow_pulses: number | null;
  flow_lpm: number | null;
  accumulated_volume_liters: number | null;
  dissolved_oxygen_mg_l: number | null;
  device_status: string;
}

/**
 * Generates a precision formatted Excel (.xlsx) workbook containing strictly real sensor readings.
 */
export async function generateTelemetryExcel(
  records: ExportRecord[],
  filterInfo: { startDate: string; endDate: string; deviceName?: string }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AquaFlow IoT Water Quality & Flow Monitoring System";
  workbook.lastModifiedBy = "Antigravity Telemetry Engine";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Water Quality & Flow Telemetry", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 5 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  // Title Row
  worksheet.mergeCells("A1:L1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "WATER QUALITY & FLOW MONITORING SYSTEM — TELEMETRY EXPORT";
  titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 28;

  // Metadata Row
  worksheet.mergeCells("A2:L2");
  const metaCell = worksheet.getCell("A2");
  metaCell.value = `Export Period: ${filterInfo.startDate} to ${filterInfo.endDate} | Generated: ${new Date().toUTCString()} | Records: ${records.length}`;
  metaCell.font = { name: "Segoe UI", size: 10, italic: true, color: { argb: "FF64748B" } };
  metaCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(2).height = 20;

  // Blank spacer row
  worksheet.getRow(3).height = 10;

  // Header Row 1: Column Names
  const headers = [
    "Date (UTC)",
    "Time (UTC)",
    "Device ID",
    "pH (UART2)",
    "Turbidity (ADC)",
    "Turbidity (NTU)",
    "Water Level (ADC)",
    "Water Level (%)",
    "Flow (Pulses)",
    "Flow (L/min)",
    "Total Volume (L)",
    "Calculated DO (mg/L)",
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 24;
  headerRow.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Header Row 2: Units Row
  const units = [
    "--",
    "--",
    "--",
    "pH (Measured)",
    "Raw ADC (GPIO32)",
    "NTU (Calibrated)",
    "Raw ADC (GPIO34)",
    "% (Calibrated)",
    "Pulses (GPIO27)",
    "L/min (Calibrated)",
    "Liters (Derived)",
    "mg/L (Calculated)",
  ];
  const unitRow = worksheet.getRow(5);
  unitRow.values = units;
  unitRow.height = 18;
  unitRow.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FFCBD5E1" } };
  unitRow.alignment = { vertical: "middle", horizontal: "center" };

  // Style Header & Unit cells
  for (let col = 1; col <= 12; col++) {
    const hCell = headerRow.getCell(col);
    hCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    hCell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "thin", color: { argb: "FF334155" } },
    };

    const uCell = unitRow.getCell(col);
    uCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" },
    };
    uCell.border = {
      bottom: { style: "medium", color: { argb: "FF0284C7" } },
    };
  }

  // Populate data rows or empty state
  if (records.length === 0) {
    worksheet.mergeCells("A6:L7");
    const emptyCell = worksheet.getCell("A6");
    emptyCell.value = "No sensor telemetry is available for the selected period.";
    emptyCell.font = { name: "Segoe UI", size: 12, italic: true, color: { argb: "FF94A3B8" } };
    emptyCell.alignment = { vertical: "middle", horizontal: "center" };
  } else {
    records.forEach((rec, idx) => {
      const rowNumber = 6 + idx;
      const row = worksheet.getRow(rowNumber);

      const recDate = new Date(rec.recorded_at);
      const dateStr = recDate.toISOString().split("T")[0];
      const timeStr = recDate.toISOString().split("T")[1].replace("Z", "");

      row.values = [
        dateStr,
        timeStr,
        rec.device_uid,
        rec.ph !== null ? Number(rec.ph.toFixed(2)) : "--",
        rec.turbidity_raw !== null ? rec.turbidity_raw : "--",
        rec.turbidity_ntu !== null ? Number(rec.turbidity_ntu.toFixed(2)) : "--",
        rec.water_level_raw !== null ? rec.water_level_raw : "--",
        rec.water_level_percent !== null ? Number(rec.water_level_percent.toFixed(1)) : "--",
        rec.flow_pulses !== null ? rec.flow_pulses : "--",
        rec.flow_lpm !== null ? Number(rec.flow_lpm.toFixed(2)) : "--",
        rec.accumulated_volume_liters !== null ? Number(rec.accumulated_volume_liters.toFixed(2)) : "--",
        rec.dissolved_oxygen_mg_l !== null ? Number(rec.dissolved_oxygen_mg_l.toFixed(2)) : "--",
      ];

      row.height = 20;
      row.font = { name: "Segoe UI", size: 10 };
      row.alignment = { vertical: "middle", horizontal: "center" };

      // Alternating row background
      if (idx % 2 === 1) {
        for (let col = 1; col <= 12; col++) {
          row.getCell(col).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }
      }

      for (let col = 1; col <= 12; col++) {
        row.getCell(col).border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      }
    });

    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 5 + records.length, column: 12 },
    };
  }

  // Set explicit column widths
  worksheet.columns = [
    { width: 14 }, // Date
    { width: 14 }, // Time
    { width: 18 }, // Device ID
    { width: 14 }, // pH
    { width: 16 }, // Turbidity Raw
    { width: 16 }, // Turbidity NTU
    { width: 16 }, // Water Level Raw
    { width: 16 }, // Water Level %
    { width: 14 }, // Flow Pulses
    { width: 16 }, // Flow LPM
    { width: 18 }, // Total Vol
    { width: 22 }, // Calculated DO
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
