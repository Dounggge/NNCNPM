import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

const navItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <PieChartIcon />,
    name: "Admin Dashboard",
    path: "/dashboard/admin",
    allowedRoles: ['admin'],
  },
  {
    icon: <UserCircleIcon />,
    name: "Quản lý Hộ Khẩu",
    path: "/dashboard/hokhau",
    allowedRoles: ['admin', 'to_truong', 'ke_toan'],
  },
  {
    icon: <ListIcon />,
    name: "Quản lý Nhân Khẩu",
    path: "/dashboard/nhankhau",
    allowedRoles: ['admin', 'to_truong', 'ke_toan', 'chu_ho'],
  },
  {
    icon: <CalenderIcon />,
    name: "Tạm trú/Tạm vắng",
    allowedRoles: ['admin', 'to_truong', 'ke_toan'],
    subItems: [
      { name: "Tổng quan", path: "/dashboard/tamtru-tamvang", pro: false }, 
      { name: "Danh sách Tạm trú", path: "/dashboard/tamtru", pro: false }, 
      { name: "Danh sách Tạm vắng", path: "/dashboard/tamvang", pro: false }, 
    ],
  },
  {
    icon: <TableIcon />,
    name: "Báo cáo thống kê",
    path: "/dashboard/reports",
    allowedRoles: ['admin', 'to_truong', 'ke_toan'],
  },
  {
    icon: <TableIcon />,
    name: "Quản lý Thu phí",
    allowedRoles: ['admin', 'to_truong', 'ke_toan'],
    subItems: [
      { name: "Khoản thu", path: "/dashboard/khoanthu", pro: false },
      { name: "Phiếu thu", path: "/dashboard/phieuthu", pro: false },
      { name: "Báo cáo", path: "/dashboard/reports", pro: true },
    ],
  },
];

const othersItems = [
  {
    icon: <PieChartIcon />,
    name: "Biểu đồ",
    path: "/charts",
    allowedRoles: ['admin', 'to_truong', 'ke_toan'],
  },
  {
    icon: <PageIcon />,
    name: "Cài đặt",
    allowedRoles: ['admin', 'to_truong'],
    subItems: [
      { name: "Thông tin hệ thống", path: "/settings/system", pro: false },
      { name: "Quản lý người dùng", path: "/settings/users", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    allowedRoles: ['admin'],
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { isAdmin, user } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items
      .filter(nav => {
        if (nav.allowedRoles && !nav.allowedRoles.includes(user?.vaiTro)) return false;
        return true;
      })
      .map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 
        bg-gradient-to-b from-slate-50 via-blue-50/30 to-white 
        dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900
        border-r border-blue-100/50 dark:border-blue-900/30
        text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 shadow-xl
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ← GRADIENT OVERLAY TOP */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>

      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        } relative z-10`}
      >
        <Link to="/dashboard" className="flex items-center gap-3 group">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img
                  src="/logo.png"
                  alt="Logo Quản lý Dân cư"
                  className="h-12 w-auto relative z-10"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Quản lý Dân cư
              </span>
            </>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-auto relative z-10"
              />
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] font-semibold text-blue-600/60 dark:text-blue-400/60 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "QUẢN LÝ"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] font-semibold text-blue-600/60 dark:text-blue-400/60 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "KHÁC"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>

      {/* ← GRADIENT OVERLAY BOTTOM */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
    </aside>
  );
};

export default AppSidebar;