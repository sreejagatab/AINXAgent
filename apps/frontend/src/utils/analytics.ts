import ReactGA from 'react-ga4';
import { getEnvironment, isProduction } from '../config/environment';

export class Analytics {
  private static instance: Analytics;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  public init(): void {
    const { GA_TRACKING_ID } = getEnvironment();
    
    if (isProduction() && GA_TRACKING_ID) {
      ReactGA.initialize(GA_TRACKING_ID);
      this.initialized = true;
    }
  }

  public pageView(path: string): void {
    if (this.initialized) {
      ReactGA.send({ hitType: "pageview", page: path });
    }
  }

  public event(category: string, action: string, label?: string, value?: number): void {
    if (this.initialized) {
      ReactGA.event({
        category,
        action,
        label,
        value,
      });
    }
  }

  public timing(category: string, variable: string, value: number, label?: string): void {
    if (this.initialized) {
      ReactGA.timing({
        category,
        variable,
        value,
        label,
      });
    }
  }

  public exception(description: string, fatal: boolean = false): void {
    if (this.initialized) {
      ReactGA.exception({
        description,
        fatal,
      });
    }
  }

  public setUser(userId: string): void {
    if (this.initialized) {
      ReactGA.set({ userId });
    }
  }
}

export const analytics = Analytics.getInstance(); 