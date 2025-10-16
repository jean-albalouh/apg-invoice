export interface CompanyInfo {
  name: string;
  siren: string;
  address: string;
  phone: string;
  tvaNumber: string;
}

export const COMPANY_INFO: Record<string, CompanyInfo> = {
  "A TA PORTE": {
    name: "A TA PORTE",
    siren: "981176704",
    address: "14 RUE DE LA PAIX, 77170 SERVON",
    phone: "07 58 33 31 24",
    tvaNumber: "FR37981176704",
  },
  "LE GRAND MARCHÉ DE FRANCE": {
    name: "LE GRAND MARCHÉ DE FRANCE",
    siren: "980966220",
    address: "8 RUE JEAN NICOT, 93500 PANTIN",
    phone: "07 58 33 31 24",
    tvaNumber: "FR55980966220",
  },
  "LE PHÉNICIEN": {
    name: "LE PHÉNICIEN",
    siren: "979278900",
    address: "14 RUE DE LA PAIX, 77170 SERVON",
    phone: "06 66 23 16 63",
    tvaNumber: "FR40979278900",
  },
  "BEST DEAL": {
    name: "BEST DEAL",
    siren: "888711389",
    address: "64 RUE VIGIER, 91600 SAVIGNY-SUR-ORGE",
    phone: "06 99 71 36 89",
    tvaNumber: "FR36888711389",
  },
};

export const TVA_RATES = [
  { value: 5.5, label: "5,5%" },
  { value: 10, label: "10%" },
  { value: 20, label: "20%" },
];

export const MARKUP_APPLICATION = [
  { value: "HT", label: "Sur le prix HT (avant TVA)" },
  { value: "TTC", label: "Sur le prix TTC (après TVA)" },
];

// A TA PORTE company info (invoice issuer)
export const A_TA_PORTE_INFO: CompanyInfo = COMPANY_INFO["A TA PORTE"];
