import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

const EMAIL_ADDRESS_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

@Scalar('Email', () => EmailScalar)
export class EmailScalar implements CustomScalar<string, string> {
  description = 'Email custom scalar type';

  parseValue(value: unknown): string {
    if (typeof value !== 'string' || !EMAIL_ADDRESS_REGEX.test(value)) {
      throw new Error('Invalid email address format');
    }
    return value;
  }

  serialize(value: unknown): string {
    if (typeof value !== 'string') {
      throw new Error(
        `EmailScalar can only serialize string values, but got ${typeof value}`,
      );
    }
    return value;
  }

  parseLiteral(ast: ValueNode): string {
    if (ast.kind === Kind.STRING) {
      if (!EMAIL_ADDRESS_REGEX.test(ast.value)) {
        throw new Error('Invalid email address format');
      }
      return ast.value;
    }
    throw new Error('EmailScalar can only parse string literals.');
  }
}
