export const MOCK_MARKETS = [
  { id: "mkt_001", title: "Will BTC exceed $150K by end of 2026?", volume: 892450, createdAt: "2026-03-15T10:00:00Z", cutoffAt: "2026-12-31T23:59:00Z", outcomes: [{ name: "Yes", price: 0.62 }, { name: "No", price: 0.38 }], stats: { trades: 3842 } },
  { id: "mkt_002", title: "Will ETH flip BTC market cap in 2026?", volume: 534200, createdAt: "2026-02-20T08:00:00Z", cutoffAt: "2026-12-31T23:59:00Z", outcomes: [{ name: "Yes", price: 0.08 }, { name: "No", price: 0.92 }], stats: { trades: 1920 } },
  { id: "mkt_003", title: "US Fed rate cut before July 2026?", volume: 1245800, createdAt: "2026-01-10T12:00:00Z", cutoffAt: "2026-07-01T00:00:00Z", outcomes: [{ name: "Yes", price: 0.71 }, { name: "No", price: 0.29 }], stats: { trades: 6103 } },
  { id: "mkt_004", title: "Apple announces AR glasses at WWDC 2026?", volume: 328900, createdAt: "2026-03-28T09:00:00Z", cutoffAt: "2026-06-15T00:00:00Z", outcomes: [{ name: "Yes", price: 0.45 }, { name: "No", price: 0.55 }], stats: { trades: 1455 } },
  { id: "mkt_005", title: "Will SOL surpass $500 in Q2 2026?", volume: 667300, createdAt: "2026-03-01T14:00:00Z", cutoffAt: "2026-06-30T23:59:00Z", outcomes: [{ name: "Yes", price: 0.22 }, { name: "No", price: 0.78 }], stats: { trades: 2780 } },
  { id: "mkt_006", title: "Tesla delivers Robotaxi by Sept 2026?", volume: 445600, createdAt: "2026-02-14T11:00:00Z", cutoffAt: "2026-09-30T23:59:00Z", outcomes: [{ name: "Yes", price: 0.33 }, { name: "No", price: 0.67 }], stats: { trades: 2105 } },
  { id: "mkt_007", title: "Champions League 2026: Real Madrid wins?", volume: 789100, createdAt: "2026-01-20T16:00:00Z", cutoffAt: "2026-05-30T22:00:00Z", outcomes: [{ name: "Real Madrid", price: 0.28 }, { name: "Man City", price: 0.22 }, { name: "Bayern", price: 0.18 }, { name: "Other", price: 0.32 }], stats: { trades: 4210 } },
  { id: "mkt_008", title: "Will Base TVL exceed $20B by June 2026?", volume: 256700, createdAt: "2026-04-01T07:00:00Z", cutoffAt: "2026-06-30T23:59:00Z", outcomes: [{ name: "Yes", price: 0.55 }, { name: "No", price: 0.45 }], stats: { trades: 988 } },
  { id: "mkt_009", title: "OpenAI IPO in 2026?", volume: 1023400, createdAt: "2026-01-05T10:00:00Z", cutoffAt: "2026-12-31T23:59:00Z", outcomes: [{ name: "Yes", price: 0.41 }, { name: "No", price: 0.59 }], stats: { trades: 5320 } },
  { id: "mkt_010", title: "Ethereum Pectra upgrade live by May 2026?", volume: 178500, createdAt: "2026-03-20T13:00:00Z", cutoffAt: "2026-05-31T23:59:00Z", outcomes: [{ name: "Yes", price: 0.82 }, { name: "No", price: 0.18 }], stats: { trades: 760 } },
  { id: "mkt_011", title: "S&P 500 closes above 6500 end of April?", volume: 567800, createdAt: "2026-04-02T09:00:00Z", cutoffAt: "2026-04-30T20:00:00Z", outcomes: [{ name: "Yes", price: 0.58 }, { name: "No", price: 0.42 }], stats: { trades: 3100 } },
  { id: "mkt_012", title: "Will DOGE reach $1 in 2026?", volume: 345200, createdAt: "2026-02-28T15:00:00Z", cutoffAt: "2026-12-31T23:59:00Z", outcomes: [{ name: "Yes", price: 0.05 }, { name: "No", price: 0.95 }], stats: { trades: 1670 } },
];

