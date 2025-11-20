"use client";

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";

import {
  fallbackWaybillNumber,
  formatWaybillNumber,
} from "@/lib/numbering";
import { downloadWaybillPdf } from "@/lib/pdf";

import WaybillForm from "./WaybillForm";
import WaybillPreview from "./WaybillPreview";
import {
  createDefaultWaybillValues,
  type WaybillFormValues,
} from "./schema";

const fetcher = async (input: string) => {
  const response = await fetch(input);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${input}`);
  }

  return response.json() as Promise<{ waybillNumber: string }>;
};

export default function WaybillWorkspace() {
  const [fallbackNumber] = useState(() => fallbackWaybillNumber());
  const [formValues, setFormValues] = useState<WaybillFormValues>(() =>
    createDefaultWaybillValues(fallbackNumber),
  );

  const previewRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useSWR<{ waybillNumber: string }>(
    "/api/waybill-number",
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const waybillNumber = data?.waybillNumber ?? fallbackNumber;

  const initialValues = useMemo(
    () => createDefaultWaybillValues(waybillNumber),
    [waybillNumber],
  );

  const handleValuesChange = (values: WaybillFormValues) => {
    setFormValues(values);
  };

  const handleValidSubmit = async (values: WaybillFormValues) => {
    setFormValues(values);

    if (previewRef.current) {
      await downloadWaybillPdf(previewRef.current, values.waybillNumber);
    }
  };

  const manualNumber = useMemo(() => {
    if (formValues.waybillNumber) {
      return formValues.waybillNumber;
    }
    return data?.waybillNumber ?? formatWaybillNumber(0);
  }, [formValues.waybillNumber, data?.waybillNumber]);

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 lg:flex-row">
        <WaybillForm
          initialValues={initialValues}
          onValuesChange={handleValuesChange}
          onValidSubmit={handleValidSubmit}
          isFetchingWaybillNumber={isLoading}
          fetchError={Boolean(error)}
        />
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-emerald-400 bg-emerald-50 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-700">
                Current Waybill Number
              </p>
              <p className="text-lg font-semibold text-emerald-900">
                {manualNumber}
              </p>
            </div>
            <p className="text-xs text-emerald-700">
              QR code and PDF will embed this number. Update manually if you
              need to override the sequence.
            </p>
          </div>
          <WaybillPreview ref={previewRef} data={formValues} />
        </div>
      </div>
    </div>
  );
}

