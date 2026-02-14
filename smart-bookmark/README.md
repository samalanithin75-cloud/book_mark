Smart Bookmark
A simple real-time bookmark manager where users log in using Google and save personal bookmarks.
Each user can only see and manage their own bookmarks. Updates appear instantly across tabs without refresh.

Live Demo
https://book-mark-a41c.vercel.app/

Tech Stack
Next.js (App Router)
Supabase (Auth + Database + Realtime)
Google OAuth
Tailwind CSS
Vercel Deployment

 Features
Google login (OAuth only — no passwords)
Add bookmarks (title + URL)
Delete bookmarks
Private per-user data (Row Level Security)
Real-time updates across tabs
Fully deployed production app

 Database Security (RLS)
Bookmarks are protected using Supabase Row Level Security:
Users can only view their own bookmarks
Users can only insert their own bookmarks
Users can only delete their own bookmarks
This ensures complete data isolation between users.

Real-time Mechanism

Supabase Realtime subscriptions listen to database changes.
When a bookmark is added or deleted:
Database triggers event
Supabase pushes update via websocket
UI updates automatically without refresh

Problems Faced & Solutions
1. OAuth redirect going to localhost after deployment
Problem: After Google login, the app redirected to localhost:3000 instead of the production URL.
Cause: Supabase Auth URL configuration was still pointing to local environment.
Solution:
Added deployed domain in Supabase:
Authentication → URL Configuration
Site URL → https://book-mark-eight-iota.vercel.app
Redirect URLs → https://book-mark-eight-iota.vercel.app/**

2. Vercel build failed (package.json not found)

Problem:
Could not read package.json
Cause: Next.js app was inside a subfolder (smart-bookmark), but Vercel was building from root.
Solution:
Set Vercel Root Directory:
Project Settings → Root Directory → smart-bookmark
3. Realtime UI not updating after insert
Problem: Bookmark appeared only after refresh.
Cause: Supabase realtime triggers asynchronously and UI state wasn't updated immediately.
Solution:
Added optimistic UI update + realtime listener to sync state instantly.
4. Module not found errors in deployment
Problem:
Can't resolve @supabase/supabase-js
Cause: Dependency missing in production package.json.
Solution: Added dependency:
npm install @supabase/supabase-js

🧪 How to Run Locally
git clone https://github.com/samalanithin75-cloud/book_mark
cd smart-bookmark
npm install
npm run dev


Create .env.local

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

📌 What I Learned

Implementing secure authentication using OAuth

Row Level Security design in real production

Real-time systems using WebSockets

Production deployment issues and debugging

Environment configuration across local and cloud

                                                                                                            Author
                                                                                                            Nithin
