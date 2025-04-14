import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrictEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrictEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const domainPart = value.split('@')[1];
          const isAscii = /^[\x00-\x7F]*$/.test(domainPart);
          return typeof value === 'string' && emailRegex.test(value) && isAscii;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Email має бути валідним і домен не повинен містити кирилицю або спеціальні символи';
        },
      },
    });
  };
}
