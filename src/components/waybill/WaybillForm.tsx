"use client";

import { Fragment, useEffect, useMemo } from "react";
import {
  type UseFormRegister,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Resolver } from "react-hook-form";

import { cn } from "@/lib/utils";

import { type WaybillFormValues, waybillSchema } from "./schema";

type WaybillFormProps = {
  initialValues: WaybillFormValues;
  onValuesChange: (values: WaybillFormValues) => void;
  onValidSubmit: (values: WaybillFormValues) => Promise<void> | void;
  isFetchingWaybillNumber?: boolean;
  fetchError?: boolean;
};

export default function WaybillForm({
  initialValues,
  onValuesChange,
  onValidSubmit,
  isFetchingWaybillNumber,
  fetchError,
}: WaybillFormProps) {
  const resolver = useMemo(
    () => zodResolver(waybillSchema) as Resolver<WaybillFormValues>,
    [],
  );

  const form = useForm<WaybillFormValues>({
    resolver,
    mode: "onChange",
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    control,
    register,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const goodsArray = useFieldArray({
    control,
    name: "goods",
  });

  const sanitizedValues = useMemo(
    () => sanitizeWaybillValues(initialValues),
    [initialValues],
  );

  useEffect(() => {
    reset(sanitizedValues);
    onValuesChange(sanitizedValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanitizedValues.waybillNumber]);

  useEffect(() => {
    const subscription = watch((value) => {
      onValuesChange(sanitizeWaybillValues(value as WaybillFormValues));
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  const onSubmit = handleSubmit(async (values) => {
    const cleaned = sanitizeWaybillValues(values);
    await onValidSubmit(cleaned);
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg lg:max-w-xl"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-emerald-700">
          Waybill Preparation
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          LASA Waybill Generator
        </h1>
        <p className="text-sm text-slate-600">
          Capture sender, receiver, goods, transport, and signature details. Use
          the PDF button to create printable multi-copy waybills.
        </p>
        <WaybillNumberBadge
          isLoading={Boolean(isFetchingWaybillNumber)}
          hasError={Boolean(fetchError)}
        />
      </div>

      <fieldset className="rounded-xl border border-slate-200">
        <legend className="px-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Document References
        </legend>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <FormField
            label="Waybill Number"
            error={errors.waybillNumber?.message}
          >
            <input
              type="text"
              className="form-input"
              {...register("waybillNumber")}
            />
          </FormField>
          <FormField label="Issue Date" error={errors.issueDate?.message}>
            <input
              type="date"
              className="form-input"
              {...register("issueDate")}
            />
          </FormField>
          <FormField label="Loading / Delivery Date">
            <input
              type="date"
              className="form-input"
              {...register("loadingDate")}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200">
        <legend className="px-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Parties Involved
        </legend>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <PartyFields
            title="Consignor / Sender"
            fieldName="consignor"
            errors={errors.consignor}
            register={register}
          />
          <PartyFields
            title="Consignee / Receiver"
            fieldName="consignee"
            errors={errors.consignee}
            register={register}
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200">
        <legend className="px-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Goods Description
        </legend>
        <div className="space-y-4 p-4">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Package Type</th>
                  <th className="px-3 py-2 text-left">Detailed Description</th>
                  <th className="px-3 py-2 text-left">Serial / Chassis No.</th>
                  <th className="px-3 py-2 text-left">Value (NGN)</th>
                  <th className="px-3 py-2 text-right" />
                </tr>
              </thead>
              <tbody>
                {goodsArray.fields.map((field, index) => (
                  <Fragment key={field.id}>
                    <tr
                      className={cn(
                        "hidden border-b border-slate-100 last:border-b-0 md:table-row",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50",
                      )}
                    >
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          min={1}
                          className="form-input"
                          {...register(`goods.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        <FieldError
                          message={errors.goods?.[index]?.quantity?.message}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          className="form-input"
                          {...register(`goods.${index}.packageType`)}
                        />
                        <FieldError
                          message={errors.goods?.[index]?.packageType?.message}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <textarea
                          rows={3}
                          className="form-textarea"
                          {...register(`goods.${index}.description`)}
                        />
                        <FieldError
                          message={errors.goods?.[index]?.description?.message}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <textarea
                          rows={3}
                          className="form-textarea"
                          {...register(`goods.${index}.serialNumbers`)}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-input"
                          placeholder="0.00"
                          {...register(`goods.${index}.value`, {
                            valueAsNumber: true,
                          })}
                        />
                        <FieldError
                          message={errors.goods?.[index]?.value?.message}
                        />
                      </td>
                      <td className="px-3 py-2 text-right align-top">
                        {goodsArray.fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => goodsArray.remove(index)}
                            className="rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-200"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                    <tr className="md:hidden">
                      <td colSpan={6} className="px-3 py-3">
                        <div className="space-y-3 rounded-xl border border-slate-200 p-4 shadow-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Qty
                              </label>
                              <input
                                type="number"
                                min={1}
                                className="form-input mt-1"
                                {...register(`goods.${index}.quantity`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <FieldError
                                message={
                                  errors.goods?.[index]?.quantity?.message
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Package
                              </label>
                              <input
                                type="text"
                                className="form-input mt-1"
                                {...register(`goods.${index}.packageType`)}
                              />
                              <FieldError
                                message={
                                  errors.goods?.[index]?.packageType?.message
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Description
                            </label>
                            <textarea
                              rows={3}
                              className="form-textarea mt-1"
                              {...register(`goods.${index}.description`)}
                            />
                            <FieldError
                              message={
                                errors.goods?.[index]?.description?.message
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Serial / Chassis No.
                            </label>
                            <textarea
                              rows={2}
                              className="form-textarea mt-1"
                              {...register(`goods.${index}.serialNumbers`)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Value (NGN)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="form-input mt-1"
                              placeholder="0.00"
                              {...register(`goods.${index}.value`, {
                                valueAsNumber: true,
                              })}
                            />
                            <FieldError
                              message={errors.goods?.[index]?.value?.message}
                            />
                          </div>
                          {goodsArray.fields.length > 1 && (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => goodsArray.remove(index)}
                                className="rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-200"
                              >
                                Remove item
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => goodsArray.append(createEmptyGoodsLine())}
            className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            + Add Goods Line
          </button>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200">
        <legend className="px-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Transport Details
        </legend>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <FormField
            label="Vehicle Registration"
            error={errors.transport?.vehicleRegistration?.message}
          >
            <input
              type="text"
              className="form-input"
              {...register("transport.vehicleRegistration")}
            />
          </FormField>
          <FormField
            label="Driver Name"
            error={errors.transport?.driverName?.message}
          >
            <input
              type="text"
              className="form-input"
              {...register("transport.driverName")}
            />
          </FormField>
          <FormField
            label="Driver Phone"
            error={errors.transport?.driverPhone?.message}
          >
            <input
              type="tel"
              className="form-input"
              {...register("transport.driverPhone")}
            />
          </FormField>
          <FormField
            label="Delivery / Dispatch By"
            error={errors.transport?.dispatchBy?.message}
          >
            <input
              type="text"
              className="form-input"
              {...register("transport.dispatchBy")}
            />
          </FormField>
          <FormField label="Dispatch Signature">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. signed electronically"
              {...register("transport.dispatchSignature")}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200">
        <legend className="px-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Signatures & Checks
        </legend>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <FormField
            label="Sender / Dispatch Name"
            error={errors.signatures?.senderName?.message}
          >
            <input
              type="text"
              className="form-input"
              {...register("signatures.senderName")}
            />
          </FormField>
          <FormField label="Sender Signature">
            <input
              type="text"
              className="form-input"
              {...register("signatures.senderSignature")}
            />
          </FormField>
          <FormField
            label="Receiver Name"
            error={errors.signatures?.receiverName?.message}
          >
            <input
              type="text"
              className="form-input"
              {...register("signatures.receiverName")}
            />
          </FormField>
          <FormField label="Receiver Signature">
            <input
              type="text"
              className="form-input"
              {...register("signatures.receiverSignature")}
            />
          </FormField>
          <FormField label="Receiver Date">
            <input
              type="date"
              className="form-input"
              {...register("signatures.receiverDate")}
            />
          </FormField>
          <FormField label="Driver Signature">
            <input
              type="text"
              className="form-input"
              {...register("signatures.driverSignature")}
            />
          </FormField>
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Internal Checks
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
            <CheckboxField
              label="Management"
              name="signatures.managementCheck"
              register={register}
            />
            <CheckboxField
              label="Security"
              name="signatures.securityCheck"
              register={register}
            />
            <CheckboxField
              label="Choice / Rep"
              name="signatures.choiceRepCheck"
              register={register}
            />
            <CheckboxField
              label="Released"
              name="signatures.released"
              register={register}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200">
        <legend className="px-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
          Other Information
        </legend>
        <div className="space-y-4 p-4">
          <FormField
            label="Terms & Conditions"
            error={errors.notes?.terms?.message}
          >
            <textarea
              rows={6}
              className="form-textarea"
              {...register("notes.terms")}
            />
          </FormField>
          <FormField label="Additional Notes">
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Instructions, released stamp details, claims process..."
              {...register("notes.additionalNotes")}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Validate all fields before generating the PDF. The preview updates as
          you type.
        </p>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={cn(
            "inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition",
            isSubmitting || !isValid
              ? "cursor-not-allowed opacity-60"
              : "hover:bg-emerald-700",
          )}
        >
          {isSubmitting ? "Preparing..." : "Validate & Prepare PDF"}
        </button>
      </div>
    </form>
  );
}

function sanitizeWaybillValues(values: WaybillFormValues): WaybillFormValues {
  return {
    ...values,
    goods: values.goods.map((item) => ({
      ...item,
      quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
      value:
        item.value === undefined || Number.isNaN(item.value)
          ? undefined
          : item.value,
    })),
    signatures: {
      ...values.signatures,
    },
  };
}

function WaybillNumberBadge({
  isLoading,
  hasError,
}: {
  isLoading: boolean;
  hasError: boolean;
}) {
  if (isLoading) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
        Fetching next waybill number...
      </span>
    );
  }

  if (hasError) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
        Could not reach counter service – using fallback numbering.
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
      Waybill number ready
    </span>
  );
}

function FormField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </span>
      {children}
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <span className="text-xs text-rose-600">{message}</span>;
}

function PartyFields({
  title,
  fieldName,
  errors,
  register,
}: {
  title: string;
  fieldName: "consignor" | "consignee";
  errors:
    | {
        name?: { message?: string };
        address?: { message?: string };
        phone?: { message?: string };
        email?: { message?: string };
      }
    | undefined;
  register: UseFormRegister<WaybillFormValues>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h3>
      <div className="mt-3 space-y-3">
        <FormField label="Name" error={errors?.name?.message}>
          <input
            type="text"
            className="form-input"
            {...register(`${fieldName}.name`)}
          />
        </FormField>
        <FormField label="Address" error={errors?.address?.message}>
          <textarea
            rows={3}
            className="form-textarea"
            {...register(`${fieldName}.address`)}
          />
        </FormField>
        <FormField label="Phone" error={errors?.phone?.message}>
          <input
            type="tel"
            className="form-input"
            {...register(`${fieldName}.phone`)}
          />
        </FormField>
        <FormField label="Email (optional)" error={errors?.email?.message}>
          <input
            type="email"
            className="form-input"
            {...register(`${fieldName}.email`)}
          />
        </FormField>
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  name,
  register,
}: {
  label: string;
  name: Parameters<UseFormRegister<WaybillFormValues>>[0];
  register: UseFormRegister<WaybillFormValues>;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-600">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        {...register(name)}
      />
      {label}
    </label>
  );
}

export function createEmptyGoodsLine(): WaybillFormValues["goods"][number] {
  return {
    quantity: 1,
    packageType: "",
    description: "",
    serialNumbers: "",
    value: undefined,
  };
}

