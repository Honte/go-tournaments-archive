export function Breaker({ breaker, t }) {
  const content = t(`breakers.${breaker}`)
  const description = t(`breakers.descriptions.${breaker}`, { defaultValue: "", missingBehavior: null });

  if (description) {
    return <abbr title={description} className="cursor-help">{content}</abbr>
  }

  return content;
}
