export const COMPANY_DETAILS = {
  name: "LASA ELECTRONICS CC",
  slogan: "Insha-Allah",
  addressLines: [
    "28 Angus Crescent",
    "Longmeadow Business Estate",
    "Edenvale",
    "Gauteng",
    "South Africa",
    "1610",
  ],
  vatNumber: "VAT No: 4440283473",
  phone: "Phone: +27 11 089 8888",
};

export const COMPANY_LOGO_PATH = "/lasa-logo.svg";

export const COMPANY_EMAIL = "support@lasa.africa";

export const DEFAULT_TERMS = [
  "Goods are transported at owner's risk. LASA Electronics CC is not liable for loss or damage beyond the limits stated herein.",
  "Claims for shortages or damages must be lodged within 24 hours of delivery and noted on receipt.",
  "All goods remain the property of LASA Electronics CC until payment has been received in full where applicable.",
  "Ensure the receiver inspects and signs for the consignment. Unverified deliveries may void insurance cover.",
  "By signing this waybill you agree to LASA Electronics CC standard trading terms and conditions.",
].join("\n");

export const WAYBILL_NUMBER_PREFIX =
  process.env.NEXT_PUBLIC_WAYBILL_PREFIX ?? "LCC";

export const WAYBILL_NUMBER_PAD =
  Number(process.env.NEXT_PUBLIC_WAYBILL_PAD ?? 6);

export const WAYBILL_COPIES = [
  "Office Copy",
  "Driver Copy",
  "Receiver Copy",
];

