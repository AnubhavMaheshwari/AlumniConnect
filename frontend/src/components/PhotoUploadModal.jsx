import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { LuCamera, LuUpload, LuX } from 'react-icons/lu';
import API from '../services/api';

const PhotoUploadModal = ({ isOpen, onClose, userId, onUploadSuccess }) => {
  const [mode, setMode] = useState('select'); // 'select', 'camera'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setMode('select');
    setError('');
    onClose();
  };

  const uploadImage = async (imageSource) => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (imageSource instanceof File) {
        const formData = new FormData();
        formData.append('image', imageSource);
        response = await API.put(`/users/${userId}/profile-photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await API.put(`/users/${userId}/profile-photo`, { image: imageSource });
      }

      const { data } = response;
      if (data.success) {
        onUploadSuccess(data.profileImage);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      uploadImage(imageSrc);
    }
  }, [webcamRef]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      uploadImage(file);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 420,
          borderRadius: 'var(--radius-card, 12px)',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Update Profile Photo
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <LuX size={18} />
          </button>
        </div>

        <div style={{ padding: 24, textAlign: 'center' }}>
          {error && (
            <div
              style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '36px 0' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13.5 }}>
                Optimizing and uploading image...
              </p>
            </div>
          ) : mode === 'camera' ? (
            <div>
              <div
                style={{
                  borderRadius: 'var(--radius-input, 8px)',
                  overflow: 'hidden',
                  background: '#000',
                  marginBottom: 16,
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{ facingMode: 'user' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-button, 8px)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-button, 8px)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Capture Photo
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <button
                type="button"
                onClick={() => setMode('camera')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '18px',
                  background: 'rgba(224, 122, 63, 0.08)',
                  border: '1px dashed var(--primary)',
                  borderRadius: 'var(--radius-input, 8px)',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <LuCamera size={20} />
                <span>Take Photo with Camera</span>
              </button>

              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '18px',
                    background: 'var(--panel)',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-input, 8px)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LuUpload size={20} style={{ color: 'var(--text-muted)' }} />
                  <span>Upload from Device (PNG, JPG)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;
