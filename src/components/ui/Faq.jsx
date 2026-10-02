import { LuChevronDown } from 'react-icons/lu';

/** Questions and answers (the same pairs feed the FAQPage structured data). */
const Faq = ({ items }) => (
  <div className="divide-y divide-line">
    {items.map(([q, a]) => (
      <details key={q} className="group py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
          {q}
          <LuChevronDown className="shrink-0 text-muted transition group-open:rotate-180" />
        </summary>
        <p className="mt-2 leading-relaxed text-ink/80">{a}</p>
      </details>
    ))}
  </div>
);

export default Faq;
