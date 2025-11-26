import { GSCQueryRow, GSCSite, GSCSitemap } from '../types';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/searchconsole/v1/rest"];
const SCOPES = "https://www.googleapis.com/auth/webmasters.readonly";

declare global {
  interface Window {
    google: any;
  }
}

let tokenClient: any;
let accessToken: string | null = null;

export const gscApi = {
  /**
   * Initialize Google OAuth Client
   */
  init: (clientId: string, callback: (token: string) => void) => {
    if (!window.google) return;
    
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        accessToken = tokenResponse.access_token;
        callback(accessToken!);
      },
    });
  },

  /**
   * Trigger Login Flow
   */
  login: () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      console.error("Token client not initialized");
    }
  },

  /**
   * Get Verified Sites
   */
  getSites: async (): Promise<GSCSite[]> => {
    if (!accessToken) throw new Error("Not authenticated");
    const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    return data.siteEntry || [];
  },

  /**
   * Get Sitemaps (Proxy for Coverage Stats)
   */
  getSitemaps: async (siteUrl: string): Promise<GSCSitemap[]> => {
    if (!accessToken) throw new Error("Not authenticated");
    const encodedSite = encodeURIComponent(siteUrl);
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    return data.sitemap || [];
  },

  /**
   * Get Search Analytics (Performance)
   */
  getAnalytics: async (
    siteUrl: string, 
    startDate: string, 
    endDate: string, 
    dimensions: ('DATE' | 'QUERY' | 'PAGE' | 'COUNTRY' | 'DEVICE')[]
  ): Promise<GSCQueryRow[]> => {
    if (!accessToken) throw new Error("Not authenticated");
    const encodedSite = encodeURIComponent(siteUrl);
    const body = {
      startDate,
      endDate,
      dimensions,
      rowLimit: 500
    };

    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data.rows || [];
  },

  /**
   * Inspect specific URL (Requires high quota, use sparingly)
   */
  inspectUrl: async (siteUrl: string, inspectionUrl: string) => {
    if (!accessToken) throw new Error("Not authenticated");
    const body = {
      inspectionUrl,
      siteUrl,
      languageCode: "en-US"
    };

    const res = await fetch(`https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    return await res.json();
  }
};