
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CoursesIndex from "./pages/CoursesIndex";
import CoursePage from "./pages/CoursePage";
import ChapterPage from "./pages/ChapterPage";
import LessonPage from "./pages/LessonPage";
import LearningPage from "./pages/LearningPage";
import TaskPage from "./pages/TaskPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<CoursesIndex />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/courses/:courseId/chapters/:chapterId" element={<ChapterPage />} />
          <Route path="/courses/:courseId/chapters/:chapterId/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/courses/:courseId/chapters/:chapterId/lessons/:lessonId/learning/:topicId?" element={<LearningPage />} />
          <Route path="/courses/:courseId/chapters/:chapterId/tasks/:taskId" element={<TaskPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
