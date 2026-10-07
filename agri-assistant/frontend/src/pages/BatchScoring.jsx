import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, AlertTriangle, Download, Trash2, Play } from 'lucide-react';
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-500" />
            Batch CSV Telemetry Ingestion
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Upload multi-row CSV telemetry datasets for high-throughput automated 3-agent scoring
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSampleCSV}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#12151a] hover:bg-blue-600 text-slate-300 hover:text-white border border-white/5 transition-all flex items-center gap-1.5 font-mono"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone Container */}
      <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-6 space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-blue-500 bg-blue-950/20'
              : 'border-white/10 hover:border-blue-500/50 bg-[#080a0e]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          {isDragActive ? (
            <p className="text-xs font-bold text-blue-400 font-mono">Drop telemetry CSV file here...</p>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-200">
                Drag & drop your CSV file here, or <span className="text-blue-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Standard CSV format up to 10MB (max 100 rows per run)</p>
            </>
          )}
        </div>

        {/* Selected File Card & Actions */}
        {file && (
          <div className="p-4 rounded-lg bg-[#080a0e] border border-white/5 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200 font-mono">{file.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB · Ready for scoring</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-white/5 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50 flex items-center gap-2 border border-white/10 transition-all font-sans"
              >
                {loading ? (
                  <>
                    <div className="spinner w-3.5 h-3.5 border-2" />
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
            <div className="bg-[#0d0f12] border border-white/5 rounded-xl p-5 flex flex-col justify-between h-28">
              <p className="text-xs tracking-wider text-slate-500 uppercase font-semibold">Total Rows Processed</p>
              <p className="text-3xl font-bold text-slate-100 font-mono">{results.total_rows}</p>
            </div>
            <div className="bg-[#0d0f12] border border-emerald-500/20 rounded-xl p-5 flex flex-col justify-between h-28 bg-emerald-950/10">
              <p className="text-xs tracking-wider text-emerald-400 uppercase font-semibold">Successfully Scored</p>
              <p className="text-3xl font-bold text-emerald-400 font-mono">{results.processed}</p>
            </div>
            <div className="bg-[#0d0f12] border border-rose-500/20 rounded-xl p-5 flex flex-col justify-between h-28 bg-rose-950/10">
              <p className="text-xs tracking-wider text-rose-400 uppercase font-semibold">Failed Records</p>
              <p className="text-3xl font-bold text-rose-400 font-mono">{results.failed}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-[#0d0f12] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs tracking-wider text-slate-500 uppercase font-semibold font-mono">
                Batch Scoring Execution Output
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#080a0e] border-b border-white/5 text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Advisory Reference</th>
                    <th className="py-2.5 px-3">Calculated Risk Score</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.results?.map((r) => (
                    <tr key={r.row} className="hover:bg-[#12151b] transition-colors">
                      <td className="py-3 px-3 text-slate-500">#{r.row}</td>
                      <td className="py-3 px-3 text-blue-400 font-semibold">{r.advisory_id}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold ${
                            r.risk_score >= 80 ? 'text-rose-400' : r.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {r.risk_score}/100
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
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
