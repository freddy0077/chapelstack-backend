import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { AttendanceReport } from './entities/attendance-report.entity';
import { AttendanceReportFormat } from './dto/attendance-report.input';

@Injectable()
export class FileGenerationService {
  private readonly logger = new Logger(FileGenerationService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
  private readonly backendBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.backendBaseUrl =
      this.configService.get<string>('BASE_URL') || 'http://localhost:3003';
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generateFile(
    report: AttendanceReport,
    format: AttendanceReportFormat,
  ): Promise<string> {
    const fileName = `${report.id}-${Date.now()}`;
    this.logger.log(`Generating file: ${fileName} with format: ${format}`);

    switch (format) {
      case AttendanceReportFormat.CSV:
        this.logger.log('Generating CSV file');
        return this.generateCSV(report, fileName);
      case AttendanceReportFormat.EXCEL:
        this.logger.log('Generating Excel file');
        return this.generateExcel(report, fileName);
      case AttendanceReportFormat.PDF:
        this.logger.log('Generating PDF file');
        return this.generatePDF(report, fileName);
      default:
        this.logger.log(`Unknown format ${format}, generating JSON`);
        return this.generateJSON(report, fileName);
    }
  }

  private async generateCSV(
    report: AttendanceReport,
    fileName: string,
  ): Promise<string> {
    const filePath = path.join(this.uploadsDir, `${fileName}.csv`);

    // Create CSV writer for main data
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'period', title: 'Period' },
        { id: 'totalAttendance', title: 'Total Attendance' },
        { id: 'uniqueMembers', title: 'Unique Members' },
        { id: 'visitors', title: 'Visitors' },
        { id: 'firstTimeVisitors', title: 'First Time Visitors' },
        { id: 'averageAttendance', title: 'Average Attendance' },
        { id: 'growthRate', title: 'Growth Rate (%)' },
        { id: 'retentionRate', title: 'Retention Rate (%)' },
      ],
    });

    // Prepare data for CSV
    const csvData = report.data.map((item) => ({
      period: item.period,
      totalAttendance: item.totalAttendance,
      uniqueMembers: item.uniqueMembers,
      visitors: item.visitors,
      firstTimeVisitors: item.firstTimeVisitors,
      averageAttendance: item.averageAttendance,
      growthRate: item.growthRate || 0,
      retentionRate: item.retentionRate || 0,
    }));

    await csvWriter.writeRecords(csvData);

    // Add summary section
    const summaryData = [
      '',
      'SUMMARY',
      `Report: ${report.title}`,
      `Generated: ${report.generatedAt}`,
      `Period: ${report.summary.startDate} to ${report.summary.endDate}`,
      `Total Sessions: ${report.summary.totalSessions}`,
      `Total Events: ${report.summary.totalEvents}`,
      `Total Attendance: ${report.summary.totalAttendance}`,
      `Unique Members: ${report.summary.uniqueMembers}`,
      `Total Visitors: ${report.summary.totalVisitors}`,
      `First Time Visitors: ${report.summary.firstTimeVisitors}`,
      `Average Session Attendance: ${report.summary.averageSessionAttendance}`,
      `Average Event Attendance: ${report.summary.averageEventAttendance}`,
      `Member Retention Rate: ${report.summary.memberRetentionRate}%`,
      `Visitor Conversion Rate: ${report.summary.visitorConversionRate}%`,
      `Overall Growth Rate: ${report.summary.overallGrowthRate}%`,
    ];

    // Append summary to file
    fs.appendFileSync(filePath, '\n' + summaryData.join('\n'));

    // Add member analysis if available
    if (report.members && report.members.length > 0) {
      const memberData = [
        '',
        'MEMBER ANALYSIS',
        'Member ID,Full Name,Title,Email,Phone,Date of Birth,Gender,Marital Status,Occupation,Employer,Address,City,State,Postal Code,Country,Nationality,Place of Birth,NLB Number,Father Name,Mother Name,Father Occupation,Mother Occupation,Emergency Contact Name,Emergency Contact Phone,Membership Date,Baptism Date,Confirmation Date,Status,Branch,Spouse,Parent,Children,Attendance Count,Attendance Rate,Last Attendance,Profile Image URL,Notes,RFID Card ID,Created At,Updated At',
      ];

      report.members.forEach((member) => {
        const memberRow = [
          member.memberId || member.id,
          `"${`${member.firstName} ${member.middleName || ''} ${member.lastName}`.trim()}"`,
          `"${member.title || 'N/A'}"`,
          `"${member.email || 'N/A'}"`,
          `"${member.phoneNumber || 'N/A'}"`,
          `"${member.dateOfBirth || 'N/A'}"`,
          `"${member.gender || 'N/A'}"`,
          `"${member.maritalStatus || 'N/A'}"`,
          `"${member.occupation || 'N/A'}"`,
          `"${member.employerName || 'N/A'}"`,
          `"${member.address || 'N/A'}"`,
          `"${member.city || 'N/A'}"`,
          `"${member.state || 'N/A'}"`,
          `"${member.postalCode || 'N/A'}"`,
          `"${member.country || 'N/A'}"`,
          `"${member.nationality || 'N/A'}"`,
          `"${member.placeOfBirth || 'N/A'}"`,
          `"${member.nlbNumber || 'N/A'}"`,
          `"${member.fatherName || 'N/A'}"`,
          `"${member.motherName || 'N/A'}"`,
          `"${member.fatherOccupation || 'N/A'}"`,
          `"${member.motherOccupation || 'N/A'}"`,
          `"${member.emergencyContactName || 'N/A'}"`,
          `"${member.emergencyContactPhone || 'N/A'}"`,
          `"${member.membershipDate || 'N/A'}"`,
          `"${member.baptismDate || 'N/A'}"`,
          `"${member.confirmationDate || 'N/A'}"`,
          `"${member.status || 'N/A'}"`,
          `"${member.branch ? member.branch.name : 'N/A'}"`,
          `"${member.spouse ? `${member.spouse.firstName} ${member.spouse.lastName}` : 'N/A'}"`,
          `"${member.parent ? `${member.parent.firstName} ${member.parent.lastName}` : 'N/A'}"`,
          `"${member.children ? member.children.map(child => `${child.firstName} ${child.lastName}`).join(', ') : 'N/A'}"`,
          member.attendanceCount,
          `${member.attendanceRate}%`,
          `"${member.lastAttendance || 'N/A'}"`,
          `"${member.profileImageUrl || 'N/A'}"`,
          `"${member.notes || 'N/A'}"`,
          `"${member.rfidCardId || 'N/A'}"`,
          `"${member.createdAt || 'N/A'}"`,
          `"${member.updatedAt || 'N/A'}"`,
        ].join(',');
        memberData.push(memberRow);
      });

      fs.appendFileSync(filePath, '\n' + memberData.join('\n'));
    }

    this.logger.log(`Generated CSV file: ${filePath}`);
    return filePath;
  }

  private async generateExcel(
    report: AttendanceReport,
    fileName: string,
  ): Promise<string> {
    const filePath = path.join(this.uploadsDir, `${fileName}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    worksheet.addRow([report.title]);
    worksheet.addRow(['Generated:', report.generatedAt]);
    worksheet.addRow([
      'Period:',
      `${report.summary.startDate} to ${report.summary.endDate}`,
    ]);
    worksheet.addRow([]);
    worksheet.addRow(['SUMMARY']);
    worksheet.addRow(['Total Sessions', report.summary.totalSessions]);
    worksheet.addRow(['Total Events', report.summary.totalEvents]);
    worksheet.addRow(['Total Attendance', report.summary.totalAttendance]);
    worksheet.addRow(['Unique Members', report.summary.uniqueMembers]);
    worksheet.addRow(['Total Visitors', report.summary.totalVisitors]);
    worksheet.addRow(['First Time Visitors', report.summary.firstTimeVisitors]);
    worksheet.addRow([
      'Average Session Attendance',
      report.summary.averageSessionAttendance,
    ]);
    worksheet.addRow([
      'Average Event Attendance',
      report.summary.averageEventAttendance,
    ]);
    worksheet.addRow([
      'Member Retention Rate',
      `${report.summary.memberRetentionRate}%`,
    ]);
    worksheet.addRow([
      'Visitor Conversion Rate',
      `${report.summary.visitorConversionRate}%`,
    ]);
    worksheet.addRow([
      'Overall Growth Rate',
      `${report.summary.overallGrowthRate}%`,
    ]);
    worksheet.addRow([]);
    worksheet.addRow(['DETAILED DATA']);
    worksheet.addRow([
      'Period',
      'Total Attendance',
      'Unique Members',
      'Visitors',
      'First Time Visitors',
      'Average Attendance',
      'Growth Rate',
      'Retention Rate',
    ]);

    report.data.forEach((item) => {
      worksheet.addRow([
        item.period,
        item.totalAttendance,
        item.uniqueMembers,
        item.visitors,
        item.firstTimeVisitors,
        item.averageAttendance,
        item.growthRate || 0,
        item.retentionRate || 0,
      ]);
    });

    // Member analysis if available
    if (report.members && report.members.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow(['MEMBER ANALYSIS']);
      worksheet.addRow([
        'Member ID',
        'Full Name',
        'Title',
        'Email',
        'Phone',
        'Date of Birth',
        'Gender',
        'Marital Status',
        'Occupation',
        'Employer',
        'Address',
        'City',
        'State',
        'Postal Code',
        'Country',
        'Nationality',
        'Place of Birth',
        'NLB Number',
        'Father Name',
        'Mother Name',
        'Father Occupation',
        'Mother Occupation',
        'Emergency Contact Name',
        'Emergency Contact Phone',
        'Membership Date',
        'Baptism Date',
        'Confirmation Date',
        'Status',
        'Branch',
        'Spouse',
        'Parent',
        'Children',
        'Attendance Count',
        'Attendance Rate',
        'Last Attendance',
        'Profile Image URL',
        'Notes',
        'RFID Card ID',
        'Created At',
        'Updated At',
      ]);

      report.members.forEach((member) => {
        worksheet.addRow([
          member.memberId || member.id,
          `${member.firstName} ${member.middleName || ''} ${member.lastName}`.trim(),
          member.title || 'N/A',
          member.email || 'N/A',
          member.phoneNumber || 'N/A',
          member.dateOfBirth || 'N/A',
          member.gender || 'N/A',
          member.maritalStatus || 'N/A',
          member.occupation || 'N/A',
          member.employerName || 'N/A',
          member.address || 'N/A',
          member.city || 'N/A',
          member.state || 'N/A',
          member.postalCode || 'N/A',
          member.country || 'N/A',
          member.nationality || 'N/A',
          member.placeOfBirth || 'N/A',
          member.nlbNumber || 'N/A',
          member.fatherName || 'N/A',
          member.motherName || 'N/A',
          member.fatherOccupation || 'N/A',
          member.motherOccupation || 'N/A',
          member.emergencyContactName || 'N/A',
          member.emergencyContactPhone || 'N/A',
          member.membershipDate || 'N/A',
          member.baptismDate || 'N/A',
          member.confirmationDate || 'N/A',
          member.status || 'N/A',
          member.branch ? member.branch.name : 'N/A',
          member.spouse ? `${member.spouse.firstName} ${member.spouse.lastName}` : 'N/A',
          member.parent ? `${member.parent.firstName} ${member.parent.lastName}` : 'N/A',
          member.children ? member.children.map(child => `${child.firstName} ${child.lastName}`).join(', ') : 'N/A',
          member.attendanceCount,
          `${member.attendanceRate}%`,
          member.lastAttendance || 'N/A',
          member.profileImageUrl || 'N/A',
          member.notes || 'N/A',
          member.rfidCardId || 'N/A',
          member.createdAt || 'N/A',
          member.updatedAt || 'N/A',
        ]);
      });
    }

    // Session analysis if available
    if (report.sessions && report.sessions.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow(['SESSION ANALYSIS']);
      worksheet.addRow([
        'Session Name',
        'Date',
        'Type',
        'Total Attendance',
        'Member Attendance',
        'Visitor Attendance',
        'Attendance Rate',
      ]);

      report.sessions.forEach((session) => {
        worksheet.addRow([
          session.name,
          session.date,
          session.type || 'N/A',
          session.totalAttendance,
          session.memberAttendance,
          session.visitorAttendance,
          `${session.attendanceRate}%`,
        ]);
      });
    }

    // Event analysis if available
    if (report.events && report.events.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow(['EVENT ANALYSIS']);
      worksheet.addRow([
        'Event Title',
        'Start Date',
        'Category',
        'Total Attendance',
        'Member Attendance',
        'Visitor Attendance',
        'Attendance Rate',
      ]);

      report.events.forEach((event) => {
        worksheet.addRow([
          event.title,
          event.startDate,
          event.category || 'N/A',
          event.totalAttendance,
          event.memberAttendance,
          event.visitorAttendance,
          `${event.attendanceRate}%`,
        ]);
      });
    }

    await workbook.xlsx.writeFile(filePath);

    this.logger.log(`Generated Excel file: ${filePath}`);
    return filePath;
  }

  private async generatePDF(
    report: AttendanceReport,
    fileName: string,
  ): Promise<string> {
    const filePath = path.join(this.uploadsDir, `${fileName}.pdf`);

    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(filePath));

    pdfDoc.fontSize(24).text(report.title, 100, 100);
    pdfDoc.fontSize(18).text(`Generated: ${report.generatedAt}`, 100, 130);
    pdfDoc
      .fontSize(18)
      .text(
        `Period: ${report.summary.startDate} to ${report.summary.endDate}`,
        100,
        160,
      );

    pdfDoc.fontSize(18).text('SUMMARY', 100, 200);
    pdfDoc
      .fontSize(14)
      .text(`Total Sessions: ${report.summary.totalSessions}`, 100, 230);
    pdfDoc
      .fontSize(14)
      .text(`Total Events: ${report.summary.totalEvents}`, 100, 260);
    pdfDoc
      .fontSize(14)
      .text(`Total Attendance: ${report.summary.totalAttendance}`, 100, 290);
    pdfDoc
      .fontSize(14)
      .text(`Unique Members: ${report.summary.uniqueMembers}`, 100, 320);
    pdfDoc
      .fontSize(14)
      .text(`Total Visitors: ${report.summary.totalVisitors}`, 100, 350);
    pdfDoc
      .fontSize(14)
      .text(
        `First Time Visitors: ${report.summary.firstTimeVisitors}`,
        100,
        380,
      );
    pdfDoc
      .fontSize(14)
      .text(
        `Average Session Attendance: ${report.summary.averageSessionAttendance}`,
        100,
        410,
      );
    pdfDoc
      .fontSize(14)
      .text(
        `Average Event Attendance: ${report.summary.averageEventAttendance}`,
        100,
        440,
      );
    pdfDoc
      .fontSize(14)
      .text(
        `Member Retention Rate: ${report.summary.memberRetentionRate}%`,
        100,
        470,
      );
    pdfDoc
      .fontSize(14)
      .text(
        `Visitor Conversion Rate: ${report.summary.visitorConversionRate}%`,
        100,
        500,
      );
    pdfDoc
      .fontSize(14)
      .text(
        `Overall Growth Rate: ${report.summary.overallGrowthRate}%`,
        100,
        530,
      );

    pdfDoc.fontSize(18).text('DETAILED DATA', 100, 580);
    pdfDoc
      .fontSize(14)
      .text(
        'Period\tTotal Attendance\tUnique Members\tVisitors\tFirst Time Visitors\tAverage Attendance\tGrowth Rate\tRetention Rate',
        100,
        610,
      );

    let y = 640;
    report.data.forEach((item) => {
      pdfDoc
        .fontSize(14)
        .text(
          `${item.period}\t${item.totalAttendance}\t${item.uniqueMembers}\t${item.visitors}\t${item.firstTimeVisitors}\t${item.averageAttendance}\t${item.growthRate || 0}\t${item.retentionRate || 0}`,
          100,
          y,
        );
      y += 30;
    });

    // Member analysis if available
    if (report.members && report.members.length > 0) {
      pdfDoc.fontSize(18).text('MEMBER ANALYSIS', 100, y + 20);
      pdfDoc
        .fontSize(14)
        .text(
          'Name\tEmail\tAttendance Count\tAttendance Rate\tLast Attendance',
          100,
          y + 50,
        );

      y += 80;
      report.members.forEach((member) => {
        pdfDoc
          .fontSize(14)
          .text(
            `${member.firstName} ${member.lastName}\t${member.email || 'N/A'}\t${member.attendanceCount}\t${member.attendanceRate}%\t${member.lastAttendance || 'N/A'}`,
            100,
            y,
          );
        y += 30;
      });
    }

    // Session analysis if available
    if (report.sessions && report.sessions.length > 0) {
      pdfDoc.fontSize(18).text('SESSION ANALYSIS', 100, y + 20);
      pdfDoc
        .fontSize(14)
        .text(
          'Session Name\tDate\tType\tTotal Attendance\tMember Attendance\tVisitor Attendance\tAttendance Rate',
          100,
          y + 50,
        );

      y += 80;
      report.sessions.forEach((session) => {
        pdfDoc
          .fontSize(14)
          .text(
            `${session.name}\t${session.date}\t${session.type || 'N/A'}\t${session.totalAttendance}\t${session.memberAttendance}\t${session.visitorAttendance}\t${session.attendanceRate}%`,
            100,
            y,
          );
        y += 30;
      });
    }

    // Event analysis if available
    if (report.events && report.events.length > 0) {
      pdfDoc.fontSize(18).text('EVENT ANALYSIS', 100, y + 20);
      pdfDoc
        .fontSize(14)
        .text(
          'Event Title\tStart Date\tCategory\tTotal Attendance\tMember Attendance\tVisitor Attendance\tAttendance Rate',
          100,
          y + 50,
        );

      y += 80;
      report.events.forEach((event) => {
        pdfDoc
          .fontSize(14)
          .text(
            `${event.title}\t${event.startDate}\t${event.category || 'N/A'}\t${event.totalAttendance}\t${event.memberAttendance}\t${event.visitorAttendance}\t${event.attendanceRate}%`,
            100,
            y,
          );
        y += 30;
      });
    }

    pdfDoc.end();

    this.logger.log(`Generated PDF file: ${filePath}`);
    return filePath;
  }

  private async generateJSON(
    report: AttendanceReport,
    fileName: string,
  ): Promise<string> {
    const filePath = path.join(this.uploadsDir, `${fileName}.json`);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');

    this.logger.log(`Generated JSON file: ${filePath}`);
    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted file: ${filePath}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting file ${filePath}:`, error);
    }
  }

  getFileUrl(filePath: string): string {
    const fileName = path.basename(filePath);
    return `${this.backendBaseUrl}/api/reports/download/${fileName}`;
  }
}
