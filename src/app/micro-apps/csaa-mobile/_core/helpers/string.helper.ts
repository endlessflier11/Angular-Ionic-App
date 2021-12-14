export class StringHelper {
  public static ucFirst(s: string): string {
    return s.toLowerCase().replace(/^\w/, s.substr(0, 1).toUpperCase());
  }
}
