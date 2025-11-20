import { z } from "zod";

import { DEFAULT_TERMS } from "@/lib/constants/company";

const optionalNumber = z
  .number()
  .nonnegative()
  .or(z.nan())
  .transform((value) => (Number.isNaN(value) ? undefined : value));

const goodsItemSchema = z.object({
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int()
    .positive("Quantity must be at least 1"),
  packageType: z.string().min(1, "Package type is required"),
  description: z.string().min(1, "Description is required"),
  serialNumbers: z.string().optional(),
  value: optionalNumber.optional(),
});

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

const transportSchema = z.object({
  vehicleRegistration: z
    .string()
    .min(1, "Vehicle registration is required"),
  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().min(1, "Driver phone is required"),
  dispatchBy: z.string().min(1, "Dispatch by is required"),
  dispatchSignature: z.string().optional(),
});

const signaturesSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  senderSignature: z.string().optional(),
  driverSignature: z.string().optional(),
  receiverName: z.string().min(1, "Receiver name is required"),
  receiverSignature: z.string().optional(),
  receiverDate: z.string().optional(),
  managementCheck: z.boolean().default(false),
  securityCheck: z.boolean().default(false),
  choiceRepCheck: z.boolean().default(false),
  released: z.boolean().default(false),
});

const notesSchema = z.object({
  terms: z.string().min(1, "Terms are required"),
  additionalNotes: z.string().optional(),
});

export const waybillSchema = z.object({
  waybillNumber: z.string().min(1, "Waybill number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  loadingDate: z.string().optional(),
  consignor: contactSchema,
  consignee: contactSchema,
  goods: z.array(goodsItemSchema).min(1, "At least one goods line is required"),
  transport: transportSchema,
  signatures: signaturesSchema,
  notes: notesSchema,
});

export type WaybillFormValues = z.infer<typeof waybillSchema>;

export function createDefaultWaybillValues(
  waybillNumber: string,
): WaybillFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    waybillNumber,
    issueDate: today,
    loadingDate: "",
    consignor: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
    consignee: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
    goods: [
      {
        quantity: 1,
        packageType: "",
        description: "",
        serialNumbers: "",
        value: undefined,
      },
    ],
    transport: {
      vehicleRegistration: "",
      driverName: "",
      driverPhone: "",
      dispatchBy: "",
      dispatchSignature: "",
    },
    signatures: {
      senderName: "",
      senderSignature: "",
      driverSignature: "",
      receiverName: "",
      receiverSignature: "",
      receiverDate: "",
      managementCheck: false,
      securityCheck: false,
      choiceRepCheck: false,
      released: false,
    },
    notes: {
      terms: DEFAULT_TERMS,
      additionalNotes: "",
    },
  };
}

