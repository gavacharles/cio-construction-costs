"""Shared test helpers: tiny synthetic UBOS-style CIPI workbooks."""
from openpyxl import Workbook


def _write(path, sheet, header, rows, title_rows=1, label_col=0):
    wb = Workbook(); ws = wb.active; ws.title = sheet
    for _ in range(title_rows):
        ws.append(["UBOS CIPI"])
    ws.append(header if label_col == 0 else [None] + header)
    for name, vals in rows:
        ws.append(([name] + vals) if label_col == 0 else [None, name] + vals)
    wb.save(path)
