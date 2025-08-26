import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import Header from '@/components/Header';
import Card, { CardContent } from '@/components/Card';
import { PrimaryButton } from '@/components/Button';
import { Award, RotateCcw, Check } from 'lucide-react';

export default function LessonComplete() {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  
  // 👇 get courseId, chapterId, lessonId from navigate state
  const location = useLocation();
  const { courseId, chapterId, lessonId } = (location.state || {}) as {
    courseId?: string;
    chapterId?: string;
    lessonId?: string;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Confetti width={width} height={height} recycle={false} numberOfPieces={150} />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <Card className="text-center overflow-hidden">
            <CardContent className="p-12">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-success rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Award className="w-12 h-12 text-success-foreground" />
              </motion.div>
              
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-4xl font-heading font-bold text-foreground mb-4"
              >
                🎉 Congratulations!
              </motion.h1>
              
              {/* Subtitle */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-xl font-semibold text-muted-foreground mb-8"
              >
                You've completed today's lesson — keep up the great work! 💪
              </motion.h2>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg mx-auto"
              >
                ✨ Want to polish what you learned today? <br />
                Replay the lesson and redo the practice task to master it completely!
              </motion.p>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                {courseId && chapterId && lessonId && (
                  <Link to={`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`}>
                    <PrimaryButton className="flex items-center gap-2 min-w-[180px]">
                      <RotateCcw className="w-4 h-4" />
                      Replay Lesson
                    </PrimaryButton>
                  </Link>
                )}
                
                <button
                  onClick={() =>
                    (window.location.href =
                      "https://www.zaneproed.com/participant-page/omega4qaqc?programId=634e6f44-bee1-4c0a-9c6f-49da0c2de83f&participantId=7518b3dd-fb31-43ad-aadf-8db99e74a4fd")
                  }
                  className="flex items-center gap-2 justify-center px-6 py-3 bg-success hover:bg-success/90 text-success-foreground rounded-lg font-semibold shadow-md transition-colors min-w-[180px]"
                >
                  <Check className="w-4 h-4" />
                  Done for Today
                </button>
              </motion.div>
              
              {/* Footer Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-sm text-muted-foreground border-t border-border pt-6"
              >
                ⏰ Come back tomorrow for your next lesson and continue leveling up!
              </motion.p>
            </CardContent>
          </Card>
          
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">+10</div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-success mb-1">100%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground mb-1">🏆</div>
                <div className="text-xs text-muted-foreground">Achievement</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}