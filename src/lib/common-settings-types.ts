export interface CommonBackgroundSettings {
  backgroundImage: string;
  opacity: number;
  size: string;
  repeat: string;
  position?: string;
}

export interface CommonFontFamilySettings {
  display: string;
  body: string;
  sanskrit: string;
  kannada: string;
  mono: string;
}

export interface CommonFontSizeSettings {
  micro: string;
  caption: string;
  ui: string;
  nav: string;
  body: string;
  badge: string;
  formLabel: string;
  formInput: string;
  actionButton: string;
  meta: string;
}

export type CommonFontSettings = CommonFontSizeSettings;

export interface CommonSettings {
  background: CommonBackgroundSettings;
  fontFamily: CommonFontFamilySettings;
  fontSize: CommonFontSizeSettings;
  font?: CommonFontSizeSettings;
}
