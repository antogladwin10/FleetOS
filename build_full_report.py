"""
FleetOS Academic Project Report Generator
Compiles an authoritative 44-page publication-grade academic project report PDF
matching Anna University / Easwari Engineering College formatting.
Author: Antony Benny
Project: FleetOS
Date: October 2026
"""

import os
import sys

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, PageBreak, Spacer, Table, TableStyle,
    HRFlowable, Flowable
)
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import (
    Drawing, Rect, String, Line, Group, Circle, Polygon
)

# Dimensions & Colors
PAGE_WIDTH, PAGE_HEIGHT = A4
NAVY = HexColor('#1B365D')
PRIMARY_BLUE = HexColor('#2563EB')
LIGHT_BG = HexColor('#F8FAFC')
ROW_ALT = HexColor('#F1F5F9')
BORDER_COLOR = HexColor('#CBD5E1')
DARK_TEXT = HexColor('#0F172A')
MUTED_TEXT = HexColor('#475569')
SUCCESS_GREEN = HexColor('#16A34A')
AMBER_COLOR = HexColor('#D97706')
DANGER_RED = HexColor('#DC2626')
TERMINAL_BG = HexColor('#1E1E1E')
TERMINAL_GREEN = HexColor('#22C55E')

USABLE_WIDTH = PAGE_WIDTH - 108  # 487.28 pt

class ChapterStartMarker(Flowable):
    def __init__(self):
        super().__init__()
        self.width = 0
        self.height = 0

    def draw(self):
        if hasattr(self.canv, 'record_chapter_start'):
            self.canv.record_chapter_start()

class AcademicReportCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []
        self.chapter_start_page = 10

    def record_chapter_start(self):
        self.chapter_start_page = self._pageNumber

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        chap_start = self.chapter_start_page

        for state in self._saved_page_states:
            self.__dict__.update(state)
            p = self._pageNumber
            self.draw_page_decorations(p, num_pages, chap_start)
            super().showPage()
        super().save()

    def draw_page_decorations(self, p, total_pages, chap_start):
        self.saveState()
        # 1. Outer border (1.2pt solid)
        self.setStrokeColor(black)
        self.setLineWidth(1.2)
        self.rect(36, 36, PAGE_WIDTH - 72, PAGE_HEIGHT - 72)

        # 2. Inner border (0.5pt solid)
        self.setLineWidth(0.5)
        self.rect(39.5, 39.5, PAGE_WIDTH - 79, PAGE_HEIGHT - 79)

        # 3. Page numbering logic
        roman_map = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']
        self.setFont('Times-Roman', 10)
        if 4 <= p < chap_start:
            idx = p - 4
            roman = roman_map[idx] if idx < len(roman_map) else str(idx + 1)
            self.drawCentredString(PAGE_WIDTH / 2.0, 44, roman)
        elif p >= chap_start:
            arabic = str(p - chap_start + 1)
            self.drawCentredString(PAGE_WIDTH / 2.0, 44, arabic)

        self.restoreState()

