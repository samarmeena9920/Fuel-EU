import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Users as UsersIcon, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AdjustedCB {
  shipId: string;
  year: number;
  adjustedCb: number;
}

interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export function PoolingTab() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedShips, setSelectedShips] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: adjustedCbData, isLoading } = useQuery<AdjustedCB[]>({
    queryKey: ["/api/compliance/adjusted-cb", selectedYear],
    enabled: !!selectedYear,
  });

  const createPoolMutation = useMutation({
    mutationFn: async (data: { year: number; members: { shipId: string; cbBefore: number }[] }) => {
      return apiRequest("POST", "/api/pools", data);
    },
    onSuccess: (data: { poolId: number; members: PoolMember[] }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/adjusted-cb", selectedYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/cb", selectedYear] });
      setSelectedShips(new Set());
      toast({
        title: "Pool Created Successfully",
        description: `Pool created with ${data.members.length} members.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Pool Creation Failed",
        description: error.message || "Failed to create pool.",
        variant: "destructive",
      });
    },
  });

  const toggleShip = (shipId: string) => {
    const newSelected = new Set(selectedShips);
    if (newSelected.has(shipId)) {
      newSelected.delete(shipId);
    } else {
      newSelected.add(shipId);
    }
    setSelectedShips(newSelected);
  };

  const selectedShipsData = adjustedCbData?.filter(cb => selectedShips.has(cb.shipId)) || [];
  const poolSum = selectedShipsData.reduce((sum, cb) => sum + cb.adjustedCb, 0);
  const isValidPool = poolSum >= 0 && selectedShipsData.length >= 2;

  const deficitShips = selectedShipsData.filter(cb => cb.adjustedCb < 0);
  const surplusShips = selectedShipsData.filter(cb => cb.adjustedCb > 0);

  const handleCreatePool = () => {
    if (!isValidPool) return;

    const members = selectedShipsData.map(cb => ({
      shipId: cb.shipId,
      cbBefore: cb.adjustedCb,
    }));

    createPoolMutation.mutate({
      year: parseInt(selectedYear),
      members,
    });
  };

  const years = ["2024", "2025"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[1.75rem] font-normal text-foreground mb-2">Pooling</h2>
        <p className="text-sm text-muted-foreground">
          Article 21 – Create compliance pools to redistribute adjusted CB across multiple ships
        </p>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="mt-2 h-10 max-w-xs" data-testid="select-pool-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-4">Loading ship compliance data...</p>
        </Card>
      )}

      {!isLoading && adjustedCbData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Select Pool Members</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select at least 2 ships to create a compliance pool. The total adjusted CB must be non-negative.
              </p>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {adjustedCbData.map((cb) => (
                  <div
                    key={cb.shipId}
                    className={`flex items-center justify-between p-4 border rounded-md hover-elevate transition-colors ${
                      selectedShips.has(cb.shipId) ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                    data-testid={`pool-member-${cb.shipId}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={selectedShips.has(cb.shipId)}
                        onCheckedChange={() => toggleShip(cb.shipId)}
                        data-testid={`checkbox-ship-${cb.shipId}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{cb.shipId}</p>
                        <p className="text-xs text-muted-foreground">Year {cb.year}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-mono font-semibold ${cb.adjustedCb >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {cb.adjustedCb >= 0 ? '+' : ''}{cb.adjustedCb.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">Adjusted CB (tCO₂eq)</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Pool Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Selected Ships</p>
                  <p className="text-[2rem] font-light text-foreground">{selectedShipsData.length}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Total Pool CB</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-[2rem] font-light ${poolSum >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {poolSum >= 0 ? '+' : ''}{poolSum.toFixed(2)}
                    </p>
                    <span className="text-sm text-muted-foreground">tCO₂eq</span>
                  </div>
                </div>

                {selectedShipsData.length > 0 && (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pool Composition</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Surplus Ships</span>
                          <span className="text-sm font-semibold text-green-600">{surplusShips.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Deficit Ships</span>
                          <span className="text-sm font-semibold text-destructive">{deficitShips.length}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className={`p-6 ${isValidPool ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : selectedShipsData.length > 0 ? 'bg-destructive/10 border-destructive/30' : ''}`}>
              <div className="flex items-start gap-3 mb-4">
                {isValidPool ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : selectedShipsData.length > 0 ? (
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-1">
                    {isValidPool ? 'Valid Pool' : selectedShipsData.length > 0 ? 'Invalid Pool' : 'Validation Status'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {isValidPool
                      ? 'This pool meets all requirements and can be created.'
                      : selectedShipsData.length < 2
                      ? 'Select at least 2 ships to create a pool.'
                      : poolSum < 0
                      ? 'Total pool CB must be non-negative.'
                      : 'Pool configuration is invalid.'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreatePool}
                disabled={!isValidPool || createPoolMutation.isPending}
                className="w-full"
                data-testid="button-create-pool"
              >
                {createPoolMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Pool...
                  </>
                ) : (
                  <>
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Create Pool
                  </>
                )}
              </Button>
            </Card>

            {selectedShipsData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Selected Members</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedShipsData.map((cb) => (
                    <div key={cb.shipId} className="flex items-center justify-between p-2 border rounded text-sm">
                      <span className="font-medium">{cb.shipId}</span>
                      <span className={`font-mono ${cb.adjustedCb >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {cb.adjustedCb >= 0 ? '+' : ''}{cb.adjustedCb.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {!isLoading && (!adjustedCbData || adjustedCbData.length === 0) && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No ship compliance data available for the selected year.</p>
          <p className="text-sm text-muted-foreground mt-2">Ships must have compliance balance records to participate in pooling.</p>
        </Card>
      )}
    </div>
  );
}
