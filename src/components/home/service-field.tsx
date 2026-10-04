"use client";

import { useSearchParams } from "next/navigation";
import SelectField from "./select-field";

type Option = { value: string; label: string };

// "What do you need?", preselected from ?service= when a pricing or service button sent the visitor here
export default function ServiceField({ options }: { options: Option[] }) {
  const service = useSearchParams().get("service") ?? "";
  const preselected = options.some((option) => option.value === service) ? service : "";

  return (
    <SelectField
      key={preselected}
      name="service"
      label="What do you need?*"
      options={options}
      defaultValue={preselected}
    />
  );
}
