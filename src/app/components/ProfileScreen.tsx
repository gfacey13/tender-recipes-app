import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface ProfileScreenProps {
  savedCount: number;
  groceryCount: number;
  reviewedCount: number;
}

export function ProfileScreen({ savedCount, groceryCount, reviewedCount }: ProfileScreenProps) {
  const stats = [
    { label: "Saved Recipes", value: savedCount },
    { label: "Grocery Items", value: groceryCount },
    { label: "Recipes Reviewed", value: reviewedCount }
  ];

  const menuItems = [
    { icon: Settings, label: "Settings", action: "settings" },
    { icon: Bell, label: "Notifications", action: "notifications" },
    { icon: HelpCircle, label: "Help & Support", action: "help" },
    { icon: LogOut, label: "Log Out", action: "logout", danger: true }
  ];

  const handleMenuClick = (action: string) => {
    console.log("Menu action:", action);
  };

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="max-w-[500px] mx-auto px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-1">Food Explorer</h2>
          <p className="text-gray-500">foodlover@example.com</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-5 mb-6"
        >
          <h3 className="text-sm text-gray-500 mb-4">Your Activity</h3>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl text-rose-500 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                onClick={() => handleMenuClick(item.action)}
                className={`w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  index !== 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      item.danger ? "text-red-500" : "text-gray-600"
                    }`}
                  />
                  <span
                    className={item.danger ? "text-red-500" : "text-gray-900"}
                  >
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-400 mt-8"
        >
          Version 1.0.0
        </motion.p>
      </div>
    </div>
  );
}