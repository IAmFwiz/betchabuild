export interface KalshiMarket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'settled';
  close_time: string;
  settlement_time?: string;
  event_ticker: string;
  series_ticker: string;
  ticker: string;
  volume: number;
  open_interest: number;
  last_price?: number;
  yes_bid?: number;
  yes_ask?: number;
  no_bid?: number;
  no_ask?: number;
  outcome: 'yes' | 'no' | 'settled';
  settlement_value?: number;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface KalshiEvent {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'settled';
  close_time: string;
  settlement_time?: string;
  ticker: string;
  category: string;
  tags: string[];
  markets: KalshiMarket[];
  created_at: string;
  updated_at: string;
}

export interface KalshiSeries {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'settled';
  close_time: string;
  ticker: string;
  category: string;
  tags: string[];
  events: KalshiEvent[];
  created_at: string;
  updated_at: string;
}

export interface KalshiOrderBook {
  yes_orders: KalshiOrder[];
  no_orders: KalshiOrder[];
  market_id: string;
  timestamp: string;
}

export interface KalshiOrder {
  id: string;
  side: 'buy' | 'sell';
  outcome: 'yes' | 'no';
  price: number;
  size: number;
  remaining_size: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface KalshiTrade {
  id: string;
  market_id: string;
  outcome: 'yes' | 'no';
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export interface KalshiUser {
  id: string;
  username: string;
  email: string;
  balance: number;
  created_at: string;
}

export interface KalshiPosition {
  market_id: string;
  outcome: 'yes' | 'no';
  size: number;
  average_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
}

// API Response types
export interface KalshiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

export interface KalshiPaginatedResponse<T> {
  status: 'success';
  data: T[];
  cursor?: string;
  has_more: boolean;
}

// Market filters
export interface MarketFilters {
  category?: string;
  status?: 'open' | 'closed' | 'settled';
  event_ticker?: string;
  series_ticker?: string;
  limit?: number;
  cursor?: string;
}

// Order creation
export interface CreateOrderRequest {
  market_id: string;
  outcome: 'yes' | 'no';
  side: 'buy' | 'sell';
  price: number;
  size: number;
}

// Market resolution
export interface MarketResolution {
  market_id: string;
  outcome: 'yes' | 'no';
  settlement_value: number;
  resolution_note?: string;
}
