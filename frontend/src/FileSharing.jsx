import React, { useState, useEffect } from 'react';

function FileSharing() {
  const [myFiles, setMyFiles] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  //const [completedShares, setCompletedShares] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shareFormData, setShareFormData] = useState({
    receiverDepartmentId: '',
    purpose: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

const fetchAllData = async () => {
  try {
    const token = localStorage.getItem('token');

    // Fetch my files
    const filesRes = await fetch('/api/files/my-files', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const files = await filesRes.json();
    setMyFiles(files);

    // Fetch departments
    const deptRes = await fetch('/api/departments');
    const depts = await deptRes.json();
    setDepartments(depts);

    // Fetch ALL shares (pending + approved)
    const approvalsRes = await fetch('/api/files/approvals/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const approvals = await approvalsRes.json();
    setPendingApprovals(approvals);

    setLoading(false);
  } catch (error) {
    console.error('Error fetching data:', error);
    setLoading(false);
  }
};

  const handleShareClick = (fileId) => {
    setShowShareModal(fileId);
    setShareFormData({ receiverDepartmentId: '', purpose: '' });
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${showShareModal}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverDepartmentId: parseInt(shareFormData.receiverDepartmentId),
          purpose: shareFormData.purpose
        })
      });

      if (!response.ok) {
        throw new Error('Share failed');
      }

      alert('✅ File shared! Waiting for approval...');
      setShowShareModal(null);
      setShareFormData({ receiverDepartmentId: '', purpose: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (shareId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${shareId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: true })
      });

      if (!response.ok) throw new Error('Approve failed');

      alert('✅ Share approved!');
      fetchAllData();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleReject = async (shareId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${shareId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved: false })
      });

      if (!response.ok) throw new Error('Reject failed');

      alert('✅ Share rejected');
      fetchAllData();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };
  const handleDownload = async (shareId, filename) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/files/${shareId}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    alert('✅ File downloaded!');
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
};

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          🔄 File Sharing & Approvals
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Share files securely with other departments
        </p>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1.5rem 0' }}>
              📤 Share File
            </h2>

            <form onSubmit={handleShareSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Send To Department
                </label>
                <select
                  value={shareFormData.receiverDepartmentId}
                  onChange={(e) => setShareFormData((prev) => ({
                    ...prev,
                    receiverDepartmentId: e.target.value
                  }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.5rem',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Purpose of Share
                </label>
                <textarea
                  value={shareFormData.purpose}
                  onChange={(e) => setShareFormData((prev) => ({
                    ...prev,
                    purpose: e.target.value
                  }))}
                  placeholder="e.g., Data Analysis, Audit, Compliance Check"
                  rows="3"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    borderRadius: '0.5rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowShareModal(null)}
                  style={{
                    flex: 1,
                    background: '#e5e7eb',
                    color: '#333',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: submitting ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? '⏳ Sharing...' : '📤 Share File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Files for Sharing */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
          📁 My Files
        </h2>

        {myFiles.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#999' }}>
            No files uploaded yet
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Filename</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Size</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Uploaded</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myFiles.map((file) => (
                  <tr key={file.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '1rem', color: '#111827' }}>📄 {file.filename}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                    <td style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleShareClick(file.id)}
                        style={{
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Share
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Approvals */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
          ⏳ Pending & Approved Shares
        </h2>

        {pendingApprovals.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#999' }}>
            No pending approvals
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingApprovals.map((share) => (
              <div
                key={share.id}
                style={{
                  background: share.approval_status === 'approved' ? '#f0fdf4' : 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  borderLeft: share.approval_status === 'approved' ? '5px solid #16a34a' : '5px solid #ff6f00',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.5rem 0' }}>
                      {share.filename}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      From: <strong>{share.sender}</strong>
                    </p>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      To: <strong>{share.receiver_dept}</strong>
                    </p>
                  </div>
                  <span style={{
                    background: share.approval_status === 'approved' ? '#dcfce7' : '#fef3c7',
                    color: share.approval_status === 'approved' ? '#166534' : '#92400e',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {share.approval_status === 'approved' ? '✅ APPROVED' : '⏳ PENDING'}
                  </span>
                </div>

                <p style={{ color: '#555', fontSize: '0.875rem', margin: '0.75rem 0', fontStyle: 'italic' }}>
                  Purpose: {share.purpose}
                </p>

                {share.approval_status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleApprove(share.id)}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(share.id)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleDownload(share.id, share.filename)}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ⬇️ Download File
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileSharing;