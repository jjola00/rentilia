import type { User, Item, Review } from '@/lib/types';

// Mock Users
export const userJane: User = {
  id: 'user_jane',
  name: 'Jane Doe',
  avatarUrl: 'https://picsum.photos/seed/201/100/100',
  location: 'San Francisco, CA',
  bio: 'DIY enthusiast and weekend warrior. Happy to share my tools with the community!',
  memberSince: new Date('2022-08-15'),
};

export const userJohn: User = {
  id: 'user_john',
  name: 'John Smith',
  avatarUrl: 'https://picsum.photos/seed/202/100/100',
  location: 'Brooklyn, NY',
  bio: 'Professional photographer and videographer. My gear is top-notch and well-maintained.',
  memberSince: new Date('2021-11-20'),
};

export const userEmily: User = {
  id: 'user_emily',
  name: 'Emily Jones',
  avatarUrl: 'https://picsum.photos/seed/203/100/100',
  location: 'Austin, TX',
  bio: 'Party planner and event organizer. Let me help make your next event a success!',
  memberSince: new Date('2023-01-30'),
};

export const userMichael: User = {
  id: 'user_michael',
  name: 'Michael Brown',
  avatarUrl: 'https://picsum.photos/seed/204/100/100',
  location: 'Denver, CO',
  bio: 'Outdoor adventurer and sports lover. Always ready for the next thrill.',
  memberSince: new Date('2022-05-10'),
};

// Mock Reviews
export const reviewsForItem1: Review[] = [
  { id: 'rev1', user: userJohn, rating: 5, comment: 'Great drill, powerful and easy to use. Jane was very helpful.', date: new Date('2023-10-05') },
  { id: 'rev2', user: userEmily, rating: 4, comment: 'Worked perfectly for my project. Pickup was a breeze.', date: new Date('2023-09-22') },
];

export const reviewsForItem2: Review[] = [
    { id: 'rev3', user: userJane, rating: 5, comment: 'Amazing camera, the quality is stunning. John keeps his gear in perfect condition.', date: new Date('2023-11-10') },
    { id: 'rev4', user: userMichael, rating: 5, comment: 'John was super knowledgeable and gave me some great tips. Highly recommend!', date: new Date('2023-10-18') },
];

// Mock Items
export const items: Item[] = [
  {
    id: '1',
    title: 'High-Powered Electric Drill',
    description: 'A powerful and versatile electric drill perfect for any home improvement project. Comes with a full set of bits.',
    owner: userJane,
    category: 'Tools & Equipment',
    dailyRate: 25,
    securityDeposit: 50,
    location: 'San Francisco, CA',
    rating: 4.5,
    reviewCount: 2,
    reviews: reviewsForItem1,
    imageUrls: ['https://picsum.photos/seed/101/600/400'],
    availability: [],
  },
  {
    id: '2',
    title: 'Professional DSLR Camera',
    description: 'Canon EOS R5 with a 24-70mm f/2.8 lens. Ideal for professional photo and video shoots. Includes two batteries and a 128GB card.',
    owner: userJohn,
    category: 'Electronics',
    dailyRate: 75,
    securityDeposit: 300,
    location: 'Brooklyn, NY',
    rating: 5,
    reviewCount: 2,
    reviews: reviewsForItem2,
    imageUrls: ['https://picsum.photos/seed/102/600/400'],
    availability: [],
  },
  {
    id: '3',
    title: 'Large Event Tent (10x20 ft)',
    description: 'Spacious and sturdy tent for outdoor parties, markets, or events. Easy to set up and provides great shade and rain protection.',
    owner: userEmily,
    category: 'Party & Events',
    dailyRate: 120,
    securityDeposit: 200,
    location: 'Austin, TX',
    rating: 4.8,
    reviewCount: 15,
    reviews: [],
    imageUrls: ['https://picsum.photos/seed/103/600/400'],
    availability: [],
  },
  {
    id: '4',
    title: 'Trek Marlin 5 Mountain Bike',
    description: 'A great all-around mountain bike for trails and paths. Size medium, suitable for riders 5\'5" to 5\'10". Helmet included.',
    owner: userMichael,
    category: 'Sports & Outdoors',
    dailyRate: 40,
    securityDeposit: 100,
    location: 'Denver, CO',
    rating: 4.9,
    reviewCount: 22,
    reviews: [],
    imageUrls: ['https://picsum.photos/seed/104/600/400'],
    availability: [],
  },
  {
    id: '5',
    title: 'Anker Nebula Capsule Projector',
    description: 'A soda-can-sized portable projector with 360° sound. Perfect for movie nights indoors or out. HDMI and USB-C compatible.',
    owner: userJane,
    category: 'Electronics',
    dailyRate: 30,
    securityDeposit: 75,
    location: 'San Francisco, CA',
    rating: 4.7,
    reviewCount: 8,
    reviews: [],
    imageUrls: ['https://picsum.photos/seed/105/600/400'],
    availability: [],
  },
  {
    id: '6',
    title: '4-Person Camping Gear Set',
    description: 'Complete camping setup including a 4-person tent, two sleeping bags, two sleeping pads, and a portable stove. Everything you need for a weekend getaway.',
    owner: userMichael,
    category: 'Sports & Outdoors',
    dailyRate: 65,
    securityDeposit: 150,
    location: 'Denver, CO',
    rating: 4.9,
    reviewCount: 18,
    reviews: [],
    imageUrls: ['https://picsum.photos/seed/106/600/400'],
    availability: [],
  },
];
