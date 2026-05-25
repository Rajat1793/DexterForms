"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Users, TrendingUp, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const CHART_COLORS = ["#cc0000", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4"];

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);

  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data: analytics, isLoading } = trpc.responses.analytics.useQuery({ formId });

  if (isLoading) {
    return (
      <div className="p-8 font-mono">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#eee] w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-[#fff9c4] border border-[#ddd]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dailyData = (analytics?.dailyResponses ?? []).map((d: any) => ({
    date: d.date ? new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "",
    count: Number(d.count),
  }));

  return (
    <div className="p-8 font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/forms/${formId}`} className="text-[#cc0000] hover:text-[#aa0000] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-bangers text-3xl text-[#1a1a1a] tracking-widest uppercase">📊 ANALYTICS</h1>
          <p className="font-bold text-[#555] text-sm">{form?.title}</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {label: "TOTAL RESPONSES", value: analytics?.totalResponses ?? 0, icon: Users, color: "text-[#cc0000]", bg: "bg-[#ffebee]", border: "border-[#000]", tag: "DATA"},
          {label: "QUESTIONS", value: analytics?.fieldAnalytics?.length ?? 0, icon: BarChart2, color: "text-[#1565c0]", bg: "bg-[#e3f2fd]", border: "border-[#000]", tag: "FIELDS"},
          {label: "AVG PER DAY",
            value: dailyData.length > 0
              ? `${Math.round(dailyData.reduce((a: number, d: any) => a + d.count, 0) / dailyData.length)}/day`
              : "0/day",
            icon: TrendingUp, color: "text-[#00a86b]", bg: "bg-[#e8f5e9]", border: "border-[#000]", tag: "RATE"},
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="cartoon-card bg-white p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-black ${stat.color} border ${stat.border} px-2 py-0.5 tracking-widest`}>{stat.tag}</span>
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-[#555] mt-1 tracking-widest">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Daily responses chart */}
      {dailyData.length > 0 && (
        <div className="cartoon-card bg-white p-6 overflow-hidden mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-black text-[#cc0000] border border-[#bbb] px-2 py-0.5 tracking-widest">CHART-01</span>
            <h2 className="font-black text-[#1a1a1a] tracking-wider text-sm uppercase">RESPONSES OVER TIME — LAST 30 DAYS</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000015" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} />
              <YAxis tick={{ fontSize: 10, fill: "#555" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "2px solid #000", borderRadius: 0, fontSize: 11 }}
                labelStyle={{ color: "#1a1a1a", fontWeight: "bold" }}
                itemStyle={{ color: "#cc0000" }}
              />
              <Line type="monotone" dataKey="count" stroke="#cc0000" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Field analytics */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#1565c0] border border-[#000] px-2 py-0.5 tracking-widest">CHART-02</span>
          <h2 className="font-black text-[#1a1a1a] tracking-wider text-sm uppercase">FIELD ANALYSIS</h2>
        </div>
        {(analytics?.fieldAnalytics ?? []).map((fa: any, idx: number) => (
          <div key={fa.fieldId} className="cartoon-card bg-white p-6 overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs text-[#888] font-mono tracking-widest mb-1">FIELD-{String(idx + 1).padStart(3, "0")}</div>
                <h3 className="font-black text-[#1a1a1a] tracking-wide text-sm">{fa.fieldLabel}</h3>
                <p className="text-xs text-[#555] mt-0.5 font-mono uppercase tracking-wider">{fa.fieldType.replace("_", " ")}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black ${fa.answerRate > 70 ? "text-green-400" : fa.answerRate > 40 ? "text-yellow-400" : "text-[#cc0000]"}`}>
                  {fa.answerRate}%
                </div>
                <div className="text-xs text-[#555] font-mono tracking-widest">ANSWER RATE</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-[#eee] mb-4">
              <div
                className={`h-1.5 transition-all ${fa.answerRate > 70 ? "bg-green-500" : fa.answerRate > 40 ? "bg-yellow-500" : "bg-lime-500"}`}
                style={{ width: `${fa.answerRate}%` }}
              />
            </div>

            {fa.average !== null && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-[#555] font-mono">AVG:</span>
                <span className="text-sm font-black text-[#cc0000]">{fa.average}</span>
              </div>
            )}

            {/* Distribution chart */}
            {Object.keys(fa.distribution).length > 0 &&
              ["single_select", "multi_select", "dropdown", "checkbox"].includes(fa.fieldType) && (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={Object.entries(fa.distribution).map(([k, v]) => ({ name: k, count: v as number }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000015" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#888", fontFamily: "monospace" }} />
                    <YAxis tick={{ fontSize: 9, fill: "#888", fontFamily: "monospace" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "2px solid #000", borderRadius: 0, fontSize: 11 }}
                labelStyle={{ color: "#1a1a1a", fontWeight: "bold" }}
                itemStyle={{ color: "#cc0000" }}
              />
              <Bar dataKey="count" fill="#cc0000" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}

        {(analytics?.fieldAnalytics ?? []).length === 0 && (
          <div className="border-2 border-dashed border-[#ccc] p-12 text-center">
            <BarChart2 className="h-8 w-8 mx-auto mb-3 text-[#ccc]" />
            <p className="text-xs text-[#555] font-mono tracking-wider">NO DATA — ANALYTICS WILL APPEAR ONCE RESPONSES ARE COLLECTED</p>
          </div>
        )}
      </div>
    </div>
  );
}
