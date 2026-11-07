import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RFQ {
    id: string;
    rfq_id: string;
    created_at: string;
    urgency: string;
    reason: string;
    event_details: {
        event_type: string;
        location: any;
        severity: number;
        summary: string;
    };
    affected_supplier: {
        name: string;
        country: string;
        category: string;
    };
    alternative_suppliers: any[];
    response_deadline: string;
    status: string;
}

const RFQManagement = () => {
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [eventText, setEventText] = useState("");
    const [affectedSupplier, setAffectedSupplier] = useState("");
    const [urgency, setUrgency] = useState("High");

    useEffect(() => {
        fetchRFQs();
    }, []);

    const fetchRFQs = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/rfq/list?limit=50");
            const data = await res.json();
            setRfqs(data.rfqs || []);
        } catch (error) {
            console.error("Failed to fetch RFQs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRFQ = async () => {
        if (!eventText.trim() || !affectedSupplier.trim()) {
            alert("Please fill in all required fields");
            return;
        }

        setGenerating(true);
        try {
            // First, simulate the crisis to create an event
            const crisisRes = await fetch(`http://localhost:8000/risk/simulate?event_text=${encodeURIComponent(eventText)}`, {
                method: "POST"
            });
            const crisisData = await crisisRes.json();

            if (crisisData.id) {
                // Then generate RFQ for that event
                const rfqRes = await fetch(
                    `http://localhost:8000/rfq/generate?affected_supplier_id=${encodeURIComponent(affectedSupplier)}&event_id=${crisisData.id}&urgency=${urgency}`,
                    { method: "POST" }
                );
                const rfqData = await rfqRes.json();

                if (rfqData.status === "success") {
                    alert(`RFQ Generated! ${rfqData.alternatives_contacted} suppliers contacted.`);
                    setEventText("");
                    setAffectedSupplier("");
                    setShowForm(false);
                    fetchRFQs(); // Refresh list
                } else {
                    alert(rfqData.message || "Failed to generate RFQ");
                }
            }
        } catch (error) {
            console.error("Failed to generate RFQ:", error);
            alert("Failed to generate RFQ. Check console for details.");
        } finally {
            setGenerating(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "sent": return <Send className="w-4 h-4 text-blue-400" />;
            case "responded": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case "accepted": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case "rejected": return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "sent": return "text-blue-400 bg-blue-950/30 border-blue-900/50";
            case "responded": return "text-emerald-400 bg-emerald-950/30 border-emerald-900/50";
            case "accepted": return "text-emerald-400 bg-emerald-950/30 border-emerald-900/50";
            case "rejected": return "text-red-400 bg-red-950/30 border-red-900/50";
            default: return "text-slate-400 bg-slate-800/30 border-slate-700";
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "Critical": return "text-red-400 bg-red-950/30 border-red-900/50";
            case "High": return "text-amber-400 bg-amber-950/30 border-amber-900/50";
            default: return "text-blue-400 bg-blue-950/30 border-blue-900/50";
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
                            <FileText className="w-8 h-8 text-cyan-400" />
                            <h1 className="text-3xl font-bold tracking-tight">RFQ Management</h1>
                        </div>
                        <p className="text-slate-400">Auto-generated requests for quotation</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-200">{rfqs.length}</div>
                            <div className="text-xs text-slate-500">Total RFQs</div>
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Generate RFQ
                        </Button>
                    </div>
                </div>

                {/* Generate RFQ Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6"
                    >
                        <h3 className="text-lg font-bold mb-4 text-cyan-400">Generate New RFQ</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Crisis Event Description *
                                </label>
                                <Input
                                    placeholder="e.g., Earthquake in Tokyo affects electronics manufacturing"
                                    value={eventText}
                                    onChange={(e) => setEventText(e.target.value)}
                                    className="bg-slate-900 border-slate-700 text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Affected Supplier ID *
                                </label>
                                <Input
                                    placeholder="e.g., SUP001 or supplier country name"
                                    value={affectedSupplier}
                                    onChange={(e) => setAffectedSupplier(e.target.value)}
                                    className="bg-slate-900 border-slate-700 text-slate-200"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Enter supplier ID from ERP or country name (e.g., "Japan")
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Urgency Level
                                </label>
                                <select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-2"
                                >
                                    <option value="Critical">Critical (2 days)</option>
                                    <option value="High">High (5 days)</option>
                                    <option value="Medium">Medium (10 days)</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleGenerateRFQ}
                                    disabled={generating}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                >
                                    {generating ? "Generating..." : "Generate RFQ"}
                                </Button>
                                <Button
                                    onClick={() => setShowForm(false)}
                                    variant="outline"
                                    className="border-slate-700"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.header>

            {/* RFQ List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6"
            >
                {loading ? (
                    <div className="text-center py-12 text-slate-600">
                        <FileText className="w-12 h-12 mx-auto mb-4 animate-pulse opacity-50" />
                        <p>Loading RFQs...</p>
                    </div>
                ) : rfqs.length === 0 ? (
                    <div className="text-center py-12 text-slate-600">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No RFQs generated yet</p>
                        <p className="text-xs mt-2">RFQs are automatically created when disruptions affect suppliers</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rfqs.map((rfq, index) => (
                            <motion.div
                                key={rfq.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:bg-slate-800 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono text-sm font-bold text-cyan-400">{rfq.rfq_id}</span>
                                            <span className={`text-xs px-2 py-1 rounded border font-semibold ${getUrgencyColor(rfq.urgency)}`}>
                                                {rfq.urgency}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded border font-semibold flex items-center gap-1 ${getStatusColor(rfq.status)}`}>
                                                {getStatusIcon(rfq.status)}
                                                {rfq.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-400">{rfq.reason}</div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        {new Date(rfq.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Event Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Disruption Event</div>
                                        <div className="text-sm font-semibold text-slate-200 mb-1">{rfq.event_details.event_type}</div>
                                        <div className="text-xs text-slate-400">{rfq.event_details.summary}</div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Severity:</span>
                                            <span className={`text-xs font-bold ${rfq.event_details.severity >= 7 ? "text-red-400" :
                                                rfq.event_details.severity >= 4 ? "text-amber-400" :
                                                    "text-emerald-400"
                                                }`}>
                                                {rfq.event_details.severity}/10
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Affected Supplier</div>
                                        <div className="text-sm font-semibold text-slate-200 mb-1">{rfq.affected_supplier.name}</div>
                                        <div className="text-xs text-slate-400 space-y-1">
                                            <div>📍 {rfq.affected_supplier.country}</div>
                                            <div>🏭 {rfq.affected_supplier.category}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alternative Suppliers */}
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                        Alternative Suppliers Contacted ({rfq.alternative_suppliers.length})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {rfq.alternative_suppliers.map((supplier: any, idx: number) => (
                                            <div
                                                key={`${rfq.rfq_id}-supplier-${supplier.name}-${idx}`}
                                                className="text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700"
                                            >
                                                <span className="font-semibold text-slate-200">{supplier.name}</span>
                                                <span className="text-slate-500 ml-2">({supplier.country})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                                    <div>
                                        Response Deadline: {new Date(rfq.response_deadline).toLocaleString()}
                                    </div>
                                    <div>
                                        Created: {new Date(rfq.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default RFQManagement;
