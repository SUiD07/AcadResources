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
// Cache settings
const CACHE_KEY = 'drive_files_cache';
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

interface CachedData {
  files: DriveFile[];
  timestamp: number;
}

/**
 * List files and subfolders from the specific folder recursively
 * Implements simple caching
 */
export async function listDriveFiles(): Promise<DriveFile[]> {
  if (!accessToken) {
    throw new Error('No access token available. Please login first.');
  }

  // Check cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { files, timestamp }: CachedData = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return files;
    }
  }

  const allFiles: DriveFile[] = [];
  const processedFolders = new Set<string>();

  async function fetchFolderContents(folderId: string) {
    if (processedFolders.has(folderId)) return;
    processedFolders.add(folderId);

    let pageToken: string | undefined = undefined;
    const fields = 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime, size)';

    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.append('q', `'${folderId}' in parents and trashed = false`);
      url.searchParams.append('fields', fields);
      url.searchParams.append('orderBy', 'name');
      url.searchParams.append('pageSize', '1000');
      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch from Drive');
      const data = await response.json();

      for (const file of (data.files || [])) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Parallel fetch for subfolders
          await fetchFolderContents(file.id);
        } else {
          allFiles.push(file);
        }
      }
      pageToken = data.nextPageToken;
      if (allFiles.length >= 5000) break;
    } while (pageToken);
  }

  try {
    if (FOLDER_ID) {
      await fetchFolderContents(FOLDER_ID);
      
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        files: allFiles,
        timestamp: Date.now()
      }));
    } else {
      console.warn('VITE_GDRIVE_FOLDER_ID is not set.');
    }
    return allFiles;
  } catch (error) {
    console.error('Error fetching drive files:', error);
    throw error;
  }
}

/**
 * Check if the user has access by attempting to fetch the folder metadata
 */
export async function checkDriveAccess(): Promise<boolean> {
  if (!accessToken) return false;
  if (!FOLDER_ID) return true; // Cannot check if ID is missing

  try {
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${FOLDER_ID}`);
    url.searchParams.append('fields', 'id');
    
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.ok;
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