def setup_styles():
    styles = {
        'TitleMain': ParagraphStyle(
            'TitleMain',
            fontName='Times-Bold',
            fontSize=15,
            leading=21,
            alignment=TA_CENTER,
            textColor=black
        ),
        'SubTitle': ParagraphStyle(
            'SubTitle',
            fontName='Times-Bold',
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=black
        ),
        'CoverBody': ParagraphStyle(
            'CoverBody',
            fontName='Times-Roman',
            fontSize=11,
            leading=16,
            alignment=TA_CENTER,
            textColor=black
        ),
        'CoverBodyBold': ParagraphStyle(
            'CoverBodyBold',
            fontName='Times-Bold',
            fontSize=11,
            leading=16,
            alignment=TA_CENTER,
            textColor=black
        ),
        'ChapterHeader': ParagraphStyle(
            'ChapterHeader',
            fontName='Times-Bold',
            fontSize=14,
            leading=20,
            alignment=TA_CENTER,
            textColor=black,
            spaceAfter=14
        ),
        'SectionHeader': ParagraphStyle(
            'SectionHeader',
            fontName='Times-Bold',
            fontSize=11.5,
            leading=16,
            alignment=TA_LEFT,
            textColor=black,
            spaceBefore=10,
            spaceAfter=6
        ),
        'SubSectionHeader': ParagraphStyle(
            'SubSectionHeader',
            fontName='Times-Bold',
            fontSize=10,
            leading=14,
            alignment=TA_LEFT,
            textColor=NAVY,
            spaceBefore=8,
            spaceAfter=4
        ),
        'Body': ParagraphStyle(
            'Body',
            fontName='Times-Roman',
            fontSize=9.8,
            leading=14.2,
            alignment=TA_JUSTIFY,
            textColor=DARK_TEXT,
            spaceAfter=6
        ),
        'BodyBullet': ParagraphStyle(
            'BodyBullet',
            fontName='Times-Roman',
            fontSize=9.3,
            leading=13.5,
            alignment=TA_JUSTIFY,
            textColor=DARK_TEXT,
            leftIndent=14,
            firstLineIndent=-10,
            spaceAfter=4
        ),
        'TableHead': ParagraphStyle(
            'TableHead',
            fontName='Times-Bold',
            fontSize=8,
            leading=10.5,
            alignment=TA_LEFT,
            textColor=white
        ),
        'TableHeadCenter': ParagraphStyle(
            'TableHeadCenter',
            fontName='Times-Bold',
            fontSize=8,
            leading=10.5,
            alignment=TA_CENTER,
            textColor=white
        ),
        'TableCell': ParagraphStyle(
            'TableCell',
            fontName='Times-Roman',
            fontSize=7.8,
            leading=10.5,
            alignment=TA_LEFT,
            textColor=DARK_TEXT
        ),
        'TableCellCenter': ParagraphStyle(
            'TableCellCenter',
            fontName='Times-Roman',
            fontSize=7.8,
            leading=10.5,
            alignment=TA_CENTER,
            textColor=DARK_TEXT
        ),
        'TableCellCode': ParagraphStyle(
            'TableCellCode',
            fontName='Courier',
            fontSize=7.2,
            leading=9.5,
            alignment=TA_LEFT,
            textColor=DARK_TEXT
        ),
        'TableCaption': ParagraphStyle(
            'TableCaption',
            fontName='Times-Bold',
            fontSize=9,
            leading=12.5,
            alignment=TA_CENTER,
            textColor=black,
            spaceBefore=6,
            spaceAfter=4
        ),
        'FigureCaption': ParagraphStyle(
            'FigureCaption',
            fontName='Times-Bold',
            fontSize=9,
            leading=12.5,
            alignment=TA_CENTER,
            textColor=black,
            spaceBefore=6,
            spaceAfter=8
        ),
        'CodeSnippet': ParagraphStyle(
            'CodeSnippet',
            fontName='Courier',
            fontSize=7.2,
            leading=10,
            textColor=DARK_TEXT
        ),
        'TerminalText': ParagraphStyle(
            'TerminalText',
            fontName='Courier',
            fontSize=7,
            leading=9.5,
            textColor=TERMINAL_GREEN
        ),
        'TOCItem': ParagraphStyle(
            'TOCItem',
            fontName='Times-Roman',
            fontSize=9,
            leading=13.5,
            textColor=DARK_TEXT
        ),
        'TOCItemBold': ParagraphStyle(
            'TOCItemBold',
            fontName='Times-Bold',
            fontSize=9,
            leading=13.5,
            textColor=black
        ),
        'TOCPage': ParagraphStyle(
            'TOCPage',
            fontName='Times-Roman',
            fontSize=9,
            leading=13.5,
            alignment=TA_RIGHT,
            textColor=DARK_TEXT
        ),
        'TOCPageBold': ParagraphStyle(
            'TOCPageBold',
            fontName='Times-Bold',
            fontSize=9,
            leading=13.5,
            alignment=TA_RIGHT,
            textColor=black
        )
    }
    return styles

