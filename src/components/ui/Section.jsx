/** A titled card section. */
const Section = ({ title, as: Tag = 'h2', intro, action, children, className = '', id }) => (
  <section id={id} className={`card scroll-mt-6 p-5 sm:p-7 ${className}`}>
    {(title || action) && (
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        {title && <Tag className="text-xl font-bold sm:text-2xl">{title}</Tag>}
        {action}
      </div>
    )}
    {intro && <p className="-mt-2 mb-5 max-w-2xl text-muted">{intro}</p>}
    {children}
  </section>
);

export default Section;
