export interface UiCopy {
  close: string;
  back: string;
  primary_navigation: string;
  mobile_navigation: string;
  language_selector: string;
  switch_language: string;
  open_menu: string;
  close_menu: string;
  panchanga: string;
  donate_material: string;
  your_name: string;
  full_name_placeholder: string;
  phone_whatsapp: string;
  phone_placeholder: string;
  additional_note: string;
  note_placeholder: string;
}

export interface MaterialOption {
  id: string;
  label: string;
  desc: string;
  unit: string;
  icon: string;
}

export interface EditorialCopy {
  site_chrome: {
    chant: string;
    sacred_symbol: string;
    donation_brand: string;
  };
  donation: {
    scan_intro: string;
    material_prompt: string;
    material_options: MaterialOption[];
  };
}
