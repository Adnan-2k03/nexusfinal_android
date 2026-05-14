import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLayout } from "@/contexts/LayoutContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Zap,
  Shield,
  Check,
  Coins,
  Star,
  Users,
  MessageCircle,
  Mic,
  Sparkles,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionStatus {
  tier: "free" | "pro" | "gold";
  isActive: boolean;
  dailyLimit: number;
  requestsUsedToday: number;
  requestsRemaining: number;
}

interface UserCredits {
  balance: number;
}

const TIER_CONFIG = {
  free: {
    label: "Free",
    icon: Shield,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-muted",
    cost: 0,
    duration: null,
    features: [
      "3 connection requests/day",
      "Basic match feed",
      "Voice channels (join only)",
      "Standard messaging",
      "Daily check-in bonus",
    ],
    locked: [
      "15+ connection requests/day",
      "Priority match visibility",
      "Create voice channels",
      "Profile badge",
    ],
  },
  pro: {
    label: "Pro",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    cost: 150,
    duration: "2 days",
    features: [
      "15 connection requests/day",
      "Priority match visibility",
      "Create voice channels",
      "Pro profile badge",
      "Advanced game filters",
      "All Free features",
    ],
    locked: [],
  },
  gold: {
    label: "Gold",
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/40",
    cost: 300,
    duration: "2 days",
    features: [
      "30 connection requests/day",
      "Top match placement",
      "Unlimited voice channels",
      "Gold crown badge",
      "Priority support",
      "All Pro features",
    ],
    locked: [],
  },
};

function TierCard({
  tier,
  currentTier,
  coins,
  onPurchase,
  isPending,
}: {
  tier: keyof typeof TIER_CONFIG;
  currentTier: "free" | "pro" | "gold";
  coins: number;
  onPurchase: (tier: string) => void;
  isPending: boolean;
}) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  const isCurrent = currentTier === tier;
  const isUpgrade =
    (tier === "pro" && currentTier === "free") ||
    (tier === "gold" && (currentTier === "free" || currentTier === "pro"));
  const canAfford = coins >= config.cost;
  const isGold = tier === "gold";

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200",
        config.borderColor,
        "border-2",
        isCurrent && "ring-2 ring-offset-2 ring-offset-background",
        isGold && "ring-yellow-500/50",
        !isGold && tier === "pro" && "ring-blue-500/50",
        isGold && "shadow-lg shadow-yellow-500/10",
      )}
    >
      {isGold && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-yellow-500 text-yellow-950 gap-1 px-3 py-1 font-semibold">
            <Star className="h-3 w-3" />
            Best Value
          </Badge>
        </div>
      )}

      <CardHeader className={cn("rounded-t-lg", config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-6 w-6", config.color)} />
            <CardTitle className="text-xl">{config.label}</CardTitle>
          </div>
          {isCurrent && (
            <Badge variant="outline" className="text-xs border-current">
              Current
            </Badge>
          )}
        </div>
        <CardDescription>
          {config.cost === 0 ? (
            <span className="text-lg font-bold text-foreground">Free forever</span>
          ) : (
            <span className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-lg font-bold text-foreground">{config.cost} coins</span>
              <span className="text-muted-foreground text-sm">/ {config.duration}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-4 gap-4">
        <ul className="space-y-2 flex-1">
          {config.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
          {config.locked.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {tier !== "free" && (
          <Button
            className={cn(
              "w-full mt-2",
              isGold && "bg-yellow-500 hover:bg-yellow-600 text-yellow-950",
              tier === "pro" && !isGold && "bg-blue-500 hover:bg-blue-600",
            )}
            disabled={isCurrent || isPending || !canAfford}
            onClick={() => onPurchase(tier)}
          >
            {isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Icon className="h-4 w-4 mr-2" />
            )}
            {isCurrent
              ? "Active"
              : !canAfford
                ? `Need ${config.cost - coins} more coins`
                : isUpgrade
                  ? `Upgrade to ${config.label}`
                  : `Get ${config.label}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function PaymentsPage({ currentUserId }: { currentUserId?: string }) {
  const { toast } = useToast();
  const { getContainerClass } = useLayout();

  const { data: status, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    enabled: !!currentUserId,
  });

  const { data: credits } = useQuery<UserCredits>({
    queryKey: ["/api/user/credits"],
    enabled: !!currentUserId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("POST", `/api/subscription/purchase/${tier}`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({
          title: "Subscription activated!",
          description: "Your subscription is now active for 2 days.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Not enough coins or an error occurred.",
        variant: "destructive",
      });
    },
  });

  const currentTier = status?.tier ?? "free";
  const coins = credits?.balance ?? 0;
  const requestsUsed = status?.requestsUsedToday ?? 0;
  const dailyLimit = status?.dailyLimit ?? 3;
  const usagePercent = Math.min(100, (requestsUsed / dailyLimit) * 100);

  return (
    <div className={`${getContainerClass()} mx-auto space-y-8`}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          Subscription Plans
        </h1>
        <p className="text-muted-foreground mt-1">
          Upgrade with your earned coins to unlock more connection requests and premium features
        </p>
      </div>

      {/* Current Status Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg capitalize">
                  {currentTier} Plan
                  {status?.isActive && currentTier !== "free" && (
                    <Badge className="ml-2 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {requestsUsed} of {dailyLimit} daily connection requests used
              </p>
              <Progress value={usagePercent} className="h-2 w-48 mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Coins className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Your Balance</p>
                  <p className="font-bold text-yellow-600 dark:text-yellow-400">{coins} coins</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {(["free", "pro", "gold"] as const).map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            currentTier={currentTier}
            coins={coins}
            onPurchase={(t) => purchaseMutation.mutate(t)}
            isPending={purchaseMutation.isPending}
          />
        ))}
      </div>

      {/* Earn More Coins */}
      <Card className="border-dashed">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-yellow-500/10 shrink-0">
              <Coins className="h-7 w-7 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Need more coins?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Earn coins by completing daily tasks, watching ads, and checking in every day.
                Each rewarded ad gives you coins you can use toward any subscription.
              </p>
            </div>
            <Button variant="outline" className="shrink-0" onClick={() => window.location.href = "/earn"}>
              <Coins className="h-4 w-4 mr-2" />
              Go to Earn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature comparison footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            What do connection requests do?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Connection requests let you apply to join other players' match listings. Higher tiers give you
            more daily requests so you can find your ideal teammates faster.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Shield className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="font-semibold">3/day</p>
              <p className="text-xs text-muted-foreground">Free</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <Zap className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="font-semibold">15/day</p>
              <p className="text-xs text-muted-foreground">Pro</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10">
              <Crown className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="font-semibold">30/day</p>
              <p className="text-xs text-muted-foreground">Gold</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaging feature note */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
        <MessageCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <p>
          Subscriptions are powered by your in-app coin balance. Coins are earned through daily check-ins,
          tasks, and watching rewarded ads — no real-money purchase required.
        </p>
      </div>
    </div>
  );
}
