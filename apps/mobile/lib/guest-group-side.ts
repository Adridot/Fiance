import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatGuestGroupSide, type GuestGroupSide, type GuestGroupSideLabels } from "@fiance/sdk";
import { useWeddingStore } from "@/store/useWeddingStore";

export function useGuestGroupSideLabel(): (side: GuestGroupSide | null | undefined) => string {
  const { t } = useTranslation("guests");
  const wedding = useWeddingStore((s) => s.wedding);

  const labels = useMemo<GuestGroupSideLabels>(
    () => ({
      // `sideNamed` carries `{name}` in a SINGLE brace: `formatGuestGroupSide`
      // substitutes it, not i18next.
      named: t("sideNamed"),
      partner1: t("sidePartner1"),
      partner2: t("sidePartner2"),
      both: t("sideBoth"),
      none: t("sideNone"),
    }),
    [t],
  );

  return useMemo(
    () => (side) => formatGuestGroupSide(side, wedding, labels),
    [wedding, labels],
  );
}
