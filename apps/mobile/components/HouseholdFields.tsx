import React, { useState } from "react";
import { View } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { proposeHouseholdName, type HouseholdMember } from "@fiance/sdk";
import type { Household } from "@/db/schema";
import { useGuestsStore } from "@/store/useGuestsStore";
import { InputRow } from "@/components/FormSection";

export function HouseholdFields({
  household,
  members,
}: {
  household: Household | null;
  members: HouseholdMember[];
}) {
  const { t } = useTranslation("guests");
  const materializeHousehold = useGuestsStore((s) => s.materializeHousehold);

  // `null` = untouched. An empty string here would commit the suggested name as
  // if it had been typed.
  const [name, setName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const savedName = household?.name ?? "";
  const savedAddress = household?.address ?? "";

  const suggestion = savedName.trim() ? "" : proposeHouseholdName(members);

  const memberIds = members.map((m) => m.id);

  const commitName = () => {
    const draft = name;
    setName(null);
    if (draft === null) return;
    const v = draft.trim();
    if (v === savedName.trim()) return;
    materializeHousehold(memberIds, { name: v || null });
  };

  const commitAddress = () => {
    const draft = address;
    setAddress(null);
    if (draft === null) return;
    const v = draft.trim();
    if (v === savedAddress.trim()) return;
    materializeHousehold(memberIds, { address: v || null });
  };

  return (
    <View>
      <InputRow
        label={t("household.name")}
        value={name ?? (savedName || suggestion)}
        onChangeText={setName}
        onBlur={commitName}
      />
      <InputRow
        label={t("household.address")}
        value={address ?? savedAddress}
        placeholder={t("household.addressEmpty")}
        multiline
        onChangeText={setAddress}
        onBlur={commitAddress}
      />
    </View>
  );
}
