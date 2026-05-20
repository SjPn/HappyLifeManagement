"use client";

import { useEffect, useState } from "react";
import { HouseholdMeterForm } from "@/components/HouseholdMeterForm";
import { PaymentEditForm } from "@/components/PaymentEditForm";
import { PaymentPaidToggle } from "@/components/PaymentPaidToggle";

export function HouseholdPaymentEditor({
  street,
  houseNumber,
  periodYear,
  periodMonth,
  subscriptionFeeUah,
  electricityUah: electricityUahProp,
  paid,
  dayReading,
  nightReading,
  prevDayReading,
  prevNightReading,
  dayRateUah,
  nightRateUah,
}: {
  street: string;
  houseNumber: string;
  periodYear: number;
  periodMonth: number;
  subscriptionFeeUah: number;
  electricityUah: number;
  paid: boolean;
  dayReading: number | null;
  nightReading: number | null;
  prevDayReading: number | null;
  prevNightReading: number | null;
  dayRateUah: number;
  nightRateUah: number;
}) {
  const [electricityUah, setElectricityUah] = useState(electricityUahProp);

  useEffect(() => {
    setElectricityUah(electricityUahProp);
  }, [electricityUahProp]);

  return (
    <>
      <HouseholdMeterForm
        street={street}
        houseNumber={houseNumber}
        periodYear={periodYear}
        periodMonth={periodMonth}
        dayReading={dayReading}
        nightReading={nightReading}
        prevDayReading={prevDayReading}
        prevNightReading={prevNightReading}
        dayRateUah={dayRateUah}
        nightRateUah={nightRateUah}
        electricityUah={electricityUah}
        onElectricityCalculated={setElectricityUah}
      />
      <PaymentPaidToggle
        street={street}
        houseNumber={houseNumber}
        periodYear={periodYear}
        periodMonth={periodMonth}
        paid={paid}
      />
      <PaymentEditForm
        street={street}
        houseNumber={houseNumber}
        periodYear={periodYear}
        periodMonth={periodMonth}
        subscriptionFeeUah={subscriptionFeeUah}
        electricityUah={electricityUah}
      />
    </>
  );
}
