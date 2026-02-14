"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Bookmark,
  LogOut,
  Plus,
  Trash2,
  LogIn,
  Sparkles,
  Link as LinkIcon,
  Mail,
  CheckCircle,
  AlertCircle,
  Globe,
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  // Simple URL validation
  const validateUrl = (input) => {
    if (!input) return "";
    try {
      new URL(input);
      return "";
    } catch {
      return "Please enter a valid URL (including https://)";
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setUrlError(validateUrl(value));
  };

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) loadBookmarks(data.user.id);
  };

  const loadBookmarks = async (uid) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("id", { ascending: false });
    setBookmarks(data || []);
  };

const addBookmark = async () => {
  if (!title || !url || urlError) return;

  const { data } = await supabase
    .from("bookmarks")
    .insert({
      title,
      url,
      user_id: user.id,
    })
    .select()
    .single();

  if (data) setBookmarks(prev => [data, ...prev]);

  setTitle("");
  setUrl("");
  setUrlError("");
};


  const deleteBookmark = async (id) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

useEffect(() => {
  getUser();

  let channel;

  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return;

    channel = supabase
      .channel("user-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${data.user.id}`,
        },
        () => {
          loadBookmarks(data.user.id);
        }
      )
      .subscribe();
  });

  return () => {
    if (channel) supabase.removeChannel(channel);
  };
}, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };

  const isAddDisabled = !title || !url || !!urlError;

  if (!user) {
    return (
      <div className="login-container">
        <div className="glass-card login-card">
          <div className="icon-ring">
            <Bookmark size={48} className="brand-icon" />
          </div>
          <h1 className="gradient-text">Smart Bookmark</h1>
          <p className="subtitle">Organize your web with style</p>
          <button onClick={login} className="btn btn-primary">
            <LogIn size={20} />
            <span>Login with Google</span>
          </button>
          <p className="privacy-note">
            <Mail size={14} />
            We only use your email for identification
          </p>
        </div>

        <style jsx>{`
          .login-container {
            min-height: 100vh;
            background: linear-gradient(145deg, #fafaff, #f0f2fe);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border-radius: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.05),
                        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
            padding: 3rem;
            width: 100%;
            max-width: 28rem;
            text-align: center;
            transition: all 0.3s;
          }
          .icon-ring {
            background: white;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.15);
          }
          .brand-icon {
            color: #6366f1;
          }
          .gradient-text {
            font-size: 2.8rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
            background: linear-gradient(145deg, #4f46e5, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.02em;
          }
          .subtitle {
            color: #6b7280;
            font-size: 1.15rem;
            margin-bottom: 2rem;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            padding: 0.875rem 2rem;
            border-radius: 1rem;
            font-weight: 600;
            font-size: 1rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
          }
          .btn-primary {
            background: linear-gradient(145deg, #6366f1, #8b5cf6);
            color: white;
            box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.2);
          }
          .btn-primary:hover {
            background: linear-gradient(145deg, #4f46e5, #7c3aed);
            transform: translateY(-2px);
            box-shadow: 0 12px 20px -6px rgba(79, 70, 229, 0.3);
          }
          .privacy-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            color: #9ca3af;
            font-size: 0.8rem;
            margin-top: 1.5rem;
          }
          @media (max-width: 480px) {
            .glass-card {
              padding: 2rem;
            }
            .gradient-text {
              font-size: 2.2rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="max-width-wrapper">
        {/* Header */}
        <div className="header">
          <div className="user-greeting">
            <div className="avatar">
              <Bookmark size={24} />
            </div>
            <div>
              <h2 className="welcome-title">
                <Sparkles size={24} className="welcome-icon" />
                Welcome
              </h2>
              <p className="user-email">{user.user_metadata.full_name}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-outline">
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Add Bookmark Card */}
        <div className="add-card">
          <h3 className="card-title">
            <Plus size={24} className="card-icon" />
            Add Bookmark
          </h3>
          <div className="input-group">
            <div className="input-field">
              <div className="input-wrapper">
                <Bookmark size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  aria-label="Bookmark title"
                />
              </div>
            </div>
            <div className="input-field">
              <div className="input-wrapper">
                <LinkIcon size={18} className="input-icon" />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={url}
                  onChange={handleUrlChange}
                  className={`input ${urlError ? "input-error" : ""}`}
                  aria-label="Bookmark URL"
                />
                {url && !urlError && (
                  <CheckCircle size={18} className="input-valid-icon" />
                )}
              </div>
              {urlError && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  <span>{urlError}</span>
                </div>
              )}
            </div>
            <button
              onClick={addBookmark}
              className={`btn btn-success ${isAddDisabled ? "btn-disabled" : ""}`}
              disabled={isAddDisabled}
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <h3 className="grid-title">
          <Bookmark size={24} className="grid-icon" />
          Your Bookmarks
        </h3>
        <div className="bookmarks-grid">
          {bookmarks.map((b) => (
            <div key={b.id} className="bookmark-card">
              <div className="bookmark-content">
                <div className="bookmark-icon">
                  <Globe size={20} />
                </div>
                <div className="bookmark-info">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bookmark-link"
                  >
                    {b.title}
                  </a>
                  <span className="bookmark-url">{b.url}</span>
                </div>
              </div>
              <button
                onClick={() => deleteBookmark(b.id)}
                className="btn btn-delete"
                aria-label="Delete bookmark"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {bookmarks.length === 0 && (
          <div className="empty-state">
            <Bookmark size={48} className="empty-icon" />
            <p className="empty-message">
              Your collection is empty – add your first bookmark!
            </p>
          </div>
        )}
      </div>

      {/* Light UI styles */}
      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8faff 0%, #f2f5fc 100%);
          padding: 2rem 1.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .max-width-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          padding: 1rem 1.5rem;
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.05);
        }

        .user-greeting {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(145deg, #ffffff, #f0f3fe);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.1);
        }

        .welcome-title {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0;
          color: #2d3a4f;
        }

        .welcome-icon {
          color: #8b5cf6;
        }

        .user-email {
          margin: 0;
          font-size: 0.9rem;
          color: #5f6b7a;
        }

        .btn-outline {
          background: white;
          color: #4b5563;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 2rem;
          font-weight: 500;
        }

        .btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.02);
        }

        /* Add Card */
        .add-card {
          background: white;
          border-radius: 2rem;
          padding: 1.75rem 2rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 15px 30px -12px rgba(0, 0, 0, 0.05),
                      0 1px 3px rgba(0,0,0,0.02);
          border: 1px solid rgba(255,255,255,0.5);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
          color: #1e293b;
        }

        .card-icon {
          color: #6366f1;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-field {
          flex: 1;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .input-valid-icon {
          position: absolute;
          right: 1rem;
          color: #10b981;
        }

        .input {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 2.8rem;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          font-size: 1rem;
          background: #f9fbfe;
          transition: border 0.2s, box-shadow 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #a5b4fc;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          background: white;
        }

        .input-error {
          border-color: #f87171;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.4rem;
          margin-left: 0.5rem;
          color: #ef4444;
          font-size: 0.8rem;
        }

        .btn-success {
          background: linear-gradient(145deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.9rem 1.5rem;
          border-radius: 1.5rem;
          font-weight: 600;
          gap: 0.5rem;
          box-shadow: 0 6px 14px rgba(16, 185, 129, 0.2);
          transition: all 0.2s;
        }

        .btn-success:hover:not(:disabled) {
          background: linear-gradient(145deg, #059669, #047857);
          transform: translateY(-2px);
          box-shadow: 0 10px 18px -6px rgba(16, 185, 129, 0.3);
        }

        .btn-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-disabled:hover {
          transform: none;
        }

        /* Grid title */
        .grid-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.4rem;
          font-weight: 600;
          margin: 2rem 0 1.5rem 0;
          color: #1e293b;
        }

        .grid-icon {
          color: #8b5cf6;
        }

        /* Bookmarks grid */
        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .bookmark-card {
          background: white;
          border-radius: 1.5rem;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          box-shadow: 0 8px 18px -6px rgba(0, 0, 0, 0.05),
                      0 1px 2px rgba(0,0,0,0.02);
          border: 1px solid rgba(226, 232, 240, 0.6);
          transition: all 0.2s;
        }

        .bookmark-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 24px -10px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .bookmark-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          flex: 1;
        }

        .bookmark-icon {
          width: 40px;
          height: 40px;
          background: #f1f4f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
        }

        .bookmark-info {
          min-width: 0;
        }

        .bookmark-link {
          display: block;
          font-weight: 600;
          color: #1e293b;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bookmark-link:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        .bookmark-url {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .btn-delete {
          background: white;
          border: 1px solid #fee2e2;
          color: #ef4444;
          border-radius: 1rem;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .btn-delete:hover {
          background: #fee2e2;
          border-color: #fecaca;
          transform: scale(1.05);
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          margin-top: 4rem;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .empty-message {
          color: #64748b;
          font-size: 1.1rem;
        }

        /* Responsive */
        @media (min-width: 640px) {
          .input-group {
            flex-direction: row;
            align-items: flex-end;
          }
          .btn-success {
            width: auto;
          }
        }

        @media (max-width: 480px) {
          .app-container {
            padding: 1rem;
          }
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .add-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
