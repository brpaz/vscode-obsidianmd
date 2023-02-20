export interface Document {
  title: string;
  filePath: string;
  location: string;
  data: {
    [key: string]: unknown;
  };
}
