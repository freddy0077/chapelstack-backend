import { Injectable } from '@nestjs/common';
import { ITemplateEngine } from '../interfaces';

@Injectable()
export class TemplateService implements ITemplateEngine {
  async render(templateKey: string, variables: Record<string, any>): Promise<string> {
    // Minimal placeholder: interpolate {{key}} occurrences
    let output = templateKey || '';
    for (const [k, v] of Object.entries(variables || {})) {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
      output = output.replace(re, String(v));
    }
    return output;
  }
}
