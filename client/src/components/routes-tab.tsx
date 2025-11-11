import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Route } from "@shared/schema";

export function RoutesTab() {
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>("all");
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const setBaselineMutation = useMutation({
    mutationFn: async (routeId: number) => {
      return apiRequest("POST", `/api/routes/${routeId}/baseline`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/routes/comparison"] });
      toast({
        title: "Baseline Updated",
        description: "The baseline route has been successfully set.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set baseline route.",
        variant: "destructive",
      });
    },
  });

  const filteredRoutes = routes?.filter((route) => {
    if (vesselTypeFilter !== "all" && route.vesselType !== vesselTypeFilter) return false;
    if (fuelTypeFilter !== "all" && route.fuelType !== fuelTypeFilter) return false;
    if (yearFilter !== "all" && route.year.toString() !== yearFilter) return false;
    return true;
  });

  const vesselTypes = Array.from(new Set(routes?.map(r => r.vesselType) || []));
  const fuelTypes = Array.from(new Set(routes?.map(r => r.fuelType) || []));
  const years = Array.from(new Set(routes?.map(r => r.year) || [])).sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[1.75rem] font-normal text-foreground mb-2">Routes</h2>
        <p className="text-sm text-muted-foreground">
          Manage maritime routes and set baseline for compliance comparison
        </p>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 items-center mb-6">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Vessel Type
            </label>
            <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
              <SelectTrigger className="h-10" data-testid="filter-vessel-type">
                <SelectValue placeholder="All vessel types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessel Types</SelectItem>
                {vesselTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Fuel Type
            </label>
            <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
              <SelectTrigger className="h-10" data-testid="filter-fuel-type">
                <SelectValue placeholder="All fuel types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                {fuelTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Year
            </label>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-10" data-testid="filter-year">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Route ID</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Vessel Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Fuel Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Year</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                    GHG Intensity
                    <span className="block text-[0.65rem] font-normal text-muted-foreground">gCO₂e/MJ</span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                    Fuel Consumption
                    <span className="block text-[0.65rem] font-normal text-muted-foreground">tonnes</span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                    Distance
                    <span className="block text-[0.65rem] font-normal text-muted-foreground">km</span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                    Total Emissions
                    <span className="block text-[0.65rem] font-normal text-muted-foreground">tonnes</span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading routes...</p>
                    </TableCell>
                  </TableRow>
                ) : !filteredRoutes || filteredRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <p className="text-sm text-muted-foreground">No routes found matching the selected filters.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map((route) => (
                    <TableRow
                      key={route.id}
                      className="hover-elevate transition-colors"
                      data-testid={`row-route-${route.routeId}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {route.routeId}
                          {route.isBaseline && (
                            <Check className="w-4 h-4 text-primary" data-testid={`baseline-indicator-${route.routeId}`} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{route.vesselType}</TableCell>
                      <TableCell>{route.fuelType}</TableCell>
                      <TableCell>{route.year}</TableCell>
                      <TableCell className="text-right font-mono">{route.ghgIntensity.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{route.fuelConsumption.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{route.distance.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{route.totalEmissions.toLocaleString()}</TableCell>
                      <TableCell>
                        {route.isBaseline ? (
                          <span className="text-xs text-primary font-semibold uppercase tracking-wider">Baseline</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBaselineMutation.mutate(route.id)}
                            disabled={setBaselineMutation.isPending}
                            data-testid={`button-set-baseline-${route.routeId}`}
                          >
                            {setBaselineMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Set Baseline"
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
