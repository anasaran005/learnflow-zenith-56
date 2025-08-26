// LearningPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, BookOpen, Award, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import {
  fetchTopics,
  fetchQuiz,
  organizeTopics,
  organizeQuiz,
  getTopicsForLesson,
  getQuizForLesson,
  getWatchedTopics,
  markTopicWatched,
  getQuizScore,
  setQuizScore,
  isQuizPassed,
  setQuizPassed,
  Topic,
  QuizQuestion,
} from "@/lib/learning";
import { fetchTasks, organizeTasks, findLesson } from "@/lib/csv";

const CSV_URL =
  import.meta.env.VITE_CSV_URL ||
  "https://raw.githubusercontent.com/anasaran005/learnflow-zenith-56/a0d9572f1d8cb6a75180cc62ebbace2f75153ec5/coursecsv/pro%20training%20tasks%20-%20Sheet1.csv";

export default function LearningPage() {
  const { courseId, chapterId, lessonId, topicId } = useParams<{
    courseId: string;
    chapterId: string;
    lessonId: string;
    topicId?: string;
  }>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonName, setLessonName] = useState<string>("");

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScoreState] = useState(0);

  useEffect(() => {
    loadLearningData();
  }, [courseId, chapterId, lessonId, topicId]);

  const loadLearningData = async () => {
    if (!courseId || !chapterId || !lessonId) return;

    try {
      setLoading(true);
      const startTime = Date.now(); // Track loading start time

      const [topicRows, quizRows, taskRows] = await Promise.all([
        fetchTopics(),
        fetchQuiz(),
        fetchTasks(CSV_URL),
      ]);

      const allTopics = organizeTopics(topicRows);
      const allQuiz = organizeQuiz(quizRows);
      const courses = organizeTasks(taskRows);

      const lessonTopics = getTopicsForLesson(allTopics, lessonId);
      const lessonQuiz = getQuizForLesson(allQuiz, lessonId);

      const lesson = findLesson(courses, courseId, chapterId, lessonId);
      if (lesson) setLessonName(lesson.name);

      setTopics(lessonTopics);
      setQuizQuestions(lessonQuiz);

      if (topicId) {
        const topic = lessonTopics.find((t) => t.id === topicId);
        if (topic) {
          setCurrentTopic(topic);
          markTopicWatched(lessonId, topicId);
          window.dispatchEvent(new Event("progress:updated")); // 🔥 notify chapter
        }
      } else if (lessonTopics.length > 0) {
        setCurrentTopic(lessonTopics[0]);
      }

      const existingScore = getQuizScore(lessonId);
      if (existingScore !== null) {
        setQuizScoreState(existingScore);
        setQuizCompleted(true);
      }

      // Calculate elapsed time and ensure minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 2000; // 2 seconds
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Wait for remaining time if needed
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load learning data"
      );
      console.error("Error loading learning data:", err);
      
      // Still respect minimum loading time even on error
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setCurrentTopic(topic);

    if (lessonId && topic.id) {
      markTopicWatched(lessonId, topic.id);
      
      // Check if all topics are now watched
      const updatedWatchedTopics = getWatchedTopics(lessonId);
      if (updatedWatchedTopics.length === topics.length && topics.length > 0) {
        // All topics watched - mark learning as completed
        const learningDoneKey = `lesson_${lessonId}_learningDone`;
        localStorage.setItem(learningDoneKey, "true");
        
        // Add to completed lessons list
        if (courseId) {
          const completedLessonsKey = `course_${courseId}_completed_lessons`;
          const completedLessons = JSON.parse(localStorage.getItem(completedLessonsKey) || "[]") as string[];
          if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
            localStorage.setItem(completedLessonsKey, JSON.stringify(completedLessons));
          }
        }
      }
      
      window.dispatchEvent(new Event("progress:updated")); // 🔥 notify chapter
    }

    navigate(
      `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/learning/${topic.id}`
    );
  };

  const handleQuizStart = () => {
    setShowQuiz(true);
    setCurrentQuizQuestion(0);
    setSelectedAnswers([]);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuizQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

const handleNextQuestion = async () => {
  if (currentQuizQuestion < quizQuestions.length - 1) {
    setCurrentQuizQuestion(currentQuizQuestion + 1);
  } else {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correctIndex) correct++;
    });
    const scorePercentage = (correct / quizQuestions.length) * 100;
    const passed = scorePercentage >= 80;

    setQuizScoreState(scorePercentage);
    setQuizScore(lessonId!, scorePercentage);
    setQuizPassed(lessonId!, passed);
    setQuizCompleted(true);

    toast({
      title: passed ? "🎉 Quiz Passed!" : "📚 Quiz Not Passed",
      description: passed
        ? "Congratulations! You can now access the simulation tasks."
        : "You need 80% to pass. You can retake the quiz anytime.",
    });

    try {
      // Mark learning as done (whether passed or not)
      if (lessonId && courseId) {
        const learningDoneKey = `lesson_${lessonId}_learningDone`;
        localStorage.setItem(learningDoneKey, "true");
      }

      // Add completed lesson to the central list (whether passed or not)
      if (courseId && lessonId) {
        const completedLessonsKey = `course_${courseId}_completed_lessons`;
        const completedLessons = JSON.parse(
          localStorage.getItem(completedLessonsKey) || "[]"
        ) as string[];
        
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
          localStorage.setItem(
            completedLessonsKey,
            JSON.stringify(completedLessons)
          );
        }
      }

      // Notify chapter page to update progress
      window.dispatchEvent(new Event("progress:updated"));
    } catch (err) {
      console.error("Error in quiz completion:", err);
    }
  }
};

  const handleStartSimulation = async () => {
    try {
      const taskRows = await fetchTasks(CSV_URL);
      const courses = organizeTasks(taskRows);
      const lesson = findLesson(courses, courseId!, chapterId!, lessonId!);

      if (lesson && lesson.tasks.length > 0) {
        navigate(
          `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
          { state: { defaultTab: "tasks", from: "quiz" } }
        );
      } else {
        toast({
          title: "No Tasks Available",
          description: "No simulation tasks found for this lesson.",
        });
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load simulation tasks.",
      });
    }
  };

  const watchedTopics = getWatchedTopics(lessonId || "");
  const isQuizUnlocked =
    topics.length > 0 && watchedTopics.length === topics.length;
  const isPassed = isQuizPassed(lessonId || "");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <Header />
        
        {/* Floating particles background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-40" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-50" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-45" style={{animationDelay: '0.5s', animationDuration: '2.8s'}}></div>
          <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-green-400 rounded-full animate-bounce opacity-50" style={{animationDelay: '1.5s', animationDuration: '2.5s'}}></div>
          <div className="absolute bottom-1/2 right-1/6 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce opacity-40" style={{animationDelay: '2.5s', animationDuration: '3.2s'}}></div>
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-8">
            {/* Large spinning ring with gradient effect */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-8 border-muted opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-r-pink-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-6 border-transparent border-b-purple-500 border-l-yellow-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              <div className="absolute inset-8 rounded-full border-4 border-transparent border-t-green-500 animate-spin" style={{animationDuration: '0.8s'}}></div>
            </div>
            
            <div className="text-center">
              <p className="text-xl font-bold text-foreground mb-2 animate-pulse">Loading learning content...</p>
              <p className="text-sm text-muted-foreground animate-bounce">🎯 Preparing your educational journey!</p>
              
              {/* Loading progress dots */}
              <div className="flex justify-center mt-4 space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-destructive-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Learning Content Not Found</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link to={`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`}>
                <Button>Back to Lesson</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showQuiz && !quizCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Lesson Quiz - {lessonName}</span>
                  <Badge variant="outline">
                    Question {currentQuizQuestion + 1} of {quizQuestions.length}
                  </Badge>
                </CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Progress value={((currentQuizQuestion + 1) / quizQuestions.length) * 100} />
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      {quizQuestions[currentQuizQuestion]?.question}
                    </h3>
                    
                    <div className="space-y-3">
                      {quizQuestions[currentQuizQuestion]?.options.map((option, index) => (
                        <div
                          key={index}
                          className={`w-full p-4 rounded-md border cursor-pointer transition-colors min-h-[3rem] ${
                            selectedAnswers[currentQuizQuestion] === index 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background border-border hover:bg-accent hover:text-accent-foreground'
                          }`}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <div className="text-left break-words whitespace-normal leading-relaxed">
                            {option}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuiz(false)}
                    >
                      Back to Learning
                    </Button>
                    
                    <Button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers[currentQuizQuestion] === undefined}
                    >
                      {currentQuizQuestion === quizQuestions.length - 1 ? "Complete Quiz" : "Next Question"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {/* Video Player */}
            <Card>
  <CardContent className="p-0">
    {currentTopic?.youtubeId ? (
      <>
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentTopic.youtubeId}?modestbranding=1&controls=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&end=${Math.floor(Math.random() * 1000) + 1}`}
            title={currentTopic.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-t-lg"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">{currentTopic.title}</h2>
          <p className="text-muted-foreground">{currentTopic.description}</p>
        </div>
      </>
    ) : (
      <div className="aspect-video bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No video available</p>
      </div>
    )}
  </CardContent>
</Card> 

            {/* Quiz Results */}
            {quizCompleted && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quiz Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Your Score:</span>
                      <Badge variant={isPassed ? "default" : "destructive"}>
                        {quizScore}%
                      </Badge>
                    </div>
                    <Progress value={quizScore} />
                    
                    <div className="space-y-4">
                      {isPassed ? (
                        <>
                          <p className="text-success">Congratulations! You passed the quiz.</p>
                          <Button onClick={handleStartSimulation} className="w-full">
                            Start Workplace Simulation
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-destructive">You need 80% to pass. Try again!</p>
                          <Button onClick={handleQuizStart} variant="outline" className="w-full">
                            Retake Quiz
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topics List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <Button
                     key={topic.id}
                     variant={currentTopic?.id === topic.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3 whitespace-normal break-words"
                       onClick={() => handleTopicSelect(topic)}
                       >
                    <div className="flex items-start gap-3">
                   {watchedTopics.includes(topic.id) ? (
                     <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    ) : (
                   <Play className="h-4 w-4" />
                     )}
                   <div className="min-w-0">
                 <div className="font-medium break-words">{topic.title}</div>
                     <div className="text-xs text-muted-foreground">
                  Topic {topic.order}
                    </div>
                 </div>
             </div>
                 </Button>

                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Topics Completed</span>
                      <span>{watchedTopics.length}/{topics.length}</span>
                    </div>
                    <Progress value={topics.length > 0 ? (watchedTopics.length / topics.length) * 100 : 0} />
                  </div>

                  {isQuizUnlocked ? (
                    <Button 
                      onClick={handleQuizStart} 
                      className="w-full"
                      disabled={showQuiz}
                    >
                      {quizCompleted ? "Retake Quiz" : "Take Quiz"}
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Complete All Topics to Unlock Quiz
                    </Button>
                  )}

                  {isPassed && (
                    <div className="text-center">
                      <Badge className="mb-2">Quiz Passed!</Badge>
                      <p className="text-sm text-muted-foreground">
                        You can now access simulation tasks
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}