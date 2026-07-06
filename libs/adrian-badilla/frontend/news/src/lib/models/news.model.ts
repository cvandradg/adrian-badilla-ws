export interface News {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'Fitness' | 'Nutrición' | 'Salud';
  date: Date;
  featured: boolean;
}
