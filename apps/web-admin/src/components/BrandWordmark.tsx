type BrandTone = "on-blue" | "on-red";

/**
 * “ONE ALBUQUERQUE” treatment aligned with Figma exports (Landing / SubmitIssue headers).
 */
export default function BrandWordmark({ tone }: { tone: BrandTone }) {
  const cls = tone === "on-red" ? "brand-wordmark brand-wordmark--on-red" : "brand-wordmark brand-wordmark--on-blue";
  return (
    <span className={cls} aria-label="One Albuquerque">
      <span className="brand-wordmark__one">ONE</span>{" "}
      <span className="brand-wordmark__cabq">ALBUQUERQUE</span>
    </span>
  );
}
