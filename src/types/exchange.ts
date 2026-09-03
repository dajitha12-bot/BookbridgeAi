export type ExchangeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface Exchange {
  id: string;
  senderId: string;
  receiverId: string;
  offeredBookId: string;
  requestedBookId: string;
  status: ExchangeStatus;
  createdAt: string;
}

export interface SwapChainMember {
  userId: string;
  userName?: string;
  offeredBookId: string;
  offeredBookTitle?: string;
  requestedBookId: string;
  requestedBookTitle?: string;
}

export interface SwapChain {
  id: string;
  members: SwapChainMember[];
  status: 'PROPOSED' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}
