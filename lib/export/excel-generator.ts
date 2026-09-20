import ExcelJS from "exceljs";

export interface ExportRecord {
  recorded_at: string;
  device_name: string;
  device_uid: string;
  ph: number | null;
  turbidity: number | null;
  flow_rate: number | null;
  total_flow: number | null;
  dissolved_oxygen: number | null;
  device_status: string;
}

/**
 * Generates an Precision formatted Excel (.xlsx) workbook containing strictly real sensor readings.
 */
export async function generateTelemetryExcel(records: ExportRecord[], filterInfo: { startDate: string; endDate: string; deviceName?: string }): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IoT Water Quality & Flow Monitoring System";
  workbook.lastModifiedBy = "Antigravity Telemetry Engine";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Water Quality & Flow Telemetry", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 5 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  // Title Row
  worksheet.mergeCells("A1:J1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "WATER QUALITY & FLOW MONITORING SYSTEM -- TELEMETRY EXPORT";
  titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 28;

  // Metadata Row
  worksheet.mergeCells("A2:J2");
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
    "Device Name",
    "Device UID",
    "pH",
    "Turbidity",
    "Flow Rate",
    "Total Flow",
    "Calculated DO",
    "Water Quality Status",
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 24;
  headerRow.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Header Row 2: Units Row
  const units = [
    "--",
    "--",
    "--",
    "--",
    "pH",
    "NTU",
    "L/min",
    "Liters",
    "mg/L (Calculated)",
    "Assessment",
  ];
  const unitRow = worksheet.getRow(5);
  unitRow.values = units;
  unitRow.height = 18;
  unitRow.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FFCBD5E1" } };
  unitRow.alignment = { vertical: "middle", horizontal: "center" };

  // Style Header & Unit cells
  for (let col = 1; col <= 10; col++) {
    const hCell = headerRow.getCell(col);
    hCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // Ocean / Slate dark background
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
    worksheet.mergeCells("A6:J7");
    const emptyCell = worksheet.getCell("A6");
    emptyCell.value = "No sensor data is available for the selected period.";
    emptyCell.font = { name: "Segoe UI", size: 12, italic: true, color: { argb: "FF94A3B8" } };
    emptyCell.alignment = { vertical: "middle", horizontal: "center" };
  } else {
    records.forEach((rec, idx) => {
      const rowNumber = 6 + idx;
      const row = worksheet.getRow(rowNumber);
      
      const recDate = new Date(rec.recorded_at);
      const dateStr = recDate.toISOString().split("T")[0];
      const timeStr = recDate.toISOString().split("T")[1].replace("Z", "");

      // Water quality evaluation
      let wqStatus = "Normal";
      if ((rec.ph !== null && (rec.ph < 6.5 || rec.ph > 8.5)) || (rec.turbidity !== null && rec.turbidity > 5)) {
        wqStatus = "Warning";
      }
      if ((rec.ph !== null && (rec.ph < 5.5 || rec.ph > 9.5)) || (rec.turbidity !== null && rec.turbidity > 15)) {
        wqStatus = "Critical";
      }

      row.values = [
        dateStr,
        timeStr,
        rec.device_name,
        rec.device_uid,
        rec.ph !== null ? Number(rec.ph.toFixed(2)) : "--",
        rec.turbidity !== null ? Number(rec.turbidity.toFixed(2)) : "--",
        rec.flow_rate !== null ? Number(rec.flow_rate.toFixed(2)) : "--",
        rec.total_flow !== null ? Number(rec.total_flow.toFixed(2)) : "--",
        rec.dissolved_oxygen !== null ? Number(rec.dissolved_oxygen.toFixed(2)) : "--",
        wqStatus,
      ];

      row.height = 20;
      row.font = { name: "Segoe UI", size: 10 };
      row.alignment = { vertical: "middle", horizontal: "center" };

      // Alternating row background for clean readability
      if (idx % 2 === 1) {
        for (let col = 1; col <= 10; col++) {
          row.getCell(col).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }
      }

      // Border styling
      for (let col = 1; col <= 10; col++) {
        row.getCell(col).border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      }
    });

    // Enable autofilter on columns
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 5 + records.length, column: 10 },
    };
  }

  // Set explicit column widths
  worksheet.columns = [
    { width: 14 }, // Date
    { width: 14 }, // Time
    { width: 22 }, // Device Name
    { width: 18 }, // Device UID
    { width: 12 }, // pH
    { width: 16 }, // Turbidity
    { width: 16 }, // Flow Rate
    { width: 16 }, // Total Flow
    { width: 22 }, // Calculated DO
    { width: 22 }, // Status
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
