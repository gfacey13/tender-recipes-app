import { useId, type SVGProps } from "react";

const hat = "M6 21v-6a4 4 0 1 1 1.4-7.7 5 5 0 0 1 9.2 0A4 4 0 1 1 18 15v6Z";
const placement = "translate(10.5 -8.2) scale(.63) rotate(12 12 12)";

export function ChefChatIcon(props: SVGProps<SVGSVGElement>) {
  const maskId = useId();

  return (
    <svg width={24} height={24} viewBox="0 -7 28 31" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="-7" width="28" height="31">
          <rect x="0" y="-7" width="28" height="31" fill="white" stroke="none" />
          <path d={hat} transform={placement} fill="black" stroke="black" strokeWidth={6} />
        </mask>
      </defs>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" mask={`url(#${maskId})`} />
      <path d={hat} transform={placement} strokeWidth={2.85} />
    </svg>
  );
}
