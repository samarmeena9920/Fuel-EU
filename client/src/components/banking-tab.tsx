import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, PiggyBank as PiggyBankIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  adjustedCb: number;
  bankedAmount: number;
}

interface BankingRecord {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}

export function BankingTab() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedShip, setSelectedShip] = useState<string>("");
  const [bankAmount, setBankAmount] = useState<string>("");
  const [applyAmount, setApplyAmount] = useState<string>("");
  const { toast } = useToast();

  const { data: cbData, isLoading: cbLoading } = useQuery<ComplianceBalance[]>({
    queryKey: ["/api/compliance/cb", selectedYear],
    enabled: !!selectedYear,
  });

  const { data: bankRecords } = useQuery<BankingRecord[]>({
    queryKey: ["/api/banking/records", selectedShip, selectedYear],
    enabled: !!selectedShip && !!selectedYear,
  });

  const bankMutation = useMutation({
    mutationFn: async (data: { shipId: string; year: number; amount: number }) => {
      return apiRequest("POST", "/api/banking/bank", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/cb", selectedYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/adjusted-cb", selectedYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/records", selectedShip, selectedYear] });
      setBankAmount("");
      toast({
        title: "Surplus Banked",
        description: "The positive compliance balance has been successfully banked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Banking Failed",
        description: error.message || "Failed to bank surplus.",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { shipId: string; year: number; amount: number }) => {
      return apiRequest("POST", "/api/banking/apply", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/cb", selectedYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/adjusted-cb", selectedYear] });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/records", selectedShip, selectedYear] });
      setApplyAmount("");
      toast({
        title: "Banked Surplus Applied",
        description: "The banked surplus has been successfully applied to the deficit.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply banked surplus.",
        variant: "destructive",
      });
    },
  });

  const selectedShipData = cbData?.find(cb => cb.shipId === selectedShip);
  const canBank = selectedShipData && selectedShipData.cbGco2eq > 0;
  const canApply = selectedShipData && selectedShipData.bankedAmount > 0;

  const years = ["2024", "2025"];
  const ships = Array.from(new Set(cbData?.map(cb => cb.shipId) || []));

  const handleBank = () => {
    if (!selectedShip || !bankAmount) return;
    const amount = parseFloat(bankAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    bankMutation.mutate({ shipId: selectedShip, year: parseInt(selectedYear), amount });
  };

  const handleApply = () => {
    if (!selectedShip || !applyAmount) return;
    const amount = parseFloat(applyAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate({ shipId: selectedShip, year: parseInt(selectedYear), amount });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[1.75rem] font-normal text-foreground mb-2">Banking</h2>
        <p className="text-sm text-muted-foreground">
          Article 20 – Bank positive compliance balance for future use or apply banked surplus to deficits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="mt-2 h-10" data-testid="select-year">
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
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ship ID</Label>
          <Select value={selectedShip} onValueChange={setSelectedShip}>
            <SelectTrigger className="mt-2 h-10" data-testid="select-ship">
              <SelectValue placeholder="Select a ship" />
            </SelectTrigger>
            <SelectContent>
              {ships.map((ship) => (
                <SelectItem key={ship} value={ship}>
                  {ship}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {cbLoading && (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-4">Loading compliance data...</p>
        </Card>
      )}

      {!cbLoading && selectedShip && selectedShipData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Current CB</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-[2rem] font-light ${selectedShipData.cbGco2eq >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {selectedShipData.cbGco2eq.toFixed(2)}
                </p>
                <span className="text-sm text-muted-foreground">tCO₂eq</span>
              </div>
              {selectedShipData.cbGco2eq >= 0 ? (
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Surplus</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 text-destructive">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Deficit</span>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Banked Amount</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[2rem] font-light text-foreground">
                  {selectedShipData.bankedAmount.toFixed(2)}
                </p>
                <span className="text-sm text-muted-foreground">tCO₂eq</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <PiggyBankIcon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Adjusted CB</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-[2rem] font-light ${selectedShipData.adjustedCb >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {selectedShipData.adjustedCb.toFixed(2)}
                </p>
                <span className="text-sm text-muted-foreground">tCO₂eq</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">After banking operations</p>
            </Card>

            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Year</p>
              <p className="text-[2rem] font-light text-foreground">{selectedYear}</p>
              <p className="text-xs text-muted-foreground mt-2">Reporting period</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Bank Surplus</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bank positive compliance balance for future use
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount to Bank (tCO₂eq)
                  </Label>
                  <Input
                    id="bank-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    disabled={!canBank}
                    className="mt-2 h-10"
                    data-testid="input-bank-amount"
                  />
                </div>
                <Button
                  onClick={handleBank}
                  disabled={!canBank || !bankAmount || bankMutation.isPending}
                  className="w-full"
                  data-testid="button-bank-surplus"
                >
                  {bankMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Banking...
                    </>
                  ) : (
                    "Bank Surplus"
                  )}
                </Button>
                {!canBank && (
                  <p className="text-xs text-destructive">No positive balance available to bank</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Apply Banked Surplus</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Apply banked surplus to current deficit
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apply-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount to Apply (tCO₂eq)
                  </Label>
                  <Input
                    id="apply-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={applyAmount}
                    onChange={(e) => setApplyAmount(e.target.value)}
                    disabled={!canApply}
                    className="mt-2 h-10"
                    data-testid="input-apply-amount"
                  />
                </div>
                <Button
                  onClick={handleApply}
                  disabled={!canApply || !applyAmount || applyMutation.isPending}
                  className="w-full"
                  data-testid="button-apply-banked"
                >
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Banked Surplus"
                  )}
                </Button>
                {!canApply && (
                  <p className="text-xs text-destructive">No banked surplus available to apply</p>
                )}
              </div>
            </Card>
          </div>

          {bankRecords && bankRecords.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Banking History</h3>
              <div className="space-y-2">
                {bankRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                    data-testid={`bank-record-${record.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{record.shipId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString()} · Year {record.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-semibold text-green-600">
                        +{record.amountGco2eq.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">tCO₂eq</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!cbLoading && !selectedShip && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Select a ship to view compliance balance and banking options.</p>
        </Card>
      )}
    </div>
  );
}
