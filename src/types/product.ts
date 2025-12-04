export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
}

export interface Design {
  id: number;
  name: string;
  color: string;
  thumbnail: string;
  texture?: string;
}

export interface Size {
  id: string;
  label: string;
  measurements: {
    chest: number;
    length: number;
    shoulder: number;
  };
}
