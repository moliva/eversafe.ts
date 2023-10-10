
export type LineFormat = {
  line?: string;
  checkbox?: boolean;
  check?: boolean;
  blur?: boolean;
}

export type Content = [LineFormat, Content][]

export type Note = {
  id: number;
  name: string;
  content: Content;
}
