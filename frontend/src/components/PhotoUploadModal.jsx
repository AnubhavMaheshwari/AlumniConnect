import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaUpload, FaTimes } from 'react-icons/fa';
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
                // File upload via FormData
                const formData = new FormData();
                formData.append('image', imageSource);
                response = await API.put(`/users/${userId}/profile-photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Base64 upload (from camera)
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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, fontFamily: "'DM Sans', sans-serif"
        }}>
            <div style={{
                background: 'var(--bg-secondary)', width: '100%', maxWidth: 400,
                borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                position: 'relative', animation: 'fadeUp 0.3s ease'
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>Update Profile Photo</h3>
                    <button onClick={handleClose} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>
                        <FaTimes />
                    </button>
                </div>

                <div style={{ padding: 24, textAlign: 'center' }}>
                    {error && <div style={{ color: '#ef4444', background: '#fee2e2', padding: '10px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

                    {loading ? (
                        <div style={{ padding: '40px 0' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Uploading to Cloudinary...</p>
                        </div>
                    ) : mode === 'camera' ? (
                        <div>
                            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 16 }}>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    videoConstraints={{ facingMode: "user" }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setMode('select')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button onClick={handleCapture} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Capture Photo</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                            <button onClick={() => setMode('camera')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '20px', background: 'var(--blue-faint)', border: '1px dashed var(--blue-border)', borderRadius: 12, color: 'var(--blue)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                <FaCamera style={{ fontSize: 24 }} />
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
                                <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '20px', background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                    <FaUpload style={{ fontSize: 24, color: 'var(--text-muted)' }} />
                                    <span>Upload from Device</span>
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
