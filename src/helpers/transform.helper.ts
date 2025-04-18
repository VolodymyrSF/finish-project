export class TransformHelper {
  public static toLowerCase({ value }: { value: string }): string {
    return value ? value.toString().toLowerCase() : value;
  }

  public static trim({ value }: { value: string }): string {
    return value ? value.toString().trim() : value;
  }
  public static toNumber({ value }: { value: any }): number | null {
    return value ? parseInt(value) : null;
  }
}
