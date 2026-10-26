export interface CommonBackgroundSettings {
  backgroundImage: string;
  opacity: number;
  size: string;
  repeat: string;
  position?: string;
}

export interface CommonSettings {
  background: CommonBackgroundSettings;
}
