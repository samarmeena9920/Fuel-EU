import { useState } from "react";
import { Ship, TrendingUp, PiggyBank, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutesTab } from "@/components/routes-tab";
import { CompareTab } from "@/components/compare-tab";
import { BankingTab } from "@/components/banking-tab";
import { PoolingTab } from "@/components/pooling-tab";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("routes");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[2.5rem] font-light text-foreground">
                FuelEU Maritime
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compliance Balance Tracking & Management Platform
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                  Target Intensity
                </p>
                <p className="text-2xl font-light text-foreground">
                  89.34 <span className="text-sm text-muted-foreground">gCO₂e/MJ</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-card border">
            <TabsTrigger
              value="routes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none uppercase text-xs font-semibold tracking-wider"
              data-testid="tab-routes"
            >
              <Ship className="w-4 h-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none uppercase text-xs font-semibold tracking-wider"
              data-testid="tab-compare"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="banking"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none uppercase text-xs font-semibold tracking-wider"
              data-testid="tab-banking"
            >
              <PiggyBank className="w-4 h-4 mr-2" />
              Banking
            </TabsTrigger>
            <TabsTrigger
              value="pooling"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none uppercase text-xs font-semibold tracking-wider"
              data-testid="tab-pooling"
            >
              <Users className="w-4 h-4 mr-2" />
              Pooling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="mt-0">
            <RoutesTab />
          </TabsContent>

          <TabsContent value="compare" className="mt-0">
            <CompareTab />
          </TabsContent>

          <TabsContent value="banking" className="mt-0">
            <BankingTab />
          </TabsContent>

          <TabsContent value="pooling" className="mt-0">
            <PoolingTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
