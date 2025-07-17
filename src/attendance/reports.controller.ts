import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/reports')
export class ReportsController {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'reports');

  @Get('download/:filename')
  async downloadReport(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(this.uploadsDir, filename);

    // Security check: ensure the file is within the uploads directory
    if (!filePath.startsWith(this.uploadsDir)) {
      throw new NotFoundException('File not found');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    let disposition = 'attachment';

    switch (ext) {
      case '.csv':
        contentType = 'text/csv';
        break;
      case '.xlsx':
        contentType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.html':
        contentType = 'text/html';
        disposition = 'inline'; // Open in browser for HTML files
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${filename}"`,
    );

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after download (optional - you might want to keep files for a while)
    fileStream.on('end', () => {
      // Optionally delete the file after a delay
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }, 60000); // Delete after 1 minute
    });
  }
}
