// Mock data for Tally-style accounting modules (no persistence)

export const defaultLedgers = [
  { id: "L1", name: "Cash", group: "Cash in hand", openingBalance: 125000, type: "debit" },
  { id: "L2", name: "Bank - HDFC", group: "Bank accounts", openingBalance: 840000, type: "debit" },
  { id: "L3", name: "Sundry Debtors", group: "Sundry debtors", openingBalance: 320000, type: "debit" },
  { id: "L4", name: "Sales", group: "Sales accounts", openingBalance: 0, type: "credit" },
  { id: "L5", name: "Purchases", group: "Purchase accounts", openingBalance: 0, type: "debit" },
  { id: "L6", name: "GST Payable", group: "Duties & taxes", openingBalance: 42000, type: "credit" },
  { id: "L7", name: "Sundry Creditors", group: "Sundry creditors", openingBalance: 180000, type: "credit" },
  { id: "L8", name: "Capital", group: "Capital account", openingBalance: 500000, type: "credit" },
];

export const defaultJournalEntries = [
  { id: "JE-001", date: "2025-01-12", narration: "Sales for the day", entries: [{ ledger: "Cash", debit: 15000, credit: 0 }, { ledger: "Sales", debit: 0, credit: 15000 }], totalDebit: 15000, totalCredit: 15000 },
  { id: "JE-002", date: "2025-01-11", narration: "Purchase inventory", entries: [{ ledger: "Purchases", debit: 25000, credit: 0 }, { ledger: "Sundry Creditors", debit: 0, credit: 25000 }], totalDebit: 25000, totalCredit: 25000 },
  { id: "JE-003", date: "2025-01-10", narration: "Payment to creditor", entries: [{ ledger: "Sundry Creditors", debit: 20000, credit: 0 }, { ledger: "Bank - HDFC", debit: 0, credit: 20000 }], totalDebit: 20000, totalCredit: 20000 },
];

export const defaultInvoices = [
  { id: "INV-2025-001", type: "sales", party: "Arjun Mehta", date: "2025-01-12", amount: 4299, gst: 657, total: 4956, status: "paid", items: [{ desc: "Milano Round Titanium", qty: 1, rate: 4299, amount: 4299 }] },
  { id: "INV-2025-002", type: "sales", party: "Priya Nair", date: "2025-01-12", amount: 1899, gst: 342, total: 2241, status: "pending", items: [{ desc: "Hex Screen Shield", qty: 1, rate: 1899, amount: 1899 }] },
  { id: "PUR-2025-001", type: "purchase", party: "Optical Supplies Ltd", date: "2025-01-10", amount: 45000, gst: 8100, total: 53100, status: "paid", items: [{ desc: "Frames batch #12", qty: 50, rate: 900, amount: 45000 }] },
];

export const hsnSacCodes = [
  { code: "9004", desc: "Spectacle lenses, frames", gstRate: 12 },
  { code: "9004 10", desc: "Sun glasses", gstRate: 12 },
  { code: "9983", desc: "Information technology support", gstRate: 18 },
  { code: "9985", desc: "Advertising and marketing", gstRate: 18 },
];

export const defaultPayments = [
  { id: "PAY-001", date: "2025-01-12", type: "receipt", party: "Arjun Mehta", amount: 4956, mode: "UPI", ref: "UPI-xxx", invoiceId: "INV-2025-001" },
  { id: "PAY-002", date: "2025-01-11", type: "payment", party: "Optical Supplies Ltd", amount: 53100, mode: "Bank transfer", ref: "NEFT-xxx", invoiceId: "PUR-2025-001" },
  { id: "PAY-003", date: "2025-01-10", type: "receipt", party: "Kabir Sethi", amount: 5499, mode: "Card", ref: "TXN-xxx", invoiceId: null },
];

export const defaultBankReconciliation = [
  { date: "2025-01-12", particulars: "Opening balance", bank: 820000, book: 820000, match: true },
  { date: "2025-01-12", particulars: "NEFT credit - Arjun Mehta", bank: 4956, book: 4956, match: true },
  { date: "2025-01-11", particulars: "NEFT debit - Optical Supplies", bank: -53100, book: -53100, match: true },
  { date: "2025-01-14", particulars: "Cheque #1001 not yet cleared", bank: 0, book: -15000, match: false },
];
