import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Radio, TrendingUp, Activity } from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface SocialTrend {
    id: string;
    keyword: string;
    region: string;
    mentions: number;
    sentiment: string;
    trending_score: number;
    timestamp: string;
    sample_text: string;
    source: string;
}

const SocialListener = () => {
    const [socialTrends, setSocialTrends] = useState<SocialTrend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSocialTrends = async () => {
            try {
                const res = await fetch("http://localhost:8000/social/trends?limit=25");
                const data = await res.json();
                setSocialTrends(data.trends || []);
            } catch (error) {
                console.error("Failed to fetch social trends:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSocialTrends();
        const interval = setInterval(fetchSocialTrends, 60000);
        return () => clearInterval(interval);
    }, []);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "negative": return "text-red-400";
            case "positive": return "text-emerald-400";
            default: return "text-slate-400";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <MessageSquare className="w-8 h-8 text-cyan-400" />
                            <h1 className="text-3xl font-bold tracking-tight text-gradient">Social Media Listener</h1>
                        </div>
                        <p className="text-slate-400 text-sm">Real-time supply chain disruption signals synthesized from global social streams</p>
                    </div>
                    <GlassCard className="flex items-center gap-2 bg-cyan-500/10 px-4 py-2 border-cyan-500/20">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        <span className="text-sm text-cyan-300 font-medium tracking-wider uppercase">Live Stream</span>
                    </GlassCard>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trending Topics */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassCard className="p-8 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-cyan-400" />
                                    Detected Anomalies
                                </h2>
                                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                    {socialTrends.length} SIGNALS
                                </span>
                            </div>

                            {loading ? (
                                <div className="text-center py-20 text-slate-600">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 animate-pulse opacity-50" />
                                    <p className="text-lg font-medium text-slate-400">Filtering noise...</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
                                    {socialTrends.map((trend, index) => (
                                        <motion.div
                                            key={trend.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-5 hover:bg-slate-800/40 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                                                        <Radio className="w-4 h-4 text-cyan-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-slate-100 uppercase tracking-tighter">#{trend.keyword}</span>
                                                        <div className="text-[10px] text-cyan-500/70 font-mono uppercase mt-0.5">{trend.source}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{trend.region}</div>
                                                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${trend.sentiment === 'negative' ? 'text-red-400 border-red-500/30 bg-red-500/5' :
                                                            trend.sentiment === 'positive' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' :
                                                                'text-slate-400 border-slate-500/30 bg-slate-500/5'
                                                        }`}>
                                                        {trend.sentiment}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed italic group-hover:text-slate-300 transition-colors">"{trend.sample_text}"</p>
                                            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
                                                <div className="flex gap-4">
                                                    <span className="text-slate-500"><span className="text-slate-300 font-bold">{trend.mentions.toLocaleString()}</span> mentions</span>
                                                </div>
                                                <span className="text-slate-500 font-mono">Trending Score: <span className="text-cyan-400 font-bold">{trend.trending_score}</span></span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <GlassCard className="p-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                Sentiment Analytics
                            </h3>
                            <div className="space-y-6">
                                {["negative", "neutral", "positive"].map((sentiment) => {
                                    const count = socialTrends.filter(t => t.sentiment === sentiment).length;
                                    const percentage = socialTrends.length > 0 ? (count / socialTrends.length * 100).toFixed(0) : 0;
                                    return (
                                        <div key={sentiment}>
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="uppercase tracking-[0.1em] font-bold text-slate-400">{sentiment}</span>
                                                <span className="text-slate-500 text-[10px] font-mono">{count} SIGS ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    className={`h-full ${sentiment === "positive" ? "bg-emerald-500" :
                                                        sentiment === "negative" ? "bg-red-500" :
                                                            "bg-slate-400"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="p-8">
                            <h3 className="text-lg font-bold mb-6">Network Health</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm font-bold text-slate-300">Reddit API Gateway</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/20 border border-white/5">
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        Monitoring subreddits: r/supplychain, r/logistics, r/economics for predictive disruption signals.
                                    </p>
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                    Refreshing in 60s
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SocialListener;
