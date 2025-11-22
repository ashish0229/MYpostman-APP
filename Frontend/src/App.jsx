import React, { useState, useEffect, useCallback } from 'react';
import { io } from "socket.io-client";
import SupportChat from "./components/support_agent.jsx";


// --- SVG Icons ---
const BotIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /> </svg> );
const HistoryIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg> );
const CalendarIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> <rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /> <line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /> </svg> );
const SettingsIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /> <circle cx="12" cy="12" r="3" /> </svg> );
const ImageIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> );
const LayoutDashboardIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> );
const UsersIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> );
const FileStackIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M5 12v6"/><path d="M4 18h4"/></svg> );
const UserIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const AnalyticsIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg> );
const LogOutIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg> );

// --- API Client Helper ---
const apiClient = {
    async request(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const config = { method, headers };
        if (body) {
            config.body = JSON.stringify(body);
        }
        const response = await fetch(`http://localhost:3001/api${endpoint}`, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } 
    }
};

// --- Main App Component ---
export default function App() {
    // --- AUTH STATE ---
    const [authData, setAuthData] = useState({ token: null, user: null, isLoading: true });
    
    // --- LIVE DATA STATE ---
    const [liveStats, setLiveStats] = useState({ postsToday: 0, newUsers: 0, policyViolations: 0 });
    const [liveLogs, setLiveLogs] = useState([]);
    const [liveUsers, setLiveUsers] = useState([]);
    const [livePosts, setLivePosts] = useState([]);

    // --- APP STATE (for Generator) ---
    const [activeTab, setActiveTab] = useState('dashboard');
    const [topic, setTopic] = useState('A new sustainable coffee brand.');
    const [tone, setTone] = useState('Excited');
    const [platform, setPlatform] = useState('Instagram');
    const [generatedPost, setGeneratedPost] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- WebSocket and Data Fetching Effects ---
    const fetchAllInitialData = useCallback(async (user) => {
        try {
            const [stats, logs, posts] = await Promise.all([
                apiClient.request('/dashboard/stats'),
                apiClient.request('/moderation-logs'),
                apiClient.request('/posts')
            ]);
            // saves in the UI instantly with backend data.
            setLiveStats(stats);
            setLiveLogs(logs);
            setLivePosts(posts);

            if (user?.role === 'admin') {
                const users = await apiClient.request('/users');
                setLiveUsers(users);
            }
        } catch (err) {
            console.error("Failed to fetch initial data", err);
        }
    }, []);
    
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        if (token && user) {
            const parsedUser = JSON.parse(user);
            setAuthData({ token, user: parsedUser, isLoading: false });
            fetchAllInitialData(parsedUser);
        } else {
            setAuthData({ token: null, user: null, isLoading: false });
        }
    }, [fetchAllInitialData]);

    useEffect(() => {
        if (!authData.token) return;

        const socket = io("http://localhost:3001");

        socket.on('connect', () => console.log("✅ WebSocket Connected!"));
        
        socket.on('stats_update', (newStats) => setLiveStats(newStats));
        
        socket.on('user_update', async () => {
             if (authData.user?.role === 'admin') {
                const users = await apiClient.request('/users');
                setLiveUsers(users);
             }
        });

        socket.on('new_log', (newLog) => setLiveLogs(prev => [newLog, ...prev]));
        
        socket.on('new_post', (newPost) => setLivePosts(prev => [newPost, ...prev]));
        
        socket.on('post_updated', (updatedPost) => {
            setLivePosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
            setLiveLogs(prev => prev.map(l => l.post_id === updatedPost.id ? {...l, post_status: updatedPost.status} : l));
        });

        return () => {
            socket.disconnect();
        };
    }, [authData.token, authData.user?.role]);

    // --- AUTH HANDLERS ---
    const handleLogin = useCallback(async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiClient.request('/auth/login', 'POST', { username, password });
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            setAuthData({ token: data.token, user: data.user, isLoading: false });
            setActiveTab('dashboard');
        } catch (err) {
            setError({ message: err.message });
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleRegister = useCallback(async (username, password, role, displayName) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.request('/auth/register', 'POST', { username, password, role, display_name: displayName });
            await handleLogin(username, password);
        } catch(err) {
            setError({ message: err.message });
             setIsLoading(false);
        }
    }, [handleLogin]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setAuthData({ token: null, user: null, isLoading: false });
    };

    // --- API HANDLERS for Generator & Moderation ---
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedPost(null);
        try {
            const data = await apiClient.request('/posts', 'POST', { topic, tone, platform });
            setGeneratedPost(data);
        } catch (err) {
            setError({ message: err.message, status: "API Error" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePostNow = async () => {
         if (!generatedPost || !generatedPost.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const updatedPost = await apiClient.request(`/posts/${generatedPost.id}/publish`, 'PUT');
            setGeneratedPost(updatedPost);
        } catch (err) {
            setError({ message: err.message || "Failed to publish post.", status: "API Error" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleManualModeration = async (postId, newStatus, reason) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.request(`/posts/${postId}/status`, 'PUT', { status: newStatus, reason });
            // WebSocket will trigger UI updates
        } catch (err) {
            setError({ message: err.message || "Failed to update post status.", status: "API Error" });
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER LOGIC ---
    if (authData.isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    if (!authData.token) {
        return <AuthView onLogin={handleLogin} onRegister={handleRegister} isLoading={isLoading} error={error} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'generator': return <GeneratorView topic={topic} setTopic={setTopic} tone={tone} setTone={setTone} platform={platform} setPlatform={setPlatform} handleGenerate={handleGenerate} isLoading={isLoading} error={error} generatedPost={generatedPost} handlePostNow={handlePostNow} />;
            case 'history': return <HistoryView posts={livePosts} />;
            case 'moderation': return <ModerationLogView user={authData.user} onManualModeration={handleManualModeration} />;
            case 'dashboard': return <DashboardView stats={liveStats} />;
            case 'users': return <UsersView userRole={authData.user?.role} users={liveUsers} />;
            case 'analytics': return <AnalyticsView />;
            case 'calendar': return <CalendarView />;
            case 'settings': return <SettingsView />;
            default: return null;
        }
    };

    return (
  <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">

      <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={authData.user}
          onLogout={handleLogout}
      />

      <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
      </main>

      {/* Support Chat Widget */}
      <SupportChat currentUser={authData.user} />
  </div>
);
}





// --- All other components ---
const AuthView = ({ onLogin, onRegister, isLoading, error }) => {
    const [isRegistering, setIsRegistering] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState('user');
    const handleSubmit = (e) => { e.preventDefault(); if (isRegistering) { onRegister(username, password, role, displayName); } else { onLogin(username, password); } };
    return ( <div className="flex items-center justify-center min-h-screen bg-gray-100"> <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg"> <img src="/logo.png" alt="MYpostmate Logo" className="mx-auto h-16 w-auto" /> <h1 className="text-3xl font-bold text-center text-gray-800">{isRegistering ? 'Create Account' : 'Welcome to MYpostmate'}</h1> <form className="space-y-6" onSubmit={handleSubmit}> {isRegistering && ( <div> <label htmlFor="displayName" className="text-sm font-bold text-gray-600 block">Display Name</label> <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500" required /> </div> )} <div> <label htmlFor="username" className="text-sm font-bold text-gray-600 block">Username (for login)</label> <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500" required /> </div> <div> <label htmlFor="password"  className="text-sm font-bold text-gray-600 block">Password</label> <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500" required /> </div> {isRegistering && ( <div> <label htmlFor="role" className="text-sm font-bold text-gray-600 block">Role</label> <select id="role" value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 mt-2 text-gray-700 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500"> <option value="user">User</option> <option value="moderator">Moderator</option> <option value="admin">Admin</option> </select> </div> )} {error && <p className="text-sm text-red-500 text-center">{error.message}</p>} <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400"> {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Sign In')} </button> </form> <div className="text-center"> <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="text-sm text-yellow-600 hover:underline"> {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"} </button> </div> </div> </div> );
};

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => ( <aside className="w-64 bg-white p-6 flex flex-col justify-between shadow-lg"> <div> <div className="flex items-center mb-10"> <img src="/logo.png" alt="MYpostmate Logo" className="h-8 w-auto mr-2" /> <h1 className="text-2xl font-bold text-yellow-500">MYpostmate</h1> </div> <nav> <ul> <NavItem icon={<LayoutDashboardIcon />} label="Dashboard" tabName="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} /> <NavItem icon={<BotIcon />} label="Generator" tabName="generator" activeTab={activeTab} setActiveTab={setActiveTab} /> <NavItem icon={<HistoryIcon />} label="History" tabName="history" activeTab={activeTab} setActiveTab={setActiveTab} /> <NavItem icon={<FileStackIcon />} label="Moderation Log" tabName="moderation" activeTab={activeTab} setActiveTab={setActiveTab} /> {user?.role === 'admin' && ( <> <NavItem icon={<UsersIcon />} label="Users" tabName="users" activeTab={activeTab} setActiveTab={setActiveTab} /> <NavItem icon={<AnalyticsIcon />} label="Analytics" tabName="analytics" activeTab={activeTab} setActiveTab={setActiveTab} /> </> )} <NavItem icon={<CalendarIcon />} label="Calendar" tabName="calendar" activeTab={activeTab} setActiveTab={setActiveTab} /> <NavItem icon={<SettingsIcon />} label="Settings" tabName="settings" activeTab={activeTab} setActiveTab={setActiveTab} /> </ul> </nav> </div> <div className="border-t pt-4"> <div className="flex items-center justify-center mb-4"> <UserIcon className="w-6 h-6 mr-2" /> <div> <p className="font-bold capitalize">{user?.display_name || user?.username}</p> <p className="text-xs text-gray-500 capitalize">{user?.role}</p> </div> </div> <button onClick={onLogout} className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700"> <LogOutIcon className="w-5 h-5 mr-2" /> Logout </button> </div> </aside> );
const NavItem = ({ icon, label, tabName, activeTab, setActiveTab }) => ( <li className="mb-4"> <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(tabName); }} className={`flex items-center p-3 rounded-lg ${activeTab === tabName ? 'bg-yellow-400 text-gray-900 shadow-md' : 'hover:bg-gray-100'}`} > <span className="mr-4">{icon}</span> <span className="font-semibold">{label}</span> </a> </li> );
const GeneratorView = ({ topic, setTopic, tone, setTone, platform, setPlatform, handleGenerate, isLoading, error, generatedPost, handlePostNow }) => { const canPostNow = generatedPost && generatedPost.status === 'approved'; const isPublished = generatedPost && generatedPost.status === 'published'; return ( <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full"> <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col border"> <h2 className="text-2xl font-bold mb-2">Create a new post</h2> <p className="text-gray-500 mb-6">Describe your post, and let AI do the rest.</p> <div className="flex flex-col space-y-6 flex-grow"> <div> <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Topic / Prompt</label> <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full h-32 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-yellow-500" /> </div> <div className="grid grid-cols-2 gap-6"> <div> <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">Tone of Voice</label> <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-yellow-500"> <option>Excited</option><option>Professional</option><option>Witty</option><option>Friendly</option><option>Urgent</option> </select> </div> <div> <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">Platform</label> <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-yellow-500"> <option>Instagram</option><option>Twitter / X</option><option>Facebook</option><option>LinkedIn</option> </select> </div> </div> </div> <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 font-bold py-4 px-4 rounded-lg flex items-center justify-center text-lg shadow-md"> {isLoading ? 'Generating...' : '✨ Generate Post'} </button> </div> <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col border"> <h2 className="text-2xl font-bold mb-6">Preview</h2> <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-xl bg-gray-50 p-4"> {isLoading && !generatedPost && <LoadingCard />} {error && <ErrorCard error={error} />} {!isLoading && !error && generatedPost && <PreviewCard post={generatedPost} />} {!isLoading && !error && !generatedPost && ( <div className="text-center text-gray-400"> <ImageIcon className="mx-auto h-12 w-12"/><p className="mt-2">Your post will appear here.</p> </div> )} </div> {generatedPost && !error && ( <div className="flex space-x-4 mt-6"> <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg">Schedule</button> <button onClick={handlePostNow} disabled={!canPostNow || isLoading} className={`flex-1 font-bold py-3 px-4 rounded-lg ${ canPostNow ? 'bg-green-500 hover:bg-green-600 text-white' : isPublished ? 'bg-blue-500 text-white cursor-default' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`} > {isLoading && 'Processing...'} {!isLoading && isPublished && 'Published'} {!isLoading && !isPublished && 'Post Now'} </button> </div> )} </div> </div> ); };
const LoadingCard = () => ( <div className="text-center text-gray-500"> <svg className="animate-spin mx-auto h-12 w-12 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <p className="mt-4">Generating...</p> </div> );
const ErrorCard = ({ error }) => ( <div className="p-6 bg-red-50 border rounded-lg text-center max-w-sm mx-auto"> <h3 className="text-xl font-bold text-red-700">Action Failed!</h3> <p className="text-red-600 mt-2 text-sm">{error.message}</p> <p className="text-xs text-red-500 mt-1">{error.status}</p> </div> );
const PreviewCard = ({ post }) => ( <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden border self-start"> <div className="p-2 bg-gray-100 text-xs font-bold text-center uppercase"> Status: <span className={`font-extrabold ${ post.status === 'approved' ? 'text-green-600' : post.status === 'published' ? 'text-blue-600' : 'text-yellow-600'}`}>{post.status}</span> </div> {post.image_url && <img src={post.image_url} alt="Generated post" className="w-full h-48 object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/FEE140/000000?text=Image+Error'; }} /> } <div className="p-4"> <p className="text-gray-700 whitespace-pre-wrap text-sm">{post.content}</p> <div className="mt-4 text-xs text-gray-500 font-semibold uppercase">{post.platform} Preview</div> </div> </div> );
const HistoryView = ({ posts }) => { if (!posts || !posts.length) { return ( <div> <h2 className="text-2xl font-bold mb-6">Post History</h2> <p className="text-gray-500">No posts have been generated yet.</p> </div> ); } return ( <div> <h2 className="text-2xl font-bold mb-6">Post History</h2> <div className="space-y-4"> {posts.map(post => ( <div key={post.id} className="bg-white p-4 rounded-lg shadow border"> <p className="font-bold">{post.topic}</p> <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{post.content}</p> <div className="text-xs text-gray-500 mt-2"> Status: <span className="font-semibold capitalize">{post.status}</span> | Created: {new Date(post.created_at).toLocaleString()} </div> </div> ))} </div> </div> ); };
const ModerationLogView = ({ user, onManualModeration }) => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const fetchInitialLogs = async () => { try { const initialLogs = await apiClient.request('/moderation-logs'); setLogs(initialLogs); } catch (error) { console.error("Failed to fetch initial logs:", error); }};
        fetchInitialLogs();
        const socket = io("http://localhost:3001");
        socket.on('new_log', (newLog) => setLogs(prev => [newLog, ...prev]));
        return () => socket.disconnect();
    }, []);

    const handleAction = (postId, newStatus) => { const reason = prompt(`Reason for this action (${newStatus}):`); if (reason) onManualModeration(postId, newStatus, reason);};
    const canModerate = user?.role === 'admin' || user?.role === 'moderator';

    return ( <div> <h2 className="text-2xl font-bold mb-6">Live Moderation Log</h2> <div className="bg-white p-6 rounded-xl shadow-lg border overflow-x-auto"> <table className="min-w-full"> <thead> <tr className="border-b"><th className="text-left p-2">Post ID</th><th className="text-left p-2">Action</th><th className="text-left p-2">Reason</th><th className="text-left p-2">Timestamp</th>{canModerate && <th className="text-left p-2">Manual Actions</th>}</tr> </thead> <tbody> {logs.map(log => ( <tr key={log.id} className="border-b hover:bg-gray-50"> <td className="p-2">{log.post_id}</td> <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${ log.action === 'rejected' ? 'bg-red-100 text-red-800' : log.action === 'quarantined' ? 'bg-orange-100 text-orange-800' : log.action === 'published' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800' }`}>{log.action}</span></td> <td className="p-2">{log.reason}</td> <td className="p-2">{new Date(log.created_at).toLocaleString()}</td> {canModerate && ( <td className="p-2 space-x-2"> {(log.action === 'quarantined' || log.action === 'pending' || log.action === 'approved') && ( <> <button onClick={() => handleAction(log.post_id, 'approved')} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">Approve</button> <button onClick={() => handleAction(log.post_id, 'rejected')} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">Reject</button> </> )} </td> )} </tr> ))} </tbody> </table> </div> </div> );
};
const DashboardView = ({ stats }) => ( <div> <h2 className="text-2xl font-bold mb-6">Real-Time Dashboard</h2> <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> <div className="bg-white p-6 rounded-xl shadow border"><h3 className="text-gray-500">Posts Today</h3><p className="text-4xl font-bold mt-2">{stats.postsToday}</p></div> <div className="bg-white p-6 rounded-xl shadow border"><h3 className="text-gray-500">New Users (24h)</h3><p className="text-4xl font-bold mt-2">{stats.newUsers}</p></div> <div className="bg-red-50 p-6 rounded-xl shadow border border-red-200"><h3 className="text-red-600">Violations (24h)</h3><p className="text-4xl font-bold mt-2 text-red-700">{stats.policyViolations}</p></div> </div> <div className="mt-8 bg-white p-6 rounded-xl shadow border"> <h3 className="text-lg font-bold mb-4">Community Activity Stream</h3> <p className="text-gray-500">This stream will update in real-time as new events occur...</p> </div> </div> );
const UsersView = ({ userRole, users }) => { if (userRole !== 'admin') { return <div className="p-6 bg-red-50 border border-red-200 rounded-lg">Access Denied. This page is for administrators only.</div> } return ( <div> <h2 className="text-2xl font-bold mb-6">User Management</h2> <div className="bg-white p-6 rounded-xl shadow border"> <table className="min-w-full"> <thead><tr className="border-b"><th className="text-left p-2">Name</th><th className="text-left p-2">Role</th><th className="text-left p-2">Joined</th></tr></thead> <tbody> {users.map(u => ( <tr key={u.id} className="border-b hover:bg-gray-50"> <td className="p-2">{u.display_name}</td> <td className="p-2 capitalize">{u.role}</td> <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td> </tr> ))} </tbody> </table> </div> </div> ); };
const AnalyticsView = () => ( <div> <h2 className="text-2xl font-bold mb-6">Content Analysis & User Behavior</h2> <p>Analytics coming soon...</p></div> );
const CalendarView = () => ( <div><h2 className="text-2xl font-bold mb-6">Calendar</h2><p>Calendar functionality coming soon.</p></div> );
const SettingsView = () => ( <div> <h2 className="text-2xl font-bold mb-6">Settings</h2> <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl border"> <h3 className="text-lg font-bold">API Configuration</h3> <p className="text-gray-600 mt-2"> API keys are managed on the backend server. </p> </div> </div> );

