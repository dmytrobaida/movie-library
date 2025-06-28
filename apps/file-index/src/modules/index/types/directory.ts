export type DirectoryContents = {
  dirName: string;
  filesOrFolders: { name: string; url: string; deleteUrl?: string }[];
  mediaUrls?: { name: string; url: string }[];
};
