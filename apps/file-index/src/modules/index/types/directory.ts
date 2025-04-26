export type DirectoryContents = {
  dirName: string;
  filesOrFolders: { name: string; url: string }[];
  mediaUrls?: { name: string; url: string }[];
};
