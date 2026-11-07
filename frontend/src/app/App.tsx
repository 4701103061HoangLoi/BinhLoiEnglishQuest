import { useEffect } from 'react';
import {
  createBrowserRouter,
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { Compass, Gamepad2, Map, Settings, Trophy } from 'lucide-react';
import {
  HomePage,
  TopicsPage,
  TopicPage,
  VocabularyPage,
  GrammarPage,
} from '../pages/LearningPages';
import { ChallengesPage } from '../pages/ChallengesPage';
import { QuestPage } from '../pages/QuestPage';
import { DemoPage } from '../pages/DemoPage';
import { GamePage } from '../pages/GamePage';
import {
  ResultsPage,
  AchievementsPage,
  SettingsPage,
} from '../pages/ProgressPages';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { EmptyState } from '../components/Common';
import { ProgressProvider, useProgress } from '../contexts/ProgressContext';
function Layout() {
  const { error } = useProgress();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link
            to="/"
            className="brand"
            aria-label="Bình Lợi English Quest — Trang chủ"
          >
            <span className="brand-icon">
              <Compass size={27} />
            </span>
            <span>
              Bình Lợi<strong>English Quest</strong>
            </span>
          </Link>
          <nav aria-label="Điều hướng chính">
            <NavLink to="/topics">
              <Map size={18} />
              Khám phá
            </NavLink>
            <NavLink to="/challenges">
              <Gamepad2 size={18} />
              Thử thách
            </NavLink>
            <NavLink to="/achievements">
              <Trophy size={18} />
              Thành tích
            </NavLink>
            <NavLink to="/leaderboard">
              <Trophy size={18} />
              Xếp hạng
            </NavLink>
            <NavLink to="/settings">
              <Settings size={18} />
              Cài đặt
            </NavLink>
          </nav>
          <BackgroundMusic />
        </div>
      </header>
      {error && (
        <div className="storage-warning" role="status">
          {error}
        </div>
      )}
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <Link to="/" className="footer-brand">
          <Compass size={22} />
          Bình Lợi English Quest
        </Link>
        <span>Luyện từ vựng và ngữ pháp tiếng Anh lớp 6</span>
        <span>Học và chơi cùng Mây</span>
      </footer>
    </>
  );
}
const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: (
      <EmptyState title="Trang chưa tải được">
        Bạn thử tải lại trang nhé.
      </EmptyState>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/demo', element: <DemoPage /> },
      { path: '/challenges', element: <ChallengesPage /> },
      { path: '/quest/:topicId', element: <QuestPage /> },
      { path: '/topics', element: <TopicsPage /> },
      { path: '/topics/:topicId', element: <TopicPage /> },
      { path: '/topics/:topicId/vocabulary', element: <VocabularyPage /> },
      { path: '/topics/:topicId/grammar', element: <GrammarPage /> },
      { path: '/play/:topicId/:gameId', element: <GamePage /> },
      { path: '/results/:runId', element: <ResultsPage /> },
      { path: '/achievements', element: <AchievementsPage /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <EmptyState title="Không tìm thấy trang" /> },
    ],
  },
]);
export default function App() {
  return (
    <ProgressProvider>
      <RouterProvider router={router} />
    </ProgressProvider>
  );
}
