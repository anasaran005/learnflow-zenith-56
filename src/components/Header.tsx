import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase"; // make sure this points to your firebase.ts

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/auth"); // send user back to login page
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}
    >
      <nav className="theme-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          
            <span className="font-heading font-semibold text-xl">
              ZANE <span style={{ color: "#ff0000" }}>ΩMEGA</span>
            </span>
          

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
          
         
          </div>
        </div>
      </nav>
    </header>
  );
}
