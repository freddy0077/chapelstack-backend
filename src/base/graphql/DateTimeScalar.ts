import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): string {
    if (!(value instanceof Date)) {
      throw new Error(
        `DateTimeScalar can only serialize Date objects, but got ${typeof value}`,
      );
    }
    return value.toISOString(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error(
      `DateTimeScalar can only parse string literals. Received: ${ast.kind}`,
    );
  }
}
