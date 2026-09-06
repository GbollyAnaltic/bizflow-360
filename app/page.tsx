"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Bell, Boxes, Building2, CircleDollarSign, LayoutDashboard, PackagePlus, Search, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  { id: "#BF-1084", customer: "Amara Foods", channel: "Online", total: "$284.50", status: "Paid", time: "10 min ago" },
  { id: "#BF-1083", customer: "Noah Williams", channel: "In-store", total: "$96.00", status: "Ready", time: "32 min ago" },
  { id: "#BF-1082", customer: "Maple Events", channel: "Online", total: "$438.20", status: "Processing", time: "1 hr ago" },
  { id: "#BF-1081", customer: "Liam Chen", channel: "In-store", total: "$64.75", status: "Paid", time: "2 hrs ago" },
];
const stock = [
  { name: "Classic gift box", sku: "GB-102", left: 3, level: 18 },
  { name: "Vanilla candle", sku: "VC-044", left: 6, level: 30 },
  { name: "Ceramic mug", sku: "CM-118", left: 8, level: 40 },
];
const nav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Orders", icon: ShoppingBag, count: "12" },
  { label: "Products", icon: Boxes },
  { label: "Customers", icon: Users },
  { label: "Analytics", icon: BarChart3 },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState(248);
  const [productName, setProductName] = useState("");
  const filtered = useMemo(() => orders.filter((o) => `${o.id} ${o.customer}`.toLowerCase().includes(query.toLowerCase())), [query]);

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
            <Dialog><DialogTrigger asChild><Button className="h-11 rounded-xl bg-[#16747a] px-5 hover:bg-[#105f64]"><PackagePlus /> Add product</Button></DialogTrigger>
              <DialogContent className="rounded-2xl"><DialogHeader><DialogTitle>Add a product</DialogTitle><DialogDescription>Create a new inventory item for your store.</DialogDescription></DialogHeader>
                <label className="space-y-2 text-sm font-semibold">Product name<Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Premium gift box" /></label>
                <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><DialogClose asChild><Button disabled={!productName.trim()} onClick={() => { setProducts(products + 1); setProductName(""); }} className="bg-[#16747a]">Save product</Button></DialogClose></DialogFooter>
              </DialogContent>
            </Dialog>
          </section>

          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Business summary">
            {[
              ["Today’s revenue", "$4,286", "+18.2% vs yesterday", CircleDollarSign, "teal"],
              ["Orders today", "64", "12 need attention", ShoppingBag, "gold"],
              ["Active products", String(products), "3 low in stock", Boxes, "blue"],
              ["Total customers", "1,842", "+26 this week", Users, "coral"],
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
              <div className="space-y-5">{stock.map((item) => <div key={item.sku}><div className="mb-2 flex justify-between"><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.sku}</p></div><p className="text-sm font-bold text-[#d64f3c]">{item.left} left</p></div><Progress value={item.level} className="h-1.5 bg-slate-100 [&>div]:bg-[#e36a56]" /></div>)}</div>
              <Button variant="outline" className="mt-6 w-full rounded-xl">Review inventory</Button>
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="text-lg font-bold">Recent orders</h2><p className="text-sm text-slate-500">Live activity from every sales channel</p></div><Button variant="ghost" className="text-[#16747a]">View all</Button></div>
            <Table><TableHeader><TableRow className="bg-slate-50"><TableHead className="pl-5">Order</TableHead><TableHead>Customer</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead className="pr-5 text-right">Time</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map((o) => <TableRow key={o.id}><TableCell className="pl-5 font-semibold">{o.id}</TableCell><TableCell>{o.customer}</TableCell><TableCell className="text-slate-500">{o.channel}</TableCell><TableCell><Badge className={o.status === "Processing" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}>{o.status}</Badge></TableCell><TableCell className="font-semibold">{o.total}</TableCell><TableCell className="pr-5 text-right text-slate-500">{o.time}</TableCell></TableRow>)}{filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">No matching orders found.</TableCell></TableRow>}</TableBody>
            </Table>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
