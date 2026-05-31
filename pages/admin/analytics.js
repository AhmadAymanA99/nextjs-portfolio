import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Layout from '../../components/layout';
import styles from '../../styles/Admin.module.css';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [pageViews, setPageViews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const router = useRouter();

  const fetchAnalytics = (filterDays) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    let url = '/api/admin/analytics';
    if (filterDays) url += `?days=${filterDays}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          router.replace('/admin/login');
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setPageViews(data.recentViews);
        setRefreshedAt(new Date().toLocaleTimeString());
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const timeAgo = (ts) => {
    try { return formatDistanceToNow(new Date(ts), { addSuffix: true }); }
    catch { return '—'; }
  };

  const deviceClass = (type) => {
    if (type === 'mobile') return styles.badgeMobile;
    if (type === 'tablet') return styles.badgeTablet;
    return styles.badgeDesktop;
  };

  const truncate = (str, len) => {
    if (!str || str.length <= len) return str || '—';
    return str.slice(0, len) + '…';
  };

  const fetchMessages = () => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/messages', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('admin_token');
          router.replace('/admin/login');
          throw new Error('Session expired');
        }
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then((data) => setMessages(data.messages))
      .catch(() => {});
  };

  useEffect(() => {
    if (tab === 'messages') fetchMessages();
  }, [tab]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.replace('/admin/login');
  };

  const handleFilter = (d) => {
    setDays(d);
  };

  if (isLoading && !stats) {
    return (
      <Layout>
        <div className={styles.adminContainer}>
          <h1>Website Analytics</h1>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error && !stats) {
    return (
      <Layout>
        <div className={styles.adminContainer}>
          <h1>Website Analytics</h1>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => fetchAnalytics(days)}>Retry</button>
        </div>
      </Layout>
    );
  }

  const { mobile = 0, desktop = 0 } = stats?.deviceDistribution || {};

  return (
    <Layout>
      <div className={styles.adminContainer}>
        <nav className={styles.nav}>
          <span className={`${styles.navLink} ${styles.navLinkActive}`}>
            Dashboard
          </span>
          <Link href="/" className={styles.navLink}>
            View Site
          </Link>
          <div className={styles.navRight}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1>Website Analytics</h1>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Views</h3>
            <p>{stats?.totalViews}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Unique Visitors</h3>
            <p>{stats?.uniqueVisitors}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Top Country</h3>
            <p>{stats?.topCountry || 'N/A'}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Device Distribution</h3>
            <div className={styles.chartSection}>
              <div className={styles.chartRow}>
                <span className={styles.chartLabel}>Desktop</span>
                <div className={styles.chartBar}>
                  <div
                    className={styles.chartBarFill}
                    style={{ width: `${desktop}%` }}
                  />
                </div>
                <span className={styles.chartValue}>{desktop}%</span>
              </div>
              <div className={styles.chartRow}>
                <span className={styles.chartLabel}>Mobile</span>
                <div className={styles.chartBar}>
                  <div
                    className={styles.chartBarFill}
                    style={{ width: `${mobile}%` }}
                  />
                </div>
                <span className={styles.chartValue}>{mobile}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${days === null ? styles.filterBtnActive : ''}`}
            onClick={() => handleFilter(null)}
          >
            All time
          </button>
          <button
            className={`${styles.filterBtn} ${days === 7 ? styles.filterBtnActive : ''}`}
            onClick={() => handleFilter(7)}
          >
            Last 7 days
          </button>
          <button
            className={`${styles.filterBtn} ${days === 30 ? styles.filterBtnActive : ''}`}
            onClick={() => handleFilter(30)}
          >
            Last 30 days
          </button>
          {refreshedAt && (
            <span className={styles.refreshedAt}>
              Refreshed: {refreshedAt}
            </span>
          )}
          <button
            className={styles.refreshBtn}
            onClick={() => fetchAnalytics(days)}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${tab === 'analytics' ? styles.tabActive : ''}`}
            onClick={() => setTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`${styles.tab} ${tab === 'messages' ? styles.tabActive : ''}`}
            onClick={() => setTab('messages')}
          >
            Messages {messages.length > 0 && `(${messages.length})`}
          </button>
        </div>

        {tab === 'analytics' && (
          <>
            <h2>Recent Page Views</h2>
            {isLoading && <p>Loading...</p>}
            <div className={styles.tableWrapper}>
              <table className={styles.viewsTable}>
                <thead>
                  <tr>
                    <th className={styles.colPath}>Path</th>
                    <th className={styles.colCountry}>Country</th>
                    <th className={styles.colDevice}>Device</th>
                    <th className={styles.colReferrer}>Referrer</th>
                    <th className={styles.colTime}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {pageViews?.length > 0 ? (
                    pageViews.map((view, index) => (
                      <tr key={index} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                        <td className={styles.cellPath} title={view.path}>
                          {truncate(view.path, 40)}
                        </td>
                        <td>
                          <span className={styles.countryChip}>{view.country || '—'}</span>
                        </td>
                        <td>
                          <span className={`${styles.deviceBadge} ${deviceClass(view.device_type)}`}>
                            {view.device_type || 'desktop'}
                          </span>
                        </td>
                        <td className={styles.cellReferrer} title={view.referrer}>
                          {view.referrer && !view.referrer.startsWith('direct') ? truncate(view.referrer, 35) : '—'}
                        </td>
                        <td className={styles.cellTime} title={new Date(view.timestamp).toLocaleString()}>
                          {timeAgo(view.timestamp)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        No page views yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'messages' && (
          <>
            <h2>Contact Messages</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.viewsTable}>
                <thead>
                  <tr>
                    <th className={styles.colName}>Name</th>
                    <th className={styles.colEmail}>Email</th>
                    <th className={styles.colSubject}>Subject</th>
                    <th className={styles.colMessage}>Message</th>
                    <th className={styles.colTime}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <tr key={msg.id} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                        <td className={styles.cellName}>{msg.name}</td>
                        <td className={styles.cellEmail}>
                          <a href={`mailto:${msg.email}`} className={styles.emailLink}>{msg.email}</a>
                        </td>
                        <td className={styles.cellSubject}>{msg.subject || '—'}</td>
                        <td className={styles.cellMessage} title={msg.message}>
                          {truncate(msg.message, 80)}
                        </td>
                        <td className={styles.cellTime} title={new Date(msg.created_at).toLocaleString()}>
                          {timeAgo(msg.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.emptyRow}>
                        No messages yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
