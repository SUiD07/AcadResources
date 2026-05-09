import { GOOGLE_DRIVE_CONFIG } from './config';

const CLIENT_ID = GOOGLE_DRIVE_CONFIG.clientId;
const FOLDER_ID = GOOGLE_DRIVE_CONFIG.folderId;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface UserInfo {
  email: string;
  picture?: string;
  name?: string;
}

let tokenClient: any = null;
let accessToken: string | null = null;

/**
 * Initialize the GIS token client
 */
export function initTokenClient(onTokenReceived: (token: string) => void) {
  if (typeof window === 'undefined' || !(window as any).google) return;

  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.error !== undefined) {
        throw response;
      }
      accessToken = response.access_token;
      onTokenReceived(response.access_token);
    },
  });
}

/**
 * Request a new access token
 */
export function requestToken() {
  if (tokenClient) {
    // Hint to Google to show docchula.com accounts primarily
    tokenClient.requestAccessToken({ prompt: 'consent', hd: 'docchula.com' });
  } else {
    console.error('Token client not initialized');
  }
}

/**
 * Fetch user info to verify email domain
 */
export async function getUserInfo(): Promise<UserInfo> {
  if (!accessToken) {
    throw new Error('No access token available.');
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user information.');
  }

  return await response.json();
}
/**
 * List files from the specific folder (supports pagination for large folders)
 */
export async function listDriveFiles(): Promise<DriveFile[]> {
  if (!accessToken) {
    throw new Error('No access token available. Please login first.');
  }

  if (!FOLDER_ID) {
    console.warn('VITE_GDRIVE_FOLDER_ID is not set. Listing all files.');
  }

  let allFiles: DriveFile[] = [];
  let pageToken: string | undefined = undefined;
  const query = FOLDER_ID ? `'${FOLDER_ID}' in parents and trashed = false` : 'trashed = false';
  const fields = 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime, size)';

  try {
    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.append('q', query);
      url.searchParams.append('fields', fields);
      url.searchParams.append('orderBy', 'name');
      url.searchParams.append('pageSize', '1000'); // Get more per request
      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch files from Google Drive');
      }

      const data = await response.json();
      allFiles = allFiles.concat(data.files || []);
      pageToken = data.nextPageToken;
      
      // Safety limit: Stop after 5000 files to prevent browser memory issues 
      // unless specifically requested to load more
      if (allFiles.length >= 5000) break;

    } while (pageToken);

    return allFiles;
  } catch (error) {
    console.error('Error fetching drive files:', error);
    throw error;
  }
}

/**
 * Check if the user has access by attempting to list files
 */
export async function checkDriveAccess(): Promise<boolean> {
  try {
    await listDriveFiles();
    return true;
  } catch (error) {
    console.error('Access check failed:', error);
    return false;
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
}
