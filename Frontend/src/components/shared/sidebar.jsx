import {
  AnalyticsIcon,
  BotIcon,
  CalendarIcon,
  FileStackIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "../icons";

// Sidebar items
const sidebarItems = [
  {
    adminOnly: false,
    icon: <LayoutDashboardIcon />,
    label: "Dashboard",
    tabName: "dashboard",
  },
  {
    adminOnly: false,
    icon: <BotIcon />,
    label: "Generator",
    tabName: "generator",
  },
  {
    adminOnly: false,
    icon: <HistoryIcon />,
    label: "History",
    tabName: "history",
  },
  {
    adminOnly: false,
    icon: <FileStackIcon />,
    label: "Moderation Log",
    tabName: "moderation",
  },
  {
    adminOnly: true,
    icon: <UsersIcon />,
    label: "Users",
    tabName: "users",
  },
  {
    adminOnly: true,
    icon: <AnalyticsIcon />,
    label: "Analytics",
    tabName: "analytics",
  },
  {
    adminOnly: false,
    icon: <CalendarIcon />,
    label: "Calendar",
    tabName: "calendar",
  },
  {
    adminOnly: false,
    icon: <SettingsIcon />,
    label: "Settings",
    tabName: "settings",
  },
];

// Reusable NavItem wrapper component
const NavItem = ({ icon, label, tabName, activeTab, setActiveTab }) => (
  <li className="mb-4">
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActiveTab(tabName);
      }}
      className={`flex items-center p-3 rounded-lg ${
        activeTab === tabName
          ? "bg-yellow-400 text-gray-900 shadow-md"
          : "hover:bg-gray-100"
      }`}
    >
      <span className="mr-4">{icon}</span>
      <span className="font-semibold">{label}</span>
    </a>
  </li>
);

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => (
  <aside className="w-64 bg-white p-6 flex flex-col justify-between shadow-lg overflow-y-auto">
    <div>
      <div className="flex items-center mb-10">
        <img
          src="/logo.png"
          alt="MYpostmate Logo"
          className="h-8 w-auto mr-2"
        />
        <h1 className="text-2xl font-bold text-yellow-500">MYpostmate</h1>
      </div>
      <nav>
        <ul>
          {sidebarItems.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null;
            return (
              <NavItem
                key={item.tabName}
                icon={item.icon}
                label={item.label}
                tabName={item.tabName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            );
          })}
        </ul>
      </nav>
    </div>
    <div className="border-t pt-4">
      <div className="flex items-center justify-center mb-4">
        <UserIcon className="w-6 h-6 mr-2" />
        <div>
          <p className="font-bold capitalize">
            {user?.display_name || user?.username}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700"
      >
        <LogOutIcon className="w-5 h-5 mr-2" /> Logout
      </button>
    </div>
  </aside>
);

export default Sidebar;
