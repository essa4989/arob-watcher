import * as XLSX from 'xlsx';

type LogRow = Record<string, unknown>;
export interface AllLogs {
  catheter: LogRow[];
  medication: LogRow[];
  check: LogRow[];
  fluid: LogRow[];
  care: LogRow[];
}

const SHEET_NAMES: Record<keyof AllLogs, string> = {
  catheter: 'القسطرة',
  medication: 'الأدوية',
  check: 'الفحوصات',
  fluid: 'السوائل',
  care: 'العناية',
};

export function exportToExcel(data: AllLogs, filename = 'aroob-report.xlsx') {
  const wb = XLSX.utils.book_new();
  (Object.keys(SHEET_NAMES) as Array<keyof AllLogs>).forEach((key) => {
    const rows = data[key] ?? [];
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, SHEET_NAMES[key]);
  });
  XLSX.writeFile(wb, filename);
}

/** jsPDF does not render Arabic reliably — the legacy system's documented
 *  workaround (print-to-PDF via the browser) is kept here for the same reason. */
export function exportToPdf(data: AllLogs, title: string) {
  const win = window.open('', '_blank');
  if (!win) return;

  const section = (label: string, rows: LogRow[]) => {
    if (rows.length === 0) return '';
    const cols = Object.keys(rows[0]);
    return `
      <h2>${label}</h2>
      <table>
        <thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows
          .map((r) => `<tr>${cols.map((c) => `<td>${String(r[c] ?? '')}</td>`).join('')}</tr>`)
          .join('')}</tbody>
      </table>`;
  };

  win.document.write(`
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet" />
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 24px; }
          h1 { color: #d43f70; }
          h2 { color: #b12d5a; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #f2d9e3; padding: 6px 10px; font-size: 12px; text-align: right; }
          th { background: #ffe4ee; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${section(SHEET_NAMES.catheter, data.catheter)}
        ${section(SHEET_NAMES.medication, data.medication)}
        ${section(SHEET_NAMES.check, data.check)}
        ${section(SHEET_NAMES.fluid, data.fluid)}
        ${section(SHEET_NAMES.care, data.care)}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
