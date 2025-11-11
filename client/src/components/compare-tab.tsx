import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const TARGET_INTENSITY = 89.3368;

interface ComparisonData {
  baseline: {
    routeId: string;
    ghgIntensity: number;
    vesselType: string;
    fuelType: string;
    year: number;
  } | null;
  comparisons: Array<{
    routeId: string;
    ghgIntensity: number;
    vesselType: string;
    fuelType: string;
    year: number;
    percentDiff: number;
    compliant: boolean;
  }>;
}

export function CompareTab() {
  const { data, isLoading } = useQuery<ComparisonData>({
    queryKey: ["/api/routes/comparison"],
  });

  const chartData = data?.comparisons.map((comp) => ({
    route: comp.routeId,
    intensity: comp.ghgIntensity,
    target: TARGET_INTENSITY,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[1.75rem] font-normal text-foreground mb-2">Compliance Comparison</h2>
        <p className="text-sm text-muted-foreground">
          Compare routes against baseline and regulatory target of <span className="font-mono font-semibold">{TARGET_INTENSITY.toFixed(4)} gCO₂e/MJ</span>
        </p>
      </div>

      {data?.baseline && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Baseline Route</p>
              <p className="text-2xl font-light text-foreground">{data.baseline.routeId}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.baseline.vesselType} · {data.baseline.fuelType} · {data.baseline.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">GHG Intensity</p>
              <p className="text-[2rem] font-light text-foreground">
                {data.baseline.ghgIntensity.toFixed(2)}
                <span className="text-sm text-muted-foreground ml-2">gCO₂e/MJ</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && !data?.baseline && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No baseline route has been set yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Go to the Routes tab to set a baseline route for comparison.</p>
        </Card>
      )}

      {data?.baseline && (
        <>
          <Card className="p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Comparison Table</h3>
            <div className="border rounded-md">
              <div className="max-h-[400px] overflow-y-auto">
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
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">% Difference</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">Loading comparison data...</p>
                        </TableCell>
                      </TableRow>
                    ) : data.comparisons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <p className="text-sm text-muted-foreground">No routes available for comparison.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.comparisons.map((comp) => (
                        <TableRow
                          key={comp.routeId}
                          className="hover-elevate transition-colors"
                          data-testid={`row-comparison-${comp.routeId}`}
                        >
                          <TableCell className="font-medium">{comp.routeId}</TableCell>
                          <TableCell>{comp.vesselType}</TableCell>
                          <TableCell>{comp.fuelType}</TableCell>
                          <TableCell>{comp.year}</TableCell>
                          <TableCell className="text-right font-mono">{comp.ghgIntensity.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-mono font-semibold ${comp.percentDiff > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {comp.percentDiff > 0 ? '+' : ''}{comp.percentDiff.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {comp.compliant ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-semibold uppercase tracking-wider text-green-600">Compliant</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-destructive" />
                                  <span className="text-xs font-semibold uppercase tracking-wider text-destructive">Non-Compliant</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {chartData.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">GHG Intensity Comparison Chart</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="route"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="square"
                    />
                    <ReferenceLine
                      y={TARGET_INTENSITY}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="5 5"
                      label={{ value: 'Target', position: 'right', fontSize: 11 }}
                    />
                    <Bar dataKey="intensity" fill="hsl(var(--chart-1))" name="GHG Intensity" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
