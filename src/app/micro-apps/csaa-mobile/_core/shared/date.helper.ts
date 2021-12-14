export default class DateHelper {
  static isBeforeToday(date: Date) {
    const dueDate = new Date(date.getTime());
    dueDate.setHours(0, 0, 0, 0);

    const today = new Date(Date.now());
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  static toDate(date: string): Date {
    if (date && date.length === 10) {
      const dateArray = date.split('-');
      return new Date(
        parseInt(dateArray[0], 10),
        parseInt(dateArray[1], 10) - 1,
        parseInt(dateArray[2], 10)
      );
    }
    return null;
  }
}
