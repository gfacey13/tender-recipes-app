import { Home, Heart, ShoppingCart, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "saved" | "grocery" | "profile";
  onTabChange: (tab: "home" | "saved" | "grocery" | "profile") => void;
  savedCount: number;
  groceryCount: number;
}

export function BottomNav({ activeTab, onTabChange, savedCount, groceryCount }: BottomNavProps) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: Home, count: 0 },
    { id: "saved" as const, label: "Saved", icon: Heart, count: savedCount },
    { id: "grocery" as const, label: "Grocery List", icon: ShoppingCart, count: groceryCount },
    { id: "profile" as const, label: "Profile", icon: User, count: 0 }
  ];

  return (
<nav className="bg-white border-t border-gray-200 safe-area-bottom shadow-lg w-full max-w-[500px] mx-auto">
      <div className="grid grid-cols-4 w-full px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-3 px-3 relative transition-all min-h-[60px] hover:bg-gray-50 rounded-xl flex-1"
              aria-label={tab.label}
            >
              <div className="relative mb-1">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-amber-500" : "text-gray-400"
                  }`}
                  fill={isActive && tab.id === "saved" ? "currentColor" : "none"}
                />
                {tab.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                    {tab.count > 99 ? "99+" : tab.count}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive ? "text-amber-500" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}