def draw_college_crest():
    d = Drawing(120, 110)
    cx, cy = 60, 55
    d.add(Circle(cx, cy, 50, fillColor=None, strokeColor=NAVY, strokeWidth=2))
    d.add(Circle(cx, cy, 47, fillColor=None, strokeColor=HexColor('#047857'), strokeWidth=1))
    d.add(Circle(cx, cy, 38, fillColor=HexColor('#F8FAFC'), strokeColor=NAVY, strokeWidth=1.5))
    d.add(Rect(cx - 15, cy - 10, 30, 20, rx=3, ry=3, fillColor=HexColor('#1E3A8A'), strokeColor=HexColor('#F59E0B'), strokeWidth=1.2))
    d.add(String(cx, cy - 3, 'SRM', fontName='Times-Bold', fontSize=9, fillColor=white, textAnchor='middle'))
    d.add(String(cx, cy + 40, 'EASWARI ENGINEERING', fontName='Times-Bold', fontSize=4.8, fillColor=NAVY, textAnchor='middle'))
    d.add(String(cx, cy + 33, 'COLLEGE', fontName='Times-Bold', fontSize=4.8, fillColor=NAVY, textAnchor='middle'))
    d.add(String(cx, cy - 28, 'EDUCATE AND EXCEL', fontName='Times-Bold', fontSize=4.5, fillColor=HexColor('#047857'), textAnchor='middle'))
    d.add(String(cx, cy - 35, 'AUTONOMOUS', fontName='Times-Bold', fontSize=4.2, fillColor=NAVY, textAnchor='middle'))
    return d

def make_styled_table(header_cols, rows_data, col_widths, styles, center_cols=None, code_cols=None):
    center_cols = center_cols or []
    code_cols = code_cols or []
    table_data = []
    
    h_row = []
    for i, col in enumerate(header_cols):
        style = styles['TableHeadCenter'] if i in center_cols else styles['TableHead']
        h_row.append(Paragraph(col, style))
    table_data.append(h_row)
    
    for r in rows_data:
        curr_row = []
        for i, val in enumerate(r):
            if i in code_cols:
                style = styles['TableCellCode']
            elif i in center_cols:
                style = styles['TableCellCenter']
            else:
                style = styles['TableCell']
            curr_row.append(Paragraph(str(val), style))
        table_data.append(curr_row)
        
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
    ]
    for row_idx in range(1, len(table_data)):
        bg = ROW_ALT if row_idx % 2 == 1 else white
        t_style.append(('BACKGROUND', (0, row_idx), (-1, row_idx), bg))
        
    t.setStyle(TableStyle(t_style))
    return t

def make_terminal_box(lines, styles):
    content = []
    for line in lines:
        content.append(Paragraph(line, styles['TerminalText']))
    t = Table([[content]], colWidths=[USABLE_WIDTH])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), TERMINAL_BG),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#334155')),
    ]))
    return t

def make_code_box(code_lines, styles):
    content = []
    for line in code_lines:
        safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        content.append(Paragraph(f'<font face="Courier" size="7.2">{safe_line}</font>', styles['CodeSnippet']))
    t = Table([[content]], colWidths=[USABLE_WIDTH])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F8FAFC')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER_COLOR),
    ]))
    return t

