// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ReviewRulesPage from './pages/ReviewRulesPage';
import TestConfigsPage from './pages/TestConfigsPage';
import EventLogsPage from './pages/EventLogsPage';
import MergeReviewsPage from './pages/MergeReviewsPage';
import FunctionalTestsPage from './pages/FunctionalTestsPage';
import PromotionsPage from './pages/PromotionsPage';
import UserStatsPage from './pages/UserStatsPage';
import SprintDetailPage from './pages/SprintDetailPage';
import TaskPipelinePage from './pages/TaskPipelinePage';

// Constants
import { ROUTES } from './utils/constants';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<AppLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.INTEGRATIONS} element={<IntegrationsPage />} />
              <Route path={ROUTES.REVIEW_RULES} element={<ReviewRulesPage />} />
              <Route path={ROUTES.TEST_CONFIGS} element={<TestConfigsPage />} />
              <Route path={ROUTES.EVENT_LOGS} element={<EventLogsPage />} />
              <Route path={ROUTES.MERGE_REVIEWS} element={<MergeReviewsPage />} />
              <Route path={ROUTES.FUNCTIONAL_TESTS} element={<FunctionalTestsPage />} />
              <Route path={ROUTES.PROMOTIONS} element={<PromotionsPage />} />
              <Route path={ROUTES.USER_STATS} element={<UserStatsPage />} />
              <Route path={`${ROUTES.SPRINT_DETAIL}/:sprintId`} element={<SprintDetailPage />} />
              <Route path="/tasks/:taskId/pipeline" element={<TaskPipelinePage />} />
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
