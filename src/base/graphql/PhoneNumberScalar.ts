import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

const PHONE_NUMBER_REGEX = /^\+[1-9]\d{1,14}$/;

@Scalar('PhoneNumber', () => PhoneNumberScalar)
export class PhoneNumberScalar implements CustomScalar<string, string> {
  description = 'Phone number custom scalar type (E.164 format)';

  parseValue(value: unknown): string {
    if (typeof value !== 'string' || !PHONE_NUMBER_REGEX.test(value)) {
      throw new Error(
        'Invalid phone number format. Expected E.164 format (e.g., +12125551234)',
      );
    }
    return value;
  }

  serialize(value: unknown): string {
    if (typeof value !== 'string') {
      throw new Error(
        `PhoneNumberScalar can only serialize string values, but got ${typeof value}`,
      );
    }
    return value;
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.STRING) {
      if (!PHONE_NUMBER_REGEX.test(ast.value)) {
        throw new Error(
          'Invalid phone number format. Expected E.164 format (e.g., +12125551234)',
        );
      }
      return ast.value;
    }
    throw new Error('PhoneNumberScalar can only parse string literals.');
  }
}
