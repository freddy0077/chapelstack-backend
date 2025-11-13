/**
 * File Utility
 * 
 * Centralized file operations and validation
 * Eliminates duplication of file handling across services
 */
export class FileUtil {
  /**
   * Validate file type
   * 
   * @param file - Express Multer file object
   * @param allowedTypes - Array of allowed MIME types
   * @returns True if file type is allowed
   * 
   * @example
   * FileUtil.isValidFileType(file, ['image/jpeg', 'image/png']);
   */
  static isValidFileType(
    file: Express.Multer.File,
    allowedTypes: string[],
  ): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Generate unique file name
   * 
   * @param originalName - Original file name
   * @param prefix - Optional prefix
   * @returns Unique file name
   * 
   * @example
   * FileUtil.generateFileName('photo.jpg');
   * // Returns: '1699305600000-photo.jpg'
   */
  static generateFileName(originalName: string, prefix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const extension = this.getFileExtension(originalName);
    const baseName = originalName.replace(`.${extension}`, '');

    return `${prefix}${timestamp}-${random}-${baseName}.${extension}`;
  }

  /**
   * Get file extension from file name
   * 
   * @param fileName - File name
   * @returns File extension (without dot)
   * 
   * @example
   * FileUtil.getFileExtension('photo.jpg');
   * // Returns: 'jpg'
   */
  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Get file base name without extension
   * 
   * @param fileName - File name
   * @returns File name without extension
   * 
   * @example
   * FileUtil.getBaseName('photo.jpg');
   * // Returns: 'photo'
   */
  static getBaseName(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    return extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
  }

  /**
   * Check if file is image
   * 
   * @param file - Express Multer file object
   * @returns True if file is image
   * 
   * @example
   * FileUtil.isImage(file);
   */
  static isImage(file: Express.Multer.File): boolean {
    return file.mimetype.startsWith('image/');
  }

  /**
   * Check if file is document
   * 
   * @param file - Express Multer file object
   * @returns True if file is document
   * 
   * @example
   * FileUtil.isDocument(file);
   */
  static isDocument(file: Express.Multer.File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    return documentTypes.includes(file.mimetype);
  }

  /**
   * Check if file is video
   * 
   * @param file - Express Multer file object
   * @returns True if file is video
   * 
   * @example
   * FileUtil.isVideo(file);
   */
  static isVideo(file: Express.Multer.File): boolean {
    return file.mimetype.startsWith('video/');
  }

  /**
   * Check if file is audio
   * 
   * @param file - Express Multer file object
   * @returns True if file is audio
   * 
   * @example
   * FileUtil.isAudio(file);
   */
  static isAudio(file: Express.Multer.File): boolean {
    return file.mimetype.startsWith('audio/');
  }

  /**
   * Validate file size
   * 
   * @param file - Express Multer file object
   * @param maxSizeInBytes - Maximum allowed size in bytes
   * @returns True if file size is valid
   * 
   * @example
   * FileUtil.isValidFileSize(file, 5 * 1024 * 1024); // 5MB
   */
  static isValidFileSize(file: Express.Multer.File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }

  /**
   * Format file size to human readable format
   * 
   * @param bytes - Size in bytes
   * @returns Formatted size string
   * 
   * @example
   * FileUtil.formatFileSize(1024 * 1024);
   * // Returns: '1 MB'
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get MIME type from file extension
   * 
   * @param extension - File extension (with or without dot)
   * @returns MIME type
   * 
   * @example
   * FileUtil.getMimeType('jpg');
   * // Returns: 'image/jpeg'
   */
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      csv: 'text/csv',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
    };

    const ext = extension.toLowerCase().replace(/^\./, '');
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Sanitize file name
   * 
   * @param fileName - File name to sanitize
   * @returns Sanitized file name
   * 
   * @example
   * FileUtil.sanitizeFileName('my photo (1).jpg');
   * // Returns: 'my-photo-1.jpg'
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
