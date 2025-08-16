import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { MobileMenu } from "./mobile-optimized";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface MobileLayoutProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function MobileLayout({ 
  children, 
  navigation, 
  header, 
  className 
}: MobileLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold">SocialSparkAI</h1>
            </div>
            {header}
          </div>
        </header>
      )}

      {/* Desktop Header */}
      {!isMobile && header && (
        <header className="border-b border-border bg-background">
          <div className="container mx-auto px-6 py-4">
            {header}
          </div>
        </header>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && navigation && (
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-muted/10">
            <div className="p-6">
              {navigation}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className={isMobile ? "" : "container mx-auto px-6 py-6"}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      >
        {navigation}
      </MobileMenu>
    </div>
  );
}

interface BottomTabBarProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function BottomTabBar({ tabs, activeTab, onTabChange }: BottomTabBarProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors",
                "min-h-[64px] relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-1" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium leading-none">
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface StackedCardLayoutProps {
  cards: Array<{
    id: string;
    content: React.ReactNode;
    swipeable?: boolean;
  }>;
  onCardSwipe?: (cardId: string, direction: 'left' | 'right') => void;
  className?: string;
}

export function StackedCardLayout({ 
  cards, 
  onCardSwipe, 
  className 
}: StackedCardLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    if (onCardSwipe && currentCard) {
      onCardSwipe(currentCard.id, direction);
    }
    
    if (direction === 'left' && currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className={cn("relative h-96 overflow-hidden", className)}>
      {cards.map((card, index) => {
        const offset = index - currentIndex;
        const isVisible = Math.abs(offset) <= 2;

        if (!isVisible) return null;

        return (
          <motion.div
            key={card.id}
            className="absolute inset-0 bg-background rounded-lg shadow-lg border"
            initial={false}
            animate={{
              x: offset * 10,
              y: offset * 5,
              scale: 1 - Math.abs(offset) * 0.05,
              zIndex: cards.length - Math.abs(offset),
              opacity: 1 - Math.abs(offset) * 0.3
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const threshold = 100;
              if (info.offset.x > threshold) {
                handleSwipe('right');
              } else if (info.offset.x < -threshold) {
                handleSwipe('left');
              }
            }}
          >
            <div className="p-6 h-full overflow-auto">
              {card.content}
            </div>
          </motion.div>
        );
      })}
      
      {/* Card indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {cards.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface FloatingActionMenuProps {
  actions: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    color?: string;
  }>;
  mainIcon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function FloatingActionMenu({ 
  actions, 
  mainIcon: MainIcon, 
  className 
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-20 right-4 z-50", className)}>
      {/* Action items */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className="flex flex-col-reverse items-end mb-3 space-y-reverse space-y-3"
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.div
              key={action.id}
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: index * 0.1
                  }
                },
                closed: {
                  opacity: 0,
                  y: 20
                }
              }}
              className="flex items-center space-x-3"
            >
              <span className="bg-background text-foreground px-3 py-1 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110",
                  action.color || "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <MainIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
}