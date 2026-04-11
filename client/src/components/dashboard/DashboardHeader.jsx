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
			<header className="w-full py-6 sm:py-8 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center sm:justify-between">
				<div>
					<p className="font-space text-[10px] uppercase tracking-[0.2em] text-[#5de6ff] font-bold">
						Command Center
					</p>
					<h1 className="font-space text-xl sm:text-2xl text-white font-bold tracking-tight mt-1">
						Welcome back, {user?.username || 'Candidate'}
					</h1>
				</div>

				<div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
					<div className="relative flex-1 sm:flex-none sm:w-[320px]">
						<Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
						<input
							type="text"
							value={query}
							onChange={handleSearchChange}
							placeholder="Search reports, roles, or sessions"
							className="glass-input !py-3 !pl-11 !pr-4 text-sm"
							aria-label="Search dashboard items"
						/>
					</div>

					<div className="relative" ref={panelRef}>
						<button
							type="button"
							onClick={handleBellClick}
							className="relative w-11 h-11 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[#c0c1ff] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors flex items-center justify-center"
							aria-label="Notifications"
						>
							<Bell size={17} />
							{unreadCount > 0 && (
								<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center">
									{unreadCount > 9 ? '9+' : unreadCount}
								</span>
							)}
						</button>

						{showNotifications && (
							<div className="absolute right-0 mt-2 w-[320px] max-w-[90vw] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0c0c1d] shadow-2xl z-50 overflow-hidden">
								<div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
									<h3 className="text-sm font-space font-bold text-white">Notifications</h3>
									<button
										type="button"
										onClick={handleMarkAllRead}
										className="text-[10px] uppercase tracking-wider text-[#5de6ff] font-bold"
									>
										Mark all read
									</button>
								</div>
								<div className="max-h-[320px] overflow-y-auto">
									{notificationsLoading && (
										<p className="px-4 py-6 text-sm text-[#94a3b8]">Loading notifications...</p>
									)}
									{!notificationsLoading && notifications.length === 0 && (
										<p className="px-4 py-6 text-sm text-[#94a3b8]">No notifications yet.</p>
									)}
									{!notificationsLoading && notifications.map((notification) => (
										<button
											key={notification._id}
											type="button"
											onClick={() => handleNotificationClick(notification)}
											className={`w-full text-left px-4 py-3 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] ${notification.isRead ? 'opacity-70' : ''}`}
										>
											<p className="text-sm font-semibold text-white">{notification.title}</p>
											<p className="text-xs text-[#94a3b8] mt-0.5">{notification.message}</p>
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={() => navigate('/dashboard/settings')}
						className="w-11 h-11 rounded-xl ai-gradient-bg p-[1px] shrink-0"
						title={user?.email || 'User profile'}
						aria-label="Open settings"
					>
						<div className="w-full h-full rounded-xl bg-[#0c0c1d] flex items-center justify-center text-[#5de6ff] font-space font-bold text-xs">
							{initials || <UserCircle2 size={16} />}
						</div>
					</button>
				</div>
			</header>
		);
	};

	export default DashboardHeader;
     