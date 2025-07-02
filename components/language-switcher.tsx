"use client"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { type Language, getLanguageName } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLang: Language
  onLanguageChange: (lang: Language) => void
}

export function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  const toggleLanguage = () => {
    const newLang: Language = currentLang === "en" ? "ar" : "en"
    onLanguageChange(newLang)
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      {getLanguageName(currentLang === "en" ? "ar" : "en")}
    </Button>
  )
}
