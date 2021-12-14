export class RouterMockService {
  public fullPath = jest.fn();
  public relativePath = jest.fn();
  public isCsaaModulesRoute = jest.fn();
  public currentRouteIs = jest.fn();
  public previousRouteIs = jest.fn();
  public currentRouteContains = jest.fn();
  public getController = jest.fn();
  public navigateForward = jest.fn();
  public navigateBack = jest.fn().mockResolvedValue({});
  public navigateRoot = jest.fn();
  public back = jest.fn();
  public getTop = jest.fn();
  public navigateAway = jest.fn();
  public backToClubHome = jest.fn();
}
