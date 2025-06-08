import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  Mail, 
  Send, 
  MessageCircle, 
  Bell, 
  Settings, 
  User 
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: Search, label: 'Search', active: false },
  { icon: Mail, label: 'Email', active: false },
  { icon: Send, label: 'Send', active: false },
  { icon: MessageCircle, label: 'Chat', active: true },
  { icon: Bell, label: 'Notifications', active: false },
  { icon: Settings, label: 'Settings', active: false },
  { icon: User, label: 'Profile', active: false },
];

export default function Sidebar() {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-4">
      {sidebarItems.map((item, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-xl transition-all duration-200 ${
            item.active 
              ? 'bg-[#246BFD] text-white shadow-lg' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title={item.label}
        >
          <item.icon className="w-5 h-5" />
        </motion.button>
      ))}
    </div>
  );
}