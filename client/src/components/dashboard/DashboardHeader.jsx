	import React, { useEffect, useMemo, useRef, useState } from 'react';
	import { Search, Bell, UserCircle2 } from 'lucide-react';
	import { useNavigate } from 'react-router-dom';
	import { useAuth } from '../../context/AuthContext';
	import { getNotifications, markAllAsRead, markAsRead } from '../../api/notification.api';

	const DashboardHeader = ({ onSearch }) => {
		const { user } = useAuth();
		const navigate = useNavigate();
		const panelRef = useRef(null);
		const [query, setQuery] = useState('');
		const [showNotifications, setShowNotifications] = useState(false);
		const [notifications, setNotifications] = useState([]);
		const [notificationsLoading, setNotificationsLoading] = useState(false);

		const initials = useMemo(() => {
			const label = user?.username || user?.email || 'User';
			return label
				.split(' ')
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase())
				.join('');
		}, [user?.username, user?.email]);

		const unreadCount = notifications.filter((item) => !item.isRead).length;

		const handleSearchChange = (e) => {
			const value = e.target.value;
			setQuery(value);
			if (typeof onSearch === 'function') {
				onSearch(value);
			}
		};

		const loadNotifications = async () => {
			setNotificationsLoading(true);
			try {
				const res = await getNotifications();
				setNotifications(res.data?.data || []);
			} catch (error) {
				console.error('Failed to load notifications:', error);
			} finally {
				setNotificationsLoading(false);
			}
		};

		const handleBellClick = async () => {
			const next = !showNotifications;
			setShowNotifications(next);
			if (next) {
				await loadNotifications();
			}
		};

		const handleNotificationClick = async (notification) => {
			try {
				if (!notification.isRead) {
					await markAsRead(notification._id);
					setNotifications((prev) =>
						prev.map((item) =>
							item._id === notification._id ? { ...item, isRead: true } : item
						)
					);
				}
			} catch (error) {
				console.error('Failed to mark notification as read:', error);
			}

			if (notification.link) {
				navigate(notification.link);
				setShowNotifications(false);
			}
		};

		const handleMarkAllRead = async () => {
			try {
				await markAllAsRead();
				setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
			} catch (error) {
				console.error('Failed to mark all notifications as read:', error);
			}
		};

		useEffect(() => {
			const handleOutsideClick = (event) => {
				if (panelRef.current && !panelRef.current.contains(event.target)) {
					setShowNotifications(false);
				}
			};

			if (showNotifications) {
				document.addEventListener('mousedown', handleOutsideClick);
			}

			return () => {
				document.removeEventListener('mousedown', handleOutsideClick);
			};
		}, [showNotifications]);

		return (
			<header className="w-full py-8 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between relative z-[40]">
				<div>
					<p className="font-space text-[10px] uppercase tracking-[0.3em] text-secondary font-bold mb-1 opacity-80">
						Neural Command Center
					</p>
					<h1 className="font-space text-2xl sm:text-3xl text-white font-bold tracking-tight">
						Welcome, <span className="premium-gradient-text">{user?.username || 'Candidate'}</span>
					</h1>
				</div>

				<div className="flex items-center gap-4 w-full lg:w-auto">
					{/* Search Bar */}
					<div className="relative flex-1 lg:w-[420px] group">
						<Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" />
						<input
							type="text"
							value={query}
							onChange={handleSearchChange}
							placeholder="Search talent, roles, or reports..."
							className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl py-3.5 pl-14 pr-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-secondary/30 focus:bg-slate-900/60 transition-all shadow-inner"
							aria-label="Search dashboard items"
						/>
					</div>

					<div className="flex items-center gap-3">
						{/* Notifications */}
						<div className="relative" ref={panelRef}>
							<button
								type="button"
								onClick={handleBellClick}
								className={`relative w-12 h-12 rounded-2xl border transition-all flex items-center justify-center ${
									showNotifications 
										? 'bg-secondary/10 border-secondary/30 text-secondary' 
										: 'bg-white/2 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
								}`}
								aria-label="Notifications"
							>
								<Bell size={18} />
								{unreadCount > 0 && (
									<span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
								)}
							</button>

							{showNotifications && (
								<div className="absolute right-0 mt-4 w-[360px] max-w-[90vw] glass-surface rounded-[2rem] border border-white/10 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
									<div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
										<h3 className="text-sm font-space font-bold text-white tracking-wider">NOTIFICATIONS</h3>
										<button
											type="button"
											onClick={handleMarkAllRead}
											className="text-[10px] uppercase tracking-widest text-secondary font-bold hover:text-white transition-colors"
										>
											Clear All
										</button>
									</div>
									<div className="max-h-[380px] overflow-y-auto custom-scrollbar">
										{notificationsLoading && (
											<div className="flex flex-col items-center py-10 gap-3">
												<div className="spinner !border-t-secondary" />
												<p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Synchronizing...</p>
											</div>
										)}
										{!notificationsLoading && notifications.length === 0 && (
											<div className="px-6 py-12 text-center">
												<p className="text-sm text-slate-500 font-medium">Neural link clear. No alerts.</p>
											</div>
										)}
										{!notificationsLoading && notifications.map((notification) => (
											<button
												key={notification._id}
												type="button"
												onClick={() => handleNotificationClick(notification)}
												className={`w-full text-left px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-colors ${notification.isRead ? 'opacity-50' : ''}`}
											>
												<p className="text-sm font-semibold text-white mb-1">{notification.title}</p>
												<p className="text-xs text-slate-400 leading-relaxed">{notification.message}</p>
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Profile */}
						<button
							type="button"
							onClick={() => navigate('/dashboard/settings')}
							className="relative group shrink-0"
						>
							<div className="w-12 h-12 rounded-2xl p-[1.5px] premium-gradient-bg shadow-lg group-hover:active-glow transition-all">
								<div className="w-full h-full rounded-[14px] bg-[#0c0c1d] flex items-center justify-center overflow-hidden">
									<img 
										src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=random&color=auto`} 
										className="w-full h-full object-cover"
										alt="Profile"
									/>
								</div>
							</div>
							<div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-[#0B0F1A]" />
						</button>
					</div>
				</div>
			</header>
		);
	};

	export default DashboardHeader;
     