export const MOCK_MATCHES = [
  { id: "m1", marketTitle: "US Fed rate cut before July 2026?", side: "buy", amount: 5200, price: 0.71, timestamp: "2026-04-09T14:32:10Z", taker: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12" },
  { id: "m2", marketTitle: "Will BTC exceed $150K by end of 2026?", side: "sell", amount: 3100, price: 0.62, timestamp: "2026-04-09T14:28:45Z", taker: "0xabcdef1234567890abcdef1234567890abcdef12" },
  { id: "m3", marketTitle: "OpenAI IPO in 2026?", side: "buy", amount: 8700, price: 0.41, timestamp: "2026-04-09T14:25:03Z", taker: "0x9876543210fedcba9876543210fedcba98765432" },
  { id: "m4", marketTitle: "Champions League 2026: Real Madrid wins?", side: "buy", amount: 1250, price: 0.28, timestamp: "2026-04-09T14:20:18Z", taker: "0xdeadbeef12345678deadbeef12345678deadbeef" },
  { id: "m5", marketTitle: "Will SOL surpass $500 in Q2 2026?", side: "buy", amount: 4400, price: 0.22, timestamp: "2026-04-09T14:18:55Z", taker: "0x1111222233334444555566667777888899990000" },
  { id: "m6", marketTitle: "US Fed rate cut before July 2026?", side: "buy", amount: 12600, price: 0.715, timestamp: "2026-04-09T14:15:30Z", taker: "0xaaaa1111bbbb2222cccc3333dddd4444eeee5555" },
  { id: "m7", marketTitle: "S&P 500 closes above 6500 end of April?", side: "sell", amount: 2800, price: 0.58, timestamp: "2026-04-09T14:12:20Z", taker: "0x5555aaaa6666bbbb7777cccc8888dddd9999eeee" },
  { id: "m8", marketTitle: "Will BTC exceed $150K by end of 2026?", side: "buy", amount: 15300, price: 0.625, timestamp: "2026-04-09T14:10:08Z", taker: "0xfedcba0987654321fedcba0987654321fedcba09" },
  { id: "m9", marketTitle: "Tesla delivers Robotaxi by Sept 2026?", side: "sell", amount: 950, price: 0.33, timestamp: "2026-04-09T14:05:44Z", taker: "0x12340bcd56780fgh12340bcd56780fgh12345678" },
  { id: "m10", marketTitle: "Will ETH flip BTC market cap in 2026?", side: "buy", amount: 6200, price: 0.08, timestamp: "2026-04-09T14:01:12Z", taker: "0xabababababababababababababababababababab12" },
  { id: "m11", marketTitle: "OpenAI IPO in 2026?", side: "sell", amount: 3300, price: 0.405, timestamp: "2026-04-09T13:58:30Z", taker: "0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd12" },
  { id: "m12", marketTitle: "Apple announces AR glasses at WWDC 2026?", side: "buy", amount: 7800, price: 0.45, timestamp: "2026-04-09T13:55:00Z", taker: "0xefefefefefefefefefefefefefefefefefefefef12" },
];

export const MOCK_POSITIONS = [
  { marketTitle: "Will BTC exceed $150K by end of 2026?", outcome: "Yes", shares: 840, avgPrice: 0.58, currentPrice: 0.62, pnl: 33.6 },
  { marketTitle: "US Fed rate cut before July 2026?", outcome: "Yes", shares: 1500, avgPrice: 0.65, currentPrice: 0.71, pnl: 90.0 },
  { marketTitle: "Will SOL surpass $500 in Q2 2026?", outcome: "No", shares: 600, avgPrice: 0.72, currentPrice: 0.78, pnl: 36.0 },
  { marketTitle: "OpenAI IPO in 2026?", outcome: "Yes", shares: 2200, avgPrice: 0.44, currentPrice: 0.41, pnl: -66.0 },
];
