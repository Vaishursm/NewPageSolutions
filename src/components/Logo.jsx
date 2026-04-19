/**
 * Halcyon SENTINEL Logo Component
 * Displays the Halcyon wordmark with SENTINEL Onboarding subtitle
 */

import HalcyonIcon from "@/asset/Halcyon_Icon_RGB_GRAD-POS.svg";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Halcyon Icon */}
      <div className="flex-shrink-0">
        <img
          src={HalcyonIcon}
          alt="Halcyon Capital Partners"
          className="h-10 w-auto"
          title="Halcyon Capital Partners"
        />
      </div>

      {/* Text Branding */}
      <div className="flex flex-col gap-0.5">
        {/* "Halcyon" - Bold in #1B2A4A */}
        <div
          className="text-xl font-bold leading-none"
          style={{ color: "#1B2A4A" }}
        >
          Halcyon
        </div>

        {/* "SENTINEL Onboarding" - Regular in #6B7280 */}
        <div
          className="text-xs font-normal leading-none"
          style={{ color: "#6B7280" }}
        >
          SENTINEL Onboarding
        </div>
      </div>
    </div>
  );
}
