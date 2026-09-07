"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Bell, Boxes, Building2, CircleDollarSign, LayoutDashboard, Loader2, PackagePlus, RefreshCw, Search, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, type DashboardSummary, type Order, type Product } from "@/lib/api";

const emptySummary: DashboardSummary = { revenueToday: 0, ordersToday: 0, activeProducts: 0, lowStockProducts: 0, totalCustomers: 0 };
const nav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Orders", icon: ShoppingBag, count: "12" },
  { label: "Products", icon: Boxes },
  { label: "Customers", icon: Users },
  { label: "Analytics", icon: BarChart3 },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState(emptySummary);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stock, setStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [renderedAt] = useState(() => Date.now());
  const filtered = useMemo(() => orders.filter((o) => `${o.orderNumber} ${o.customer.name}`.toLowerCase().includes(query.toLowerCase())), [orders, query]);

  async function loadDashboard() {
    setLoading(true); setError("");
    try {
      const [dashboard, recentOrders, lowStock] = await Promise.all([api.dashboard(), api.orders(), api.lowStock()]);
      setSummary(dashboard); setOrders(recentOrders); setStock(lowStock.slice(0, 3));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not connect to the BizFlow API.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    Promise.all([api.dashboard(), api.orders(), api.lowStock()])
      .then(([dashboard, recentOrders, lowStock]) => {
        if (!active) return;
        setSummary(dashboard); setOrders(recentOrders); setStock(lowStock.slice(0, 3));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not connect to the BizFlow API.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function saveProduct() {
    setSaving(true); setError("");
    try {
      await api.createProduct({ name: productName.trim(), sku: sku.trim(), price: Number(price), initialStock: Number(initialStock), reorderLevel: 5 });
      setProductName(""); setSku(""); setPrice(""); setInitialStock("");
      setDialogOpen(false);
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Product could not be created.");
    } finally { setSaving(false); }
  }

  const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
  const relativeTime = (createdAt: string) => {
    const minutes = Math.max(0, Math.round((renderedAt - new Date(createdAt).getTime()) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
    return `${Math.floor(minutes / 1440)} d ago`;
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0 bg-[#0c1b2a] text-white">
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f5b943] text-[#102333]"><Building2 className="size-5" /></div>
            <div className="group-data-[collapsible=icon]:hidden"><p className="text-lg font-bold">BizFlow 360</p><p className="text-xs text-slate-400">Business workspace</p></div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-400">Workspace</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>
              {nav.map((item) => <SidebarMenuItem key={item.label}>
                <SidebarMenuButton tooltip={item.label} isActive={item.active} className="h-10 text-slate-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-[#f5b943] data-[active=true]:text-[#102333]">
                  <item.icon /><span>{item.label}</span>
                </SidebarMenuButton>
                {item.count && <SidebarMenuBadge className="text-slate-300">{item.count}</SidebarMenuBadge>}
              </SidebarMenuItem>)}
            </SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="rounded-xl bg-white/8 p-3 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">Growth plan</p><p className="mt-1 text-xs text-slate-400">18 days left in your trial</p>
            <Progress value={62} className="mt-3 bg-white/10 [&>div]:bg-[#f5b943]" />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f3f6f8] text-[#102333]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3"><SidebarTrigger />
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Search orders" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders or customers" className="h-10 w-72 rounded-xl bg-slate-50 pl-9" /></div>
          </div>
          <div className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button><span className="grid size-9 place-items-center rounded-xl bg-[#d9e8e8] font-bold text-[#155e63]">BT</span><div className="hidden sm:block"><p className="text-sm font-semibold">BWise Trading</p><p className="text-xs text-slate-500">Owner</p></div></div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] p-4 md:p-7">
          <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="mb-1 text-sm font-semibold text-[#16747a]">MONDAY, SEPTEMBER 7</p><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Good morning, Temi</h1><p className="mt-2 text-slate-500">Here is what is happening across your business today.</p></div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button className="h-11 rounded-xl bg-[#16747a] px-5 hover:bg-[#105f64]"><PackagePlus /> Add product</Button></DialogTrigger>
              <DialogContent className="rounded-2xl"><DialogHeader><DialogTitle>Add a product</DialogTitle><DialogDescription>Create a new inventory item for your store.</DialogDescription></DialogHeader>
                <label htmlFor="product-name" className="space-y-2 text-sm font-semibold">Product name<Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Premium gift box" /></label>
                <label htmlFor="product-sku" className="space-y-2 text-sm font-semibold">SKU<Input id="product-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PH-220" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label htmlFor="product-price" className="space-y-2 text-sm font-semibold">Price<Input id="product-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49.95" /></label>
                  <label htmlFor="product-stock" className="space-y-2 text-sm font-semibold">Opening stock<Input id="product-stock" type="number" min="0" step="1" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} placeholder="20" /></label>
                </div>
                <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button disabled={saving || !productName.trim() || !sku.trim() || price === "" || initialStock === ""} onClick={() => void saveProduct()} className="bg-[#16747a]">{saving && <Loader2 className="animate-spin" />}Save product</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </section>

          {error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"><span><strong>API connection problem:</strong> {error}</span><Button variant="outline" size="sm" onClick={() => void loadDashboard()}><RefreshCw /> Try again</Button></div>}
          {loading && <div className="mb-5 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" />Loading live business data…</div>}

          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Business summary">
            {[
              ["Today’s revenue", money.format(summary.revenueToday), "From paid and active orders", CircleDollarSign, "teal"],
              ["Orders today", String(summary.ordersToday), "Created since midnight UTC", ShoppingBag, "gold"],
              ["Active products", String(summary.activeProducts), `${summary.lowStockProducts} low in stock`, Boxes, "blue"],
              ["Total customers", String(summary.totalCustomers), "Saved customer accounts", Users, "coral"],
            ].map(([label, value, note, Icon, tone]) => <article key={String(label)} className="metric-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500">{String(label)}</p><p className="mt-2 text-3xl font-bold">{String(value)}</p></div><span className={`metric-icon ${tone}`}>{typeof Icon !== "string" && <Icon className="size-5" />}</span></div>
              <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-600"><TrendingUp className="size-4 text-[#16856f]" />{String(note)}</p>
            </article>)}
          </section>

          <section className="mb-7 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="text-lg font-bold">Sales overview</h2><p className="text-sm text-slate-500">Revenue for the last 7 days</p></div><Badge variant="outline">$19,420 total</Badge></div>
              <div className="chart-grid flex h-64 items-end justify-between gap-3 p-5 pt-8" aria-label="Seven day sales chart">
                {[42,68,54,82,70,96,74].map((height, i) => <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2 text-center"><div className="flex flex-1 items-end justify-center"><div className="w-full max-w-12 rounded-t-lg bg-[#16747a] hover:bg-[#f5b943]" style={{height:`${height}%`}} /></div><span className="text-xs text-slate-500">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span></div>)}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex justify-between"><div><h2 className="text-lg font-bold">Low stock</h2><p className="text-sm text-slate-500">Restock before you run out</p></div><span className="grid size-10 place-items-center rounded-xl bg-red-50 text-[#d64f3c]"><AlertTriangle className="size-5" /></span></div>
              <div className="space-y-5">{stock.map((item) => <div key={item.sku}><div className="mb-2 flex justify-between"><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.sku}</p></div><p className="text-sm font-bold text-[#d64f3c]">{item.quantityInStock} left</p></div><Progress value={Math.min(100, item.reorderLevel ? (item.quantityInStock / item.reorderLevel) * 100 : 100)} className="h-1.5 bg-slate-100 [&>div]:bg-[#e36a56]" /></div>)}{!loading && stock.length === 0 && <p className="text-sm text-slate-500">All products have healthy stock levels.</p>}</div>
              <Button variant="outline" className="mt-6 w-full rounded-xl">Review inventory</Button>
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="text-lg font-bold">Recent orders</h2><p className="text-sm text-slate-500">Live activity from every sales channel</p></div><Button variant="ghost" className="text-[#16747a]">View all</Button></div>
            <Table><TableHeader><TableRow className="bg-slate-50"><TableHead className="pl-5">Order</TableHead><TableHead>Customer</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead className="pr-5 text-right">Time</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((o) => <TableRow key={o.id}><TableCell className="pl-5 font-semibold">{o.orderNumber}</TableCell><TableCell>{o.customer.name}</TableCell><TableCell className="text-slate-500">Direct</TableCell><TableCell><Badge className={o.status === "Processing" || o.status === "Pending" ? "bg-amber-50 text-amber-700" : o.status === "Cancelled" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}>{o.status}</Badge></TableCell><TableCell className="font-semibold">{money.format(o.total)}</TableCell><TableCell className="pr-5 text-right text-slate-500">{relativeTime(o.createdAt)}</TableCell></TableRow>)}{!loading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">No matching orders found.</TableCell></TableRow>}</TableBody>
            </Table>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
