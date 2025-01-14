import Logo from "@assets/hdmChat.svg";
import { Link } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState, useEffect } from "react";

const TopNav = () => {
  const [showToggle, setShowToggle] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 400) {
        setShowToggle(false);
      } else {
        setShowToggle(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex items-center justify-between bg-red-600 px-4 py-3 text-white shadow-md dark:bg-slate-900">
      {showToggle ? (
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="Logo" className="h-1 w-10 sm:h-8 sm:w-8" />
          <span className="truncate font-semibold text-sm sm:text-lg">
            StudyConnect
          </span>
        </div>
      ) : (
        <p>Hier kommt toggle hin für Sidebar ein und ausklappen!</p>
      )}

      <div className="flex items-center space-x-4">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex cursor-pointer items-center justify-center focus:outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-bold text-black text-sm sm:text-base">
              M
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-lg bg-white text-black shadow-lg">
            <Link to="/user">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNav;