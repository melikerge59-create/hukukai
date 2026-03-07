import { CategoryInfo, LegalCategory } from '../types';

export const legalCategories: CategoryInfo[] = [
  {
    id: 'is',
    name: 'İş Hukuku',
    description: 'Kıdem tazminatı, işe iade, ihbar süreleri',
    icon: 'briefcase'
  },
  {
    id: 'kira',
    name: 'Kira Hukuku',
    description: 'Kira artışı, tahliye, depozito',
    icon: 'home'
  },
  {
    id: 'tuketici',
    name: 'Tüketici Hukuku',
    description: 'Ayıplı mal, garanti, iade hakları',
    icon: 'shopping-cart'
  },
  {
    id: 'aile',
    name: 'Aile Hukuku',
    description: 'Boşanma, nafaka, velayet',
    icon: 'users'
  },
  {
    id: 'trafik',
    name: 'Trafik Hukuku',
    description: 'Trafik kazası, sigorta, tazminat',
    icon: 'car'
  },
  {
    id: 'ceza',
    name: 'Ceza Hukuku',
    description: 'Suç, şikayet, savunma hakları',
    icon: 'shield'
  },
  {
    id: 'icra',
    name: 'İcra Hukuku',
    description: 'İcra takibi, haciz, itiraz',
    icon: 'gavel'
  },
  {
    id: 'miras',
    name: 'Miras Hukuku',
    description: 'Vasiyet, mirasçılık belgesi',
    icon: 'scroll-text'
  },
  {
    id: 'vergi',
    name: 'Vergi Hukuku',
    description: 'Vergi cezaları, itiraz süreçleri',
    icon: 'file-text'
  }
];

export function getCategoryInfo(categoryId: LegalCategory): CategoryInfo | undefined {
  return legalCategories.find(cat => cat.id === categoryId);
}
