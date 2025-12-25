import { useEffect, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { subDays, format } from 'date-fns';
import '../styles/Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [stats7Days, setStats7Days] = useState({
    impressions: 0,
    likes: 0,
    comments: 0,
  });
  const [stats30Days, setStats30Days] = useState({
    impressions: 0,
    likes: 0,
    comments: 0,
  });
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const loadInsights = async () => {
      try {
        const insightsRef = collection(db, 'users', user.uid, 'postInsights');
        const insightsSnap = await getDocs(insightsRef);
        const insightsList = insightsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInsights(insightsList);

        // Calculate 7-day stats
        const sevenDaysAgo = subDays(new Date(), 7);
        const sevenDayInsights = insightsList.filter(
          (insight) => new Date(insight.date) >= sevenDaysAgo
        );
        const stats7 = sevenDayInsights.reduce(
          (acc, insight) => ({
            impressions: acc.impressions + (insight.impressions || 0),
            likes: acc.likes + (insight.likes || 0),
            comments: acc.comments + (insight.comments || 0),
          }),
          { impressions: 0, likes: 0, comments: 0 }
        );
        setStats7Days(stats7);

        // Calculate 30-day stats
        const thirtyDaysAgo = subDays(new Date(), 30);
        const thirtyDayInsights = insightsList.filter(
          (insight) => new Date(insight.date) >= thirtyDaysAgo
        );
        const stats30 = thirtyDayInsights.reduce(
          (acc, insight) => ({
            impressions: acc.impressions + (insight.impressions || 0),
            likes: acc.likes + (insight.likes || 0),
            comments: acc.comments + (insight.comments || 0),
          }),
          { impressions: 0, likes: 0, comments: 0 }
        );
        setStats30Days(stats30);

        // Get top 3 posts by impressions
        const sortedByImpressions = [...insightsList]
          .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
          .slice(0, 3);
        setTopPosts(sortedByImpressions);
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    };

    loadInsights();
  }, [user]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="analytics-header-icon">
          <FiBarChart2 />
        </div>
        <div>
          <h1>Analytics</h1>
          <p>Track your post performance</p>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-section">
          <h2>Last 7 Days</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Impressions</div>
              <div className="stat-value">{stats7Days.impressions.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Likes</div>
              <div className="stat-value">{stats7Days.likes.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Comments</div>
              <div className="stat-value">{stats7Days.comments.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h2>Last 30 Days</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Impressions</div>
              <div className="stat-value">{stats30Days.impressions.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Likes</div>
              <div className="stat-value">{stats30Days.likes.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Comments</div>
              <div className="stat-value">{stats30Days.comments.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="top-posts-section">
        <h2>Top Posts by Impressions</h2>
        {topPosts.length === 0 ? (
          <p className="empty-state">No post insights available yet.</p>
        ) : (
          <div className="top-posts-grid">
            {topPosts.map((post, index) => (
              <div key={post.id} className="top-post-card">
                <div className="post-rank">#{index + 1}</div>
                <div className="post-metrics">
                  <div className="metric">
                    <span className="metric-label">Impressions:</span>
                    <span className="metric-value">
                      {(post.impressions || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Likes:</span>
                    <span className="metric-value">{(post.likes || 0).toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Comments:</span>
                    <span className="metric-value">
                      {(post.comments || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                {post.date && (
                  <div className="post-date">
                    {format(new Date(post.date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

