"use client";

import Image from "next/image";
import { forwardRef } from "react";
import QRCode from "react-qr-code";

import {
  COMPANY_DETAILS,
  COMPANY_EMAIL,
  COMPANY_LOGO_PATH,
  WAYBILL_COPIES,
} from "@/lib/constants/company";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

import type { WaybillFormValues } from "./schema";

type WaybillPreviewProps = {
  data: WaybillFormValues;
};

const WaybillPreview = forwardRef<HTMLDivElement, WaybillPreviewProps>(
  ({ data }, ref) => {
    const { signatures, notes } = data;
    const releasedStamp = signatures.released;

    return (
      <div
        ref={ref}
        className="pdf-ready w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:border-black print:shadow-none"
      >
        <header className="flex flex-col gap-4 border-b border-dashed border-slate-300 pb-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 md:block">
              <Image
                src={COMPANY_LOGO_PATH}
                alt={`${COMPANY_DETAILS.name} logo`}
                fill
                className="object-contain p-3"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wide text-slate-900">
                {COMPANY_DETAILS.name}
              </h1>
              <p className="text-sm uppercase text-emerald-700">
                {COMPANY_DETAILS.slogan}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {COMPANY_DETAILS.addressLines.join("\n")}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {COMPANY_DETAILS.phone}
              </p>
              <p className="text-sm text-slate-700">{COMPANY_EMAIL}</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {COMPANY_DETAILS.vatNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:flex-col md:items-end md:text-right">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Official Document
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                WAYBILL
              </p>
              <p className="mt-1 rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-slate-800">
                {data.waybillNumber}
              </p>
            </div>
            <QRCode
              value={data.waybillNumber}
              size={80}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>
        </header>

        <section className="mt-6 grid gap-4 text-sm text-slate-800 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Issue Date
            </p>
            <p className="text-base font-medium text-slate-900">
              {formatDate(data.issueDate)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Loading / Delivery Date
            </p>
            <p className="text-base font-medium text-slate-900">
              {formatDate(data.loadingDate)}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 text-sm text-slate-800 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Consignor / Sender
            </h2>
            <div className="mt-2 space-y-1">
              <p className="font-medium text-slate-900">{data.consignor.name}</p>
              <p className="whitespace-pre-line">{data.consignor.address}</p>
              <p className="text-slate-700">{data.consignor.phone}</p>
              {data.consignor.email && (
                <p className="text-slate-700">{data.consignor.email}</p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Consignee / Receiver
            </h2>
            <div className="mt-2 space-y-1">
              <p className="font-medium text-slate-900">{data.consignee.name}</p>
              <p className="whitespace-pre-line">{data.consignee.address}</p>
              <p className="text-slate-700">{data.consignee.phone}</p>
              {data.consignee.email && (
                <p className="text-slate-700">{data.consignee.email}</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Goods Description
          </h2>
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Package</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-left">Serial / Chassis No.</th>
                  <th className="px-3 py-2 text-right">Value (ZAR)</th>
                </tr>
              </thead>
              <tbody>
                {data.goods.map((item, index) => {
                  const quantity = Number.isFinite(item.quantity)
                    ? item.quantity
                    : 0;
                  const valueDisplay = formatCurrency(item.value ?? undefined);

                  return (
                    <tr
                      key={`${item.description}-${index}`}
                      className={cn(
                        index % 2 === 0 ? "bg-white" : "bg-slate-50",
                      )}
                    >
                      <td className="px-3 py-2 align-top font-medium">
                        {quantity || ""}
                      </td>
                      <td className="px-3 py-2 align-top">{item.packageType}</td>
                      <td className="px-3 py-2 align-top">
                        <p className="font-medium text-slate-900">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {item.serialNumbers}
                      </td>
                      <td className="px-3 py-2 text-right align-top font-medium">
                        {valueDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 text-sm text-slate-800 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Transport Details
            </h2>
            <dl className="mt-2 space-y-2">
              <div className="flex justify-between">
                <dt className="text-slate-600">Vehicle Registration</dt>
                <dd className="font-medium text-slate-900">
                  {data.transport.vehicleRegistration}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Driver Name</dt>
                <dd className="font-medium text-slate-900">
                  {data.transport.driverName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Driver Phone</dt>
                <dd className="font-medium text-slate-900">
                  {data.transport.driverPhone}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Dispatch By</dt>
                <dd className="font-medium text-slate-900">
                  {data.transport.dispatchBy}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Signatures & Checks
            </h2>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-xs text-slate-500">Sender / Dispatch</p>
                <p className="font-medium text-slate-900">
                  {signatures.senderName}
                </p>
                <p className="text-xs text-slate-600">
                  Signature: {signatures.senderSignature || "__________"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Driver</p>
                <p className="font-medium text-slate-900">
                  {data.transport.driverName}
                </p>
                <p className="text-xs text-slate-600">
                  Signature: {signatures.driverSignature || "__________"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Receiver</p>
                <p className="font-medium text-slate-900">
                  {signatures.receiverName}
                </p>
                <p className="text-xs text-slate-600">
                  Signature: {signatures.receiverSignature || "__________"}
                </p>
                <p className="text-xs text-slate-600">
                  Date: {formatDate(signatures.receiverDate)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 text-xs uppercase tracking-wide text-slate-600">
                <CheckItem label="Management" checked={signatures.managementCheck} />
                <CheckItem label="Security" checked={signatures.securityCheck} />
                <CheckItem label="Choice / Rep" checked={signatures.choiceRepCheck} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 text-sm text-slate-800 md:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Terms & Conditions
            </h2>
            <div className="mt-2 space-y-2 whitespace-pre-line text-xs leading-relaxed text-slate-700">
              {notes.terms}
            </div>
            {notes.additionalNotes && (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-700">
                <p className="font-semibold uppercase tracking-wide text-slate-600">
                  Additional Notes
                </p>
                <p className="mt-1 whitespace-pre-line">
                  {notes.additionalNotes}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div
              className={cn(
                "flex h-32 items-center justify-center rounded-xl border-4 border-dashed text-lg font-semibold uppercase tracking-widest",
                releasedStamp
                  ? "border-emerald-500 text-emerald-600"
                  : "border-slate-300 text-slate-400",
              )}
            >
              {releasedStamp ? "Released" : "Pending Release"}
            </div>
            <div className="rounded-xl border border-slate-200 p-4 text-xs uppercase tracking-wide text-slate-600">
              Copies: {WAYBILL_COPIES.join(" • ")}
            </div>
          </div>
        </section>
      </div>
    );
  },
);

WaybillPreview.displayName = "WaybillPreview";

export default WaybillPreview;

function CheckItem({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border text-[10px] font-semibold",
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-400 text-slate-500",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}

