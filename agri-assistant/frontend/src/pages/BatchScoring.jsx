import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Download, Trash2, ArrowRight, Play } from 'lucide-react';
import { advisoryAPI } from '../lib/api';

export default function BatchScoring() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError('Please upload a valid .csv file format.');
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      const { data } = await advisoryAPI.batchUpload(formData);
      setResults(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process batch upload.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const headers = 'field_id,crop_type,soil_ph,moisture_level_percent,nitrogen_ppm,farmer_observation,weather_forecast\n';
    const rows = [
      'FLD-2026-B01,Wheat,6.2,45,75,"Uniform canopy, mild leaf chlorosis",Sunny',
      'FLD-2026-B02,Corn,5.8,72,40,"Water pooling in furrow, necrotic spots on lower leaves",Heavy Rain',
      'FLD-2026-B03,Soybean,6.8,30,85,"Mild heat stress with leaf curling",Drought',
      'FLD-2026-B04,Rice,7.1,85,60,"High humidity vector, rust spots",High Humidity',
      'FLD-2026-B05,Cotton,6.0,50,90,"Normal vegetative growth, pest monitoring",Sunny',
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agriadvisor_batch_telemetry_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <UploadCloud className="w-6 h-6" />
            </span>
            Batch CSV Telemetry Ingestion
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Upload multi-row CSV telemetry datasets for high-throughput automated 3-agent scoring
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSampleCSV}
          className="btn-secondary text-xs px-4 py-2 flex items-center gap-2 bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          Download CSV Template
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          {error}
        </div>
      )}

      {/* Upload Dropzone Container */}
      <div className="glass-card p-6 bg-slate-900/85 border border-slate-800 space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-950/60 bg-slate-950/40'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          {isDragActive ? (
            <p className="text-sm font-bold text-cyan-300">Drop your telemetry CSV file here...</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-100">
                Drag and drop your telemetry CSV file here, or <span className="text-cyan-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports standard CSV format up to 10MB (max 100 rows per run)</p>
            </>
          )}
        </div>

        {/* Selected File Card & Actions */}
        {file && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">{file.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB · Ready to process</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center gap-2 border border-cyan-400/30"
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4 border-2" />
                    <span>Processing Batch Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Batch Multi-Agent Scoring</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Processing Results */}
      {results && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 bg-slate-900/85 border border-slate-800">
              <p className="text-xs text-slate-400">Total Rows Processed</p>
              <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{results.total_rows}</p>
            </div>
            <div className="glass-card p-4 bg-slate-900/85 border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs text-emerald-400">Successfully Scored</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{results.processed}</p>
            </div>
            <div className="glass-card p-4 bg-slate-900/85 border border-rose-500/20 bg-rose-500/5">
              <p className="text-xs text-rose-400">Failed Records</p>
              <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">{results.failed}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-card overflow-hidden bg-slate-900/85 border border-slate-800 rounded-2xl">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Batch Scoring Execution Output
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-4">Row</th>
                    <th className="py-3 px-4">Advisory Reference</th>
                    <th className="py-3 px-4">Calculated Risk Score</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {results.results?.map((r) => (
                    <tr key={r.row} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 text-slate-400">#{r.row}</td>
                      <td className="py-3 px-4 text-cyan-300 font-semibold">{r.advisory_id}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            r.risk_score >= 80 ? 'text-rose-400' : r.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {r.risk_score}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
