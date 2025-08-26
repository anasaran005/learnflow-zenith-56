import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop"; // Add this import
import Lessoncomplete from "./pages/Lessoncomplete";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CoursesIndex from "./pages/CoursesIndex";
import CoursePage from "./pages/CoursePage";
import ChapterPage from "./pages/ChapterPage";
import LessonPage from "./pages/LessonPage";
import LearningPage from "./pages/LearningPage";
import TaskPage from "./pages/TaskPage";
import AuthPage from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop /> {/* Add this component here */}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected routes */}
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/chapters/:chapterId"
              element={
                <ProtectedRoute>
                  <ChapterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/chapters/:chapterId/lessons/:lessonId"
              element={<LessonPage />}
            />
            <Route
              path="/courses/:courseId/chapters/:chapterId/lessons/:lessonId/learning/:topicId?"
              element={<LearningPage />}
            />
            <Route
              path="/courses/:courseId/chapters/:chapterId/tasks/:taskId"
              element={<TaskPage />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson-complete"
              element={<Lessoncomplete />}
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;