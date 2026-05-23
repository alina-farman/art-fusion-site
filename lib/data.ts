export type UserRole = "buyer" | "artist" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  joinedDate: string;
  bio?: string;
  location?: string;
  totalSales?: number;
  totalRevenue?: number;
}

export interface Artwork {
  id: string;
  title: string;
  artist: User;
  price: number;
  image: string;

  // ✅ NEW CATEGORY SYSTEM (matches CATEGORIES.ts)
  category:
    | "paintings"
    | "sketching"
    | "digital"
    | "handmade"
    | "cartoon";

  subcategory?: string;
  medium?: string;

  style: "abstract" | "realism" | "modern" | "surreal";

  description: string;
  dimensions: string;
  year: number;

  likes: number;
  views: number;
  inStock: boolean;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}