import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Common
import commonEn from '../../i18n/locales/en/common.json'
import commonKo from '../../i18n/locales/ko/common.json'
import navigationEn from '../../i18n/locales/en/navigation.json'
import navigationKo from '../../i18n/locales/ko/navigation.json'
import homeEn from '../../i18n/locales/en/home.json'
import homeKo from '../../i18n/locales/ko/home.json'

// Getting Started
import installationEn from '../../i18n/locales/en/installation.json'
import installationKo from '../../i18n/locales/ko/installation.json'
import usageEn from '../../i18n/locales/en/usage.json'
import usageKo from '../../i18n/locales/ko/usage.json'

// Foundation
import colorsEn from '../../i18n/locales/en/colors.json'
import colorsKo from '../../i18n/locales/ko/colors.json'
import typographyEn from '../../i18n/locales/en/typography.json'
import typographyKo from '../../i18n/locales/ko/typography.json'
import iconsEn from '../../i18n/locales/en/icons.json'
import iconsKo from '../../i18n/locales/ko/icons.json'
import spacingEn from '../../i18n/locales/en/spacing.json'
import spacingKo from '../../i18n/locales/ko/spacing.json'

// Layout
import gridEn from '../../i18n/locales/en/grid.json'
import gridKo from '../../i18n/locales/ko/grid.json'
import responsiveEn from '../../i18n/locales/en/responsive.json'
import responsiveKo from '../../i18n/locales/ko/responsive.json'

// Components
import avatarEn from '../../i18n/locales/en/avatar.json'
import avatarKo from '../../i18n/locales/ko/avatar.json'
import buttonEn from '../../i18n/locales/en/button.json'
import buttonKo from '../../i18n/locales/ko/button.json'
import datepickerEn from '../../i18n/locales/en/datepicker.json'
import datepickerKo from '../../i18n/locales/ko/datepicker.json'
import inputEn from '../../i18n/locales/en/input.json'
import inputKo from '../../i18n/locales/ko/input.json'
import textareaEn from '../../i18n/locales/en/textarea.json'
import textareaKo from '../../i18n/locales/ko/textarea.json'
import selectEn from '../../i18n/locales/en/select.json'
import selectKo from '../../i18n/locales/ko/select.json'
import checkboxRadioEn from '../../i18n/locales/en/checkbox-radio.json'
import checkboxRadioKo from '../../i18n/locales/ko/checkbox-radio.json'
import toggleEn from '../../i18n/locales/en/toggle.json'
import toggleKo from '../../i18n/locales/ko/toggle.json'
import fileEn from '../../i18n/locales/en/file.json'
import fileKo from '../../i18n/locales/ko/file.json'
import editorEn from '../../i18n/locales/en/editor.json'
import editorKo from '../../i18n/locales/ko/editor.json'
import chipEn from '../../i18n/locales/en/chip.json'
import chipKo from '../../i18n/locales/ko/chip.json'
import fieldEn from '../../i18n/locales/en/field.json'
import fieldKo from '../../i18n/locales/ko/field.json'
import tableEn from '../../i18n/locales/en/table.json'
import tableKo from '../../i18n/locales/ko/table.json'
import tabEn from '../../i18n/locales/en/tab.json'
import tabKo from '../../i18n/locales/ko/tab.json'
import paginationEn from '../../i18n/locales/en/pagination.json'
import paginationKo from '../../i18n/locales/ko/pagination.json'
import toastEn from '../../i18n/locales/en/toast.json'
import toastKo from '../../i18n/locales/ko/toast.json'
import tooltipEn from '../../i18n/locales/en/tooltip.json'
import tooltipKo from '../../i18n/locales/ko/tooltip.json'

// Utilities
import borderEn from '../../i18n/locales/en/border.json'
import borderKo from '../../i18n/locales/ko/border.json'
import radiusEn from '../../i18n/locales/en/radius.json'
import radiusKo from '../../i18n/locales/ko/radius.json'
import elevationEn from '../../i18n/locales/en/elevation.json'
import elevationKo from '../../i18n/locales/ko/elevation.json'
import displayEn from '../../i18n/locales/en/display.json'
import displayKo from '../../i18n/locales/ko/display.json'

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('locale') || 'ko'
  }
  return 'ko'
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      navigation: navigationEn,
      home: homeEn,
      installation: installationEn,
      usage: usageEn,
      colors: colorsEn,
      typography: typographyEn,
      icons: iconsEn,
      spacing: spacingEn,
      grid: gridEn,
      responsive: responsiveEn,
      avatar: avatarEn,
      button: buttonEn,
      datepicker: datepickerEn,
      input: inputEn,
      textarea: textareaEn,
      select: selectEn,
      checkboxRadio: checkboxRadioEn,
      toggle: toggleEn,
      file: fileEn,
      editor: editorEn,
      chip: chipEn,
      field: fieldEn,
      table: tableEn,
      tab: tabEn,
      pagination: paginationEn,
      toast: toastEn,
      tooltip: tooltipEn,
      border: borderEn,
      radius: radiusEn,
      elevation: elevationEn,
      display: displayEn,
    },
    ko: {
      common: commonKo,
      navigation: navigationKo,
      home: homeKo,
      installation: installationKo,
      usage: usageKo,
      colors: colorsKo,
      typography: typographyKo,
      icons: iconsKo,
      spacing: spacingKo,
      grid: gridKo,
      responsive: responsiveKo,
      avatar: avatarKo,
      button: buttonKo,
      datepicker: datepickerKo,
      input: inputKo,
      textarea: textareaKo,
      select: selectKo,
      checkboxRadio: checkboxRadioKo,
      toggle: toggleKo,
      file: fileKo,
      editor: editorKo,
      chip: chipKo,
      field: fieldKo,
      table: tableKo,
      tab: tabKo,
      pagination: paginationKo,
      toast: toastKo,
      tooltip: tooltipKo,
      border: borderKo,
      radius: radiusKo,
      elevation: elevationKo,
      display: displayKo,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
