export type PlatformUser = {
  id: string;
  publicAlias: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  city?: string;
  passwordHash: string;
  createdAt: string;
};

export type PlatformSession = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
};

export type PlatformInterest = {
  id: string;
  userId: string;
  lotSlug: string;
  createdAt: string;
};

export type PlatformPreBid = {
  id: string;
  userId: string;
  lotSlug: string;
  amountCents: number;
  note?: string;
  createdAt: string;
};

export type PlatformActivityKind =
  | "lot_available"
  | "user_registered"
  | "interest_registered"
  | "prebid_registered"
  | "lot_created"
  | "lot_updated"
  | "lot_status_changed"
  | "operational_note";

export type PlatformActivity = {
  id: string;
  kind: PlatformActivityKind;
  createdAt: string;
  lotSlug?: string;
  actorUserId?: string;
  actorPublicAlias?: string;
  amountCents?: number;
};

export type PlatformStore = {
  version: number;
  users: PlatformUser[];
  sessions: PlatformSession[];
  interests: PlatformInterest[];
  preBids: PlatformPreBid[];
  activities: PlatformActivity[];
};

export type AuthenticatedUser = Omit<PlatformUser, "cpf" | "passwordHash">;

export type ActivityFeedItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lotSlug?: string;
  lotCode?: string;
};

export type LotPlatformSnapshot = {
  lotSlug: string;
  onlineStatusLabel: string;
  teaserLabel: string;
  supportLabel: string;
  referenceValueCents: number;
  referenceValueLabel: string;
  visibleValueCents: number;
  visibleValueLabel: string;
  visibleValueKind: "reference" | "prebid";
  minimumIncrementCents: number;
  minimumIncrementLabel: string;
  nextAllowedAmountCents: number;
  nextAllowedAmountLabel: string;
  viewerIsAuthenticated: boolean;
  interestEnabled: boolean;
  viewerHasInterest: boolean;
  preBidEnabled: boolean;
  preBidMessage: string;
  viewerHighestPreBidCents?: number;
  viewerHighestPreBidLabel?: string;
  recentActivity: ActivityFeedItem[];
};

export type DashboardInterest = {
  id: string;
  lotSlug: string;
  lotCode: string;
  lotTitle: string;
  location: string;
  createdAt: string;
  referenceValueLabel: string;
  visibleValueLabel: string;
};

export type DashboardPreBid = {
  id: string;
  lotSlug: string;
  lotCode: string;
  lotTitle: string;
  location: string;
  amountLabel: string;
  createdAt: string;
  currentValueLabel: string;
};

export type UserDashboard = {
  user: AuthenticatedUser;
  interests: DashboardInterest[];
  preBids: DashboardPreBid[];
  activity: ActivityFeedItem[];
};
