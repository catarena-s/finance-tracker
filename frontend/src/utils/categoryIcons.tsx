import React from "react";
import {
  Wallet,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Car,
  Home,
  Film,
  Heart,
  BookOpen,
  Shirt,
  Coffee,
  Package,
  DollarSign,
  Coins,
  PiggyBank,
  CreditCard,
  Smartphone,
  Zap,
  Utensils,
  ShoppingBag,
  Plane,
  Gift,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Маппинг эмодзи на lucide-react иконки
const emojiToIconMap: Record<string, LucideIcon> = {
  "💰": Wallet,
  "💼": Briefcase,
  "📈": TrendingUp,
  "🛒": ShoppingCart,
  "🚗": Car,
  "🏠": Home,
  "🎬": Film,
  "⚕️": Heart,
  "📚": BookOpen,
  "👔": Shirt,
  "🍽️": Utensils,
  "📦": Package,
  "💵": DollarSign,
  "🪙": Coins,
  "🏦": PiggyBank,
  "💳": CreditCard,
  "📱": Smartphone,
  "⚡": Zap,
  "☕": Coffee,
  "🛍️": ShoppingBag,
  "✈️": Plane,
  "🎁": Gift,
  "🔧": Wrench,
  "📁": Package,
};

interface CategoryIconProps {
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryIcon({
  icon,
  className = "h-5 w-5",
  style,
}: CategoryIconProps) {
  if (!icon) {
    return <Package className={className} style={style} />;
  }

  // Если это эмодзи, используем маппинг
  const IconComponent = emojiToIconMap[icon];
  if (IconComponent) {
    return <IconComponent className={className} style={style} />;
  }

  // Если это уже название иконки lucide (например, "shopping-cart")
  // возвращаем дефолтную иконку
  return <Package className={className} style={style} />;
}

// Список доступных иконок для выбора в форме
export const availableIcons = [
  { emoji: "💰", name: "Кошелек", icon: Wallet },
  { emoji: "💼", name: "Работа", icon: Briefcase },
  { emoji: "📈", name: "Инвестиции", icon: TrendingUp },
  { emoji: "🛒", name: "Продукты", icon: ShoppingCart },
  { emoji: "🚗", name: "Транспорт", icon: Car },
  { emoji: "🏠", name: "Жилье", icon: Home },
  { emoji: "🎬", name: "Развлечения", icon: Film },
  { emoji: "⚕️", name: "Здоровье", icon: Heart },
  { emoji: "📚", name: "Образование", icon: BookOpen },
  { emoji: "👔", name: "Одежда", icon: Shirt },
  { emoji: "🍽️", name: "Рестораны", icon: Utensils },
  { emoji: "☕", name: "Кафе", icon: Coffee },
  { emoji: "🛍️", name: "Покупки", icon: ShoppingBag },
  { emoji: "✈️", name: "Путешествия", icon: Plane },
  { emoji: "🎁", name: "Подарки", icon: Gift },
  { emoji: "💳", name: "Карты", icon: CreditCard },
  { emoji: "📱", name: "Связь", icon: Smartphone },
  { emoji: "⚡", name: "Коммунальные", icon: Zap },
  { emoji: "🔧", name: "Ремонт", icon: Wrench },
  { emoji: "📦", name: "Прочее", icon: Package },
];
