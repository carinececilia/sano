import React from 'react';
import {
  Utensils,
  Home,
  Car,
  Film,
  HeartPulse,
  Package,
  DollarSign,
  ShoppingBag,
  Coffee,
  Fuel,
  Smartphone,
  BookOpen,
  Gift,
  Sparkles,
  Zap,
  Briefcase,
  Tv,
  Dumbbell,
  PawPrint,
  Plane,
  CreditCard,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, React.ElementType> = {
  Utensils,
  Home,
  Car,
  Film,
  HeartPulse,
  Package,
  DollarSign,
  ShoppingBag,
  Coffee,
  Fuel,
  Smartphone,
  BookOpen,
  Gift,
  Sparkles,
  Zap,
  Briefcase,
  Tv,
  Dumbbell,
  PawPrint,
  Plane,
  CreditCard,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Tag,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 20 }) => {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent size={size} className={className} />;
};
