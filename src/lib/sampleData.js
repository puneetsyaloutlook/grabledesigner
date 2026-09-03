// Fixed sample dataset. Deliberately includes the edge cases the decisions
// and standards need to demonstrate: a genuine zero, a not-applicable value,
// a negative number, and long text that needs truncation.

export const sampleColumns = [
  { key: 'id', label: 'Claim ID', tier: 'low', type: 'text', width: 100 },
  { key: 'customer', label: 'Customer', tier: 'low', type: 'text', width: 160 },
  { key: 'amount', label: 'Amount', tier: 'low', type: 'currency', width: 110 },
  { key: 'status', label: 'Status', tier: 'low', type: 'status', width: 120 },
  { key: 'submitted', label: 'Submitted', tier: 'mid', type: 'date', width: 120 },
  { key: 'assignee', label: 'Assignee', tier: 'mid', type: 'text', width: 140, editable: true },
  { key: 'priority', label: 'Priority', tier: 'mid', type: 'text', width: 100 },
  { key: 'variance', label: 'Variance', tier: 'mid', type: 'number', width: 100 },
  { key: 'region', label: 'Region', tier: 'high', type: 'text', width: 120 },
  { key: 'channel', label: 'Channel', tier: 'high', type: 'text', width: 110 },
  { key: 'updated', label: 'Last updated', tier: 'high', type: 'date', width: 130 },
  { key: 'notes', label: 'Notes', tier: 'high', type: 'text', width: 260, truncate: true },
];

export const sampleRows = [
  { id: 'CLM-1042', customer: 'Aroha Ngata', amount: 2450, status: 'Open', submitted: '2026-08-11', assignee: 'S. Patel', priority: 'High', variance: -120, region: 'NSW', channel: 'Phone', updated: '2026-08-29', notes: 'Customer reported delayed delivery affecting a scheduled event; escalated to logistics for expedited replacement shipment and offered partial refund pending outcome.' },
  { id: 'CLM-1043', customer: 'Ben Whitfield', amount: 0, status: 'Closed', submitted: '2026-08-09', assignee: 'S. Patel', priority: 'Low', variance: 0, region: 'VIC', channel: 'Email', updated: '2026-08-20', notes: 'Duplicate submission, closed with no action.' },
  { id: 'CLM-1044', customer: 'Priya Chandran', amount: 890, status: 'In review', submitted: '2026-08-14', assignee: null, priority: 'Medium', variance: 40, region: 'QLD', channel: 'Web', updated: '2026-08-27', notes: 'Requires manager sign-off before further processing can continue.' },
  { id: 'CLM-1045', customer: 'Liam O’Connor', amount: 5200, status: 'Open', submitted: '2026-08-05', assignee: 'R. Kim', priority: 'High', variance: -310, region: 'WA', channel: 'Phone', updated: '2026-08-28', notes: 'Large claim, second opinion requested from underwriting before approval.' },
  { id: 'CLM-1046', customer: 'Mele Tupou', amount: 130, status: 'Approved', submitted: '2026-08-18', assignee: 'R. Kim', priority: 'Low', variance: 5, region: 'NSW', channel: 'App', updated: '2026-08-19', notes: 'Straightforward, approved same day.' },
];
