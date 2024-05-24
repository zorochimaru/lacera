export interface NewsImage {
  alt: string;
  src: string;
}

export interface News {
  title: string;
  text: string;
  images: NewsImage[];
}