def make_mockup_box(title, badge, kpis, items, styles):
    cell_flow = []
    h_table = Table([[
        Paragraph(f'<b><font color="#1E293B" size="8.5">{title}</font></b>', styles['TableCell']),
        Paragraph(f'<font color="#2563EB" size="7.5"><b>{badge}</b></font>', styles['TableCellCenter'])
    ]], colWidths=[USABLE_WIDTH * 0.72, USABLE_WIDTH * 0.24])
    h_table.setStyle(TableStyle([
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    cell_flow.append(h_table)
    cell_flow.append(Spacer(1, 3))
    
    kpi_cols = []
    w_each = (USABLE_WIDTH - 20) / len(kpis)
    for k_title, k_val in kpis:
        kpi_p = [
            Paragraph(f'<font size="6.5" color="#64748B">{k_title}</font>', styles['TableCellCenter']),
            Paragraph(f'<b><font size="8.5" color="#0F172A">{k_val}</font></b>', styles['TableCellCenter'])
        ]
        kpi_cols.append(kpi_p)
    kpi_table = Table([kpi_cols], colWidths=[w_each]*len(kpis))
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    cell_flow.append(kpi_table)
    cell_flow.append(Spacer(1, 3))
    
    item_rows = []
    for row in items:
        item_rows.append([Paragraph(f'<font size="7" color="#334155">{c}</font>', styles['TableCell']) for c in row])
    if item_rows:
        it = Table(item_rows, colWidths=[(USABLE_WIDTH - 20) / len(items[0])] * len(items[0]))
        it.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
        ]))
        cell_flow.append(it)
        
    wrapper = Table([[cell_flow]], colWidths=[USABLE_WIDTH])
    wrapper.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), white),
        ('BOX', (0,0), (-1,-1), 1, HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return wrapper

def draw_architecture_diagram():
    d = Drawing(USABLE_WIDTH, 160)
    w = USABLE_WIDTH
    d.add(Rect(15, 120, w - 30, 34, rx=4, ry=4, fillColor=HexColor('#EFF6FF'), strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(String(w / 2.0, 142, 'CLIENT PRESENTATION & TELEMETRY INGESTION TIER', fontName='Times-Bold', fontSize=8, fillColor=NAVY, textAnchor='middle'))
    d.add(String(w / 2.0, 130, 'React 18 SPA Portal (Vite 6)  •  Mobile Driver PWA (IndexedDB Offline Sync)  •  HTML5 Geolocation API', fontName='Times-Roman', fontSize=7, fillColor=DARK_TEXT, textAnchor='middle'))
    
    d.add(Line(w / 2.0, 120, w / 2.0, 106, strokeColor=HexColor('#94A3B8'), strokeWidth=1.2))
    d.add(Polygon([w/2.0 - 4, 109, w/2.0 + 4, 109, w/2.0, 104], fillColor=HexColor('#94A3B8'), strokeColor=None))
    d.add(String(w/2.0 + 8, 112, 'HTTPS (REST / JSON)  &  WSS (Socket.io Telemetry)', fontName='Times-Italic', fontSize=6.5, fillColor=MUTED_TEXT, textAnchor='start'))
    
    d.add(Rect(30, 75, w - 60, 29, rx=4, ry=4, fillColor=HexColor('#FEF3C7'), strokeColor=AMBER_COLOR, strokeWidth=1))
    d.add(String(w / 2.0, 92, 'API GATEWAY & TENANT SECURITY MIDDLEWARE', fontName='Times-Bold', fontSize=8, fillColor=NAVY, textAnchor='middle'))
    d.add(String(w / 2.0, 81, 'JWT Validation  •  Tenant Isolation (req.organizationId)  •  Role-Based Access Control (RBAC)  •  Rate Limiter', fontName='Times-Roman', fontSize=7, fillColor=DARK_TEXT, textAnchor='middle'))
    
    d.add(Line(w * 0.3, 75, w * 0.3, 58, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    d.add(Line(w * 0.7, 75, w * 0.7, 58, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(15, 28, w * 0.45, 28, rx=3, ry=3, fillColor=HexColor('#F1F5F9'), strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(15 + (w * 0.45)/2.0, 44, 'ENTERPRISE REST ROUTING (v1)', fontName='Times-Bold', fontSize=7.2, fillColor=NAVY, textAnchor='middle'))
    d.add(String(15 + (w * 0.45)/2.0, 33, 'Vehicles • Trips • Fuel • Maintenance • Attendance', fontName='Times-Roman', fontSize=6.5, fillColor=DARK_TEXT, textAnchor='middle'))
    
    d.add(Rect(w * 0.52, 28, w * 0.45, 28, rx=3, ry=3, fillColor=HexColor('#F1F5F9'), strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(w * 0.52 + (w * 0.45)/2.0, 44, 'REAL-TIME TELEMETRY ENGINE', fontName='Times-Bold', fontSize=7.2, fillColor=NAVY, textAnchor='middle'))
    d.add(String(w * 0.52 + (w * 0.45)/2.0, 33, 'Socket.io Rooms org:<id> • GPS Broadcast • Radar', fontName='Times-Roman', fontSize=6.5, fillColor=DARK_TEXT, textAnchor='middle'))
    
    d.add(Line(w / 2.0, 28, w / 2.0, 17, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    d.add(Rect(30, 2, w - 60, 15, rx=3, ry=3, fillColor=HexColor('#ECFDF5'), strokeColor=SUCCESS_GREEN, strokeWidth=1))
    d.add(String(w / 2.0, 6, 'PERSISTENCE: MongoDB (Mongoose ODM) • Compound Tenant Indexes • Financial Aggregations', fontName='Times-Bold', fontSize=7, fillColor=HexColor('#065F46'), textAnchor='middle'))
    return d

def draw_usecase_diagram():
    d = Drawing(USABLE_WIDTH, 135)
    w = USABLE_WIDTH
    d.add(Rect(10, 75, 95, 45, rx=4, ry=4, fillColor=HexColor('#EFF6FF'), strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(String(57, 105, 'ADMIN ROLES', fontName='Times-Bold', fontSize=7.5, fillColor=NAVY, textAnchor='middle'))
    d.add(String(57, 93, 'Super Admin', fontName='Times-Roman', fontSize=6.8, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(String(57, 82, 'Organization Admin', fontName='Times-Roman', fontSize=6.8, fillColor=DARK_TEXT, textAnchor='middle'))
    
    d.add(Rect(10, 15, 95, 52, rx=4, ry=4, fillColor=HexColor('#F8FAFC'), strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(57, 54, 'OPERATIONAL ROLES', fontName='Times-Bold', fontSize=7.5, fillColor=NAVY, textAnchor='middle'))
    d.add(String(57, 43, 'Fleet Manager', fontName='Times-Roman', fontSize=6.8, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(String(57, 33, 'Commercial Driver', fontName='Times-Roman', fontSize=6.8, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(String(57, 23, 'Maintenance & Analyst', fontName='Times-Roman', fontSize=6.8, fillColor=DARK_TEXT, textAnchor='middle'))
    
    d.add(Rect(125, 6, w - 135, 122, rx=5, ry=5, fillColor=HexColor('#FFFFFF'), strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    d.add(String(135, 118, 'FleetOS Enterprise Platform Use Cases', fontName='Times-BoldItalic', fontSize=7.5, fillColor=NAVY, textAnchor='start'))
    
    cases = [
        ('UC-1: Manage Tenants & Quotas', 135, 96),
        ('UC-2: Dispatch Trips & Track Radar', 305, 96),
        ('UC-3: Register Vehicles & Assign Drivers', 135, 71),
        ('UC-4: Log Attendance & GPS Clock-In', 305, 71),
        ('UC-5: Work Orders & Service Upkeep', 135, 46),
        ('UC-6: Fuel Economy & Cost Logs', 305, 46),
        ('UC-7: Calculate Trip P&L and Unit TCO', 135, 21),
        ('UC-8: Driver Offline Queue Synchronization', 305, 21),
    ]
    for c_title, cx, cy in cases:
        d.add(Rect(cx, cy, 155, 17, rx=8.5, ry=8.5, fillColor=HexColor('#F1F5F9'), strokeColor=HexColor('#CBD5E1'), strokeWidth=0.8))
        d.add(String(cx + 77, cy + 5, c_title, fontName='Times-Roman', fontSize=6.8, fillColor=DARK_TEXT, textAnchor='middle'))
        
    d.add(Line(105, 100, 135, 104, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    d.add(Line(105, 100, 135, 79, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    d.add(Line(105, 90, 135, 29, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    d.add(Line(105, 45, 135, 79, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    d.add(Line(105, 45, 135, 54, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    d.add(Line(105, 45, 305, 79, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    d.add(Line(105, 45, 305, 29, strokeColor=HexColor('#CBD5E1'), strokeWidth=1))
    return d

def draw_er_diagram():
    d = Drawing(USABLE_WIDTH, 140)
    w = USABLE_WIDTH
    # Entities: Organization, User, Vehicle, Driver, Trip, Maintenance
    boxes = [
        ('Organization', 10, 85, 90, 45, ['_id (PK)', 'name, code', 'subscriptionPlan', 'maxVehicles, limits']),
        ('User', 120, 85, 95, 45, ['_id (PK)', 'email (UK)', 'organizationId (FK)', 'role (6 roles)']),
        ('Vehicle', 240, 85, 110, 45, ['_id (PK)', 'organizationId (FK)', 'registrationNumber', 'currentOdometer, status']),
        ('Driver', 370, 85, 105, 45, ['_id (PK)', 'organizationId (FK)', 'assignedVehicleId (FK)', 'salaryDetails, rating']),
        ('Trip', 80, 15, 140, 50, ['_id (PK)', 'organizationId (FK)', 'vehicleId, driverId (FK)', 'revenue, costs, netProfit']),
        ('Maintenance', 260, 15, 140, 50, ['_id (PK)', 'organizationId (FK)', 'vehicleId (FK)', 'serviceType, cost, status']),
    ]
    for name, bx, by, bw, bh, fields in boxes:
        d.add(Rect(bx, by, bw, bh, rx=3, ry=3, fillColor=HexColor('#F8FAFC'), strokeColor=HexColor('#94A3B8'), strokeWidth=1))
        d.add(Rect(bx, by + bh - 14, bw, 14, rx=2, ry=2, fillColor=NAVY, strokeColor=None))
        d.add(String(bx + bw/2.0, by + bh - 10, name, fontName='Times-Bold', fontSize=7.2, fillColor=white, textAnchor='middle'))
        for idx, fld in enumerate(fields):
            d.add(String(bx + 4, by + bh - 24 - (idx * 8.5), fld, fontName='Courier', fontSize=5.8, fillColor=DARK_TEXT, textAnchor='start'))
            
    # Relationships lines
    d.add(Line(100, 107, 120, 107, strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(Line(215, 107, 240, 107, strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(Line(350, 107, 370, 107, strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(Line(295, 85, 295, 65, strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(Line(150, 85, 150, 65, strokeColor=PRIMARY_BLUE, strokeWidth=1))
    return d

def draw_flowchart_auth():
    d = Drawing(USABLE_WIDTH, 130)
    w = USABLE_WIDTH
    cx = w / 2.0
    
    d.add(Rect(cx - 80, 110, 160, 17, rx=8.5, ry=8.5, fillColor=HexColor('#EFF6FF'), strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(String(cx, 115, 'Start: Incoming HTTP Request', fontName='Times-Bold', fontSize=7.5, fillColor=NAVY, textAnchor='middle'))
    d.add(Line(cx, 110, cx, 97, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 95, 80, 190, 17, rx=3, ry=3, fillColor=white, strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(cx, 85, 'Extract Authorization: Bearer <Token>', fontName='Times-Roman', fontSize=7.5, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(Line(cx, 80, cx, 67, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Polygon([cx, 67, cx + 65, 53, cx, 39, cx - 65, 53], fillColor=HexColor('#FEF3C7'), strokeColor=AMBER_COLOR, strokeWidth=1))
    d.add(String(cx, 51, 'JWT Valid & Unexpired?', fontName='Times-Bold', fontSize=7, fillColor=NAVY, textAnchor='middle'))
    
    d.add(Line(cx - 65, 53, cx - 135, 53, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    d.add(Line(cx - 135, 53, cx - 135, 33, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    d.add(Rect(cx - 175, 16, 80, 17, rx=3, ry=3, fillColor=HexColor('#FEE2E2'), strokeColor=DANGER_RED, strokeWidth=1))
    d.add(String(cx - 135, 21, 'HTTP 401 Unauthorized', fontName='Times-Bold', fontSize=6.8, fillColor=DANGER_RED, textAnchor='middle'))
    d.add(String(cx - 95, 57, 'No', fontName='Times-Italic', fontSize=7, fillColor=MUTED_TEXT, textAnchor='middle'))
    
    d.add(Line(cx, 39, cx, 27, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    d.add(String(cx + 8, 32, 'Yes', fontName='Times-Italic', fontSize=7, fillColor=MUTED_TEXT, textAnchor='start'))
    d.add(Rect(cx - 110, 8, 220, 19, rx=3, ry=3, fillColor=HexColor('#ECFDF5'), strokeColor=SUCCESS_GREEN, strokeWidth=1))
    d.add(String(cx, 14, 'Attach req.organizationId & Validate Controller RBAC -> Next()', fontName='Times-Bold', fontSize=7, fillColor=HexColor('#065F46'), textAnchor='middle'))
    return d

def draw_flowchart_telemetry():
    d = Drawing(USABLE_WIDTH, 120)
    w = USABLE_WIDTH
    cx = w / 2.0
    
    d.add(Rect(cx - 95, 98, 190, 17, rx=8.5, ry=8.5, fillColor=HexColor('#EFF6FF'), strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(String(cx, 103, 'POST /tracking/telemetry Coordinate Packet', fontName='Times-Bold', fontSize=7.5, fillColor=NAVY, textAnchor='middle'))
    d.add(Line(cx, 98, cx, 85, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 110, 68, 220, 17, rx=3, ry=3, fillColor=white, strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(cx, 73, 'Validate Lat, Lng, Speed, Heading, Odometer, Fuel', fontName='Times-Roman', fontSize=7.5, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(Line(cx, 68, cx, 55, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 115, 38, 230, 17, rx=3, ry=3, fillColor=HexColor('#F1F5F9'), strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(cx, 43, 'Update Vehicle.lastLocation & Check Geofence / Fuel Threshold', fontName='Times-Roman', fontSize=7.2, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(Line(cx, 38, cx, 25, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 125, 6, 250, 19, rx=4, ry=4, fillColor=HexColor('#ECFDF5'), strokeColor=SUCCESS_GREEN, strokeWidth=1))
    d.add(String(cx, 12, 'io.to("org:" + orgId).emit("telemetry:update", livePacket)', fontName='Courier', fontSize=7.5, fillColor=HexColor('#065F46'), textAnchor='middle'))
    return d

def draw_flowchart_financial():
    d = Drawing(USABLE_WIDTH, 125)
    w = USABLE_WIDTH
    cx = w / 2.0
    d.add(Rect(cx - 90, 102, 180, 18, rx=9, ry=9, fillColor=HexColor('#EFF6FF'), strokeColor=PRIMARY_BLUE, strokeWidth=1))
    d.add(String(cx, 107, 'Event: Trip Lifecycle Completed', fontName='Times-Bold', fontSize=7.5, fillColor=NAVY, textAnchor='middle'))
    d.add(Line(cx, 102, cx, 88, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 120, 68, 240, 20, rx=3, ry=3, fillColor=white, strokeColor=BORDER_COLOR, strokeWidth=1))
    d.add(String(cx, 74, 'Aggregate Total Costs = Fuel + Toll + Driver + Maintenance + Other', fontName='Times-Roman', fontSize=7.2, fillColor=DARK_TEXT, textAnchor='middle'))
    d.add(Line(cx, 68, cx, 54, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 125, 36, 250, 18, rx=3, ry=3, fillColor=HexColor('#FEF3C7'), strokeColor=AMBER_COLOR, strokeWidth=1))
    d.add(String(cx, 41, 'Calculate: Net Profit = Revenue - Total Cost | Margin % = (Profit/Rev)*100', fontName='Times-Bold', fontSize=6.8, fillColor=NAVY, textAnchor='middle'))
    d.add(Line(cx, 36, cx, 22, strokeColor=HexColor('#94A3B8'), strokeWidth=1))
    
    d.add(Rect(cx - 110, 4, 220, 18, rx=3, ry=3, fillColor=HexColor('#ECFDF5'), strokeColor=SUCCESS_GREEN, strokeWidth=1))
    d.add(String(cx, 9, 'Persist Trip Ledger & Recompute Vehicle Unit Economics / TCO', fontName='Times-Bold', fontSize=7, fillColor=HexColor('#065F46'), textAnchor='middle'))
    return d

print("Definitions updated successfully.")
