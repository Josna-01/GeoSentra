import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Database, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImportResult {
    status: string;
    suppliers_added: number;
    suppliers_updated: number;
    total_processed: number;
    message: string;
}

interface Supplier {
    id: string;
    supplier_id: string;
    name: string;
    country: string;
    category: string;
    lead_time_days: number;
    contract_value: number;
    risk_tier: string;
    contact_email: string;
}

const ERPIntegration = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/erp/import-suppliers", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setResult(data);

            // Refresh supplier list
            fetchSuppliers();
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/erp/suppliers");
            const data = await res.json();
            setSuppliers(data.suppliers || []);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `supplier_id,supplier_name,country,category,lead_time_days,contract_value,risk_tier,contact_email
SUP001,Acme Manufacturing,Germany,Electronics,30,1500000,Low,procurement@acme.de
SUP002,Global Tech Solutions,China,Electronics,45,2000000,Medium,sourcing@globaltech.cn`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'supplier_template.csv';
        a.click();
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
                            <Database className="w-8 h-8 text-indigo-400" />
                            <h1 className="text-3xl font-bold tracking-tight">ERP Integration</h1>
                        </div>
                        <p className="text-slate-400">Import supplier data from your ERP system</p>
                    </div>
                    <Button onClick={downloadTemplate} variant="outline" className="border-slate-700">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Download Template
                    </Button>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        Import Suppliers
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">
                                Upload CSV or Excel File
                            </label>
                            <Input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                className="bg-slate-900 border-slate-700 text-slate-200"
                            />
                        </div>

                        {file && (
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                <div className="text-sm text-slate-300">
                                    <strong>Selected:</strong> {file.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {(file.size / 1024).toFixed(2)} KB
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            {uploading ? "Uploading..." : "Import Suppliers"}
                        </Button>

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-lg p-4 border ${result.status === "success"
                                        ? "bg-emerald-950/30 border-emerald-900/50"
                                        : "bg-red-950/30 border-red-900/50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {result.status === "success" ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm mb-2">{result.message}</div>
                                        {result.status === "success" && (
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div className="text-slate-500">Added</div>
                                                    <div className="font-bold text-emerald-400">{result.suppliers_added}</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">Updated</div>
                                                    <div className="font-bold text-blue-400">{result.suppliers_updated}</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-500">Total</div>
                                                    <div className="font-bold text-slate-200">{result.total_processed}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                        <div className="text-sm font-semibold text-slate-300 mb-2">Required Columns:</div>
                        <div className="text-xs text-slate-500 space-y-1">
                            <div>• supplier_id (unique)</div>
                            <div>• supplier_name</div>
                            <div>• country</div>
                            <div>• category (optional)</div>
                            <div>• lead_time_days (optional)</div>
                            <div>• contract_value (optional)</div>
                            <div>• risk_tier (optional: Low/Medium/High)</div>
                            <div>• contact_email (optional)</div>
                        </div>
                    </div>
                </motion.div>

                {/* Supplier List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Database className="w-5 h-5 text-indigo-400" />
                            Imported Suppliers
                        </h2>
                        <Button onClick={fetchSuppliers} variant="outline" size="sm" className="border-slate-700">
                            Refresh
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-600">
                            <Database className="w-12 h-12 mx-auto mb-4 animate-pulse opacity-50" />
                            <p>Loading suppliers...</p>
                        </div>
                    ) : suppliers.length === 0 ? (
                        <div className="text-center py-12 text-slate-600">
                            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No suppliers imported yet</p>
                            <p className="text-xs mt-2">Upload a CSV file to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {suppliers.map((supplier, index) => (
                                <motion.div
                                    key={supplier.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="font-semibold text-slate-200">{supplier.name}</div>
                                            <div className="text-xs text-slate-500">{supplier.supplier_id}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${supplier.risk_tier === "Low" ? "bg-emerald-950/50 text-emerald-400" :
                                                supplier.risk_tier === "Medium" ? "bg-amber-950/50 text-amber-400" :
                                                    "bg-red-950/50 text-red-400"
                                            }`}>
                                            {supplier.risk_tier}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <div className="text-slate-500">Country</div>
                                            <div className="text-slate-300">{supplier.country}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Category</div>
                                            <div className="text-slate-300">{supplier.category}</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Lead Time</div>
                                            <div className="text-slate-300">{supplier.lead_time_days} days</div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500">Contract Value</div>
                                            <div className="text-slate-300">${(supplier.contract_value / 1000000).toFixed(1)}M</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ERPIntegration;
