import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { createPost } from '../api/posts';
import toast from 'react-hot-toast';
import './Upload.css';

export default function Upload() {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const [preview, setPreview] = useState(null);
  const [file,    setFile]    = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    // Removed 5MB limit — IndexedDB handles large files
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile({ target: { files: [f] } });
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      await createPost(fd);
      toast.success('Post shared! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to create post';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2 className="upload-title">Create Post</h2>

        <form onSubmit={handleSubmit}>
          {!preview ? (
            <div
              className="drop-zone"
              onClick={() => fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ImagePlus size={44} />
              <p>Click or drag an image here</p>
              <span>JPG, PNG, WEBP</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
            </div>
          ) : (
            <div className="preview-wrap">
              <img src={preview} alt="preview" className="preview-img" />
              <button type="button" className="preview-remove" onClick={clearImage}>
                <X size={18} />
              </button>
            </div>
          )}

          <div className="upload-caption">
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <span className="char-count">{caption.length}/500</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary upload-btn"
            disabled={loading || !file}
          >
            {loading ? <span className="spinner" /> : 'Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
