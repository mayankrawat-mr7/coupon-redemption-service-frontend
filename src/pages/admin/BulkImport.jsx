import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client.js';

export default function BulkImport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null); // holds the setInterval id so we can clear it

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // key MUST be "file" — matches multer's .single("file")

      // The browser supplies the multipart boundary. Setting the header ourselves
      // can result in multer receiving the request without a file.
      const res = await api.post('/admin/coupons/import', formData);

      setJob(res.data.data);
      toast.success('CSV import completed');
    } catch (err) {
      const message = err.response?.data?.errors?.[0]?.message || 'Upload failed';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  // Poll the job's status every 2 seconds while it's still running
  useEffect(() => {
    if (!job || job.status === 'COMPLETED' || job.status === 'FAILED') return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/admin/coupons/import/${job._id}`);
        setJob(res.data.data);
      } catch {
        clearInterval(pollRef.current); // stop polling if the request itself fails
      }
    }, 2000);

    return () => clearInterval(pollRef.current); // cleanup on unmount or job change
  }, [job]);

  const progressPct = job?.totalRows
    ? Math.round((job.processedRows / job.totalRows) * 100)
    : 0;

  return (
    <div>
      <h2>Bulk Coupon Import</h2>

      <form onSubmit={handleUpload} className="bulk-import-form">
        <label htmlFor="coupon-csv">Coupon CSV file</label>
        <input
          id="coupon-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            setFile(e.target.files[0] || null);
            setError(null);
            setJob(null);
          }}
        />
        {file && <p className="selected-file">Selected: <strong>{file.name}</strong> ({Math.ceil(file.size / 1024)} KB)</p>}
        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Upload CSV'}
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {job && (
        <div className="import-status">
          <h3>Job Status: {job.status}</h3>
          {job.totalRows > 0 && (
            <>
              <progress value={job.processedRows} max={job.totalRows} />
              <p>{job.processedRows} / {job.totalRows} rows ({progressPct}%)</p>
            </>
          )}
          {job.status === 'COMPLETED' && (
            <p>✅ {job.successfulRows} succeeded, ❌ {job.failedRows} failed</p>
          )}
          {job.rowErrors?.length > 0 && (
            <ul>
              {job.rowErrors.map((e, i) => (
                <li key={i}>Row {e.row}: {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
