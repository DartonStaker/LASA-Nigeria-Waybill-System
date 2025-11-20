"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import LogoutButton from "@/components/auth/LogoutButton";
import {
  fallbackWaybillNumber,
  formatWaybillNumber,
} from "@/lib/numbering";
import { downloadWaybillPdf } from "@/lib/pdf";
import type { SessionUser } from "@/lib/auth/users";
import { cn } from "@/lib/utils";

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

type WaybillWorkspaceProps = {
  user: SessionUser | null;
};

export default function WaybillWorkspace({ user }: WaybillWorkspaceProps) {
  const [fallbackNumber, setFallbackNumber] = useState(() =>
    formatWaybillNumber(0),
  );
  const [formValues, setFormValues] = useState<WaybillFormValues>(() =>
    createDefaultWaybillValues(formatWaybillNumber(0)),
  );
  const [activePane, setActivePane] = useState<"form" | "preview">("form");

  const previewRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useSWR<{ waybillNumber: string }>(
    "/api/waybill-number",
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    // Generate a client-side fallback number post-hydration to keep SSR output deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFallbackNumber(fallbackWaybillNumber());
  }, []);

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
    setActivePane("preview");
  };

  const manualNumber = useMemo(() => {
    if (formValues.waybillNumber) {
      return formValues.waybillNumber;
    }
    return data?.waybillNumber ?? formatWaybillNumber(0);
  }, [formValues.waybillNumber, data?.waybillNumber]);

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {user?.displayName || user?.username || "Authenticated User"}
            </p>
          </div>
          <LogoutButton />
        </div>
        <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setActivePane("form")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition",
              activePane === "form"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            Form
          </button>
          <button
            type="button"
            onClick={() => setActivePane("preview")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition",
              activePane === "preview"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            Preview
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          <div
            className={cn(
              "w-full lg:max-w-xl",
              activePane === "preview" ? "hidden lg:block" : "block",
            )}
          >
            <WaybillForm
              initialValues={initialValues}
              onValuesChange={handleValuesChange}
              onValidSubmit={handleValidSubmit}
              isFetchingWaybillNumber={isLoading}
              fetchError={Boolean(error)}
            />
          </div>
          <div
            className={cn(
              "flex flex-1 flex-col gap-4",
              activePane === "form" ? "hidden lg:flex" : "flex",
            )}
          >
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
    </div>
  );
}

