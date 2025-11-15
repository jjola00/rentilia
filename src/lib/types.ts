export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  bio: string;
  memberSince: Date;
};

export type Review = {
  id: string;
  user: User;
  rating: number;
  comment: string;
  date: Date;
};

export type Item = {
  id: string;
  title: string;
  description: string;
  owner: User;
  category: string;
  dailyRate: number;
  securityDeposit: number;
  location: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  imageUrls: string[];
  availability: Date[];
};
