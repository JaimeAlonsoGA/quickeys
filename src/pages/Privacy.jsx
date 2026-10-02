import Section from '../components/ui/Section';
import { useHead } from '../seo/head';

const CONTACT = 'alonsog.jaime@gmail.com';

const SECTIONS = [
  ['Introduction', 'We respect your privacy. This policy explains how MusicKeyboard.io handles information related to cookies and third-party technologies, such as Google AdSense, used to display advertisements.'],
  ['Information we collect', 'We do not collect personal data. Your piano settings (accent colour, theme, note names, zoom, volume…) are stored only in your own browser with local storage and are never sent to us. Third parties such as Google may collect information through cookies to show relevant or personalised ads.'],
  ['Cookies', 'Cookies are small text files placed on your device. This site may use necessary cookies and third-party advertising cookies. Google uses cookies to deliver relevant and personalised ads; see https://policies.google.com/technologies/ads for details. You can manage your ad preferences at https://adssettings.google.com.'],
  ['Your consent', 'Before third-party cookies are loaded, we ask for your consent through a cookie banner. If you accept, Google and other partners may use cookies to personalise ads. If you decline, only non-personalised ads are shown.'],
  ['Purpose of processing', 'Third-party cookies may collect information about your device and browser and your browsing behaviour on this and other websites, in order to show more relevant ads.'],
  ['Disabling cookies', 'You can block or delete cookies in your browser settings or with third-party tools. Blocking cookies may affect parts of the website.'],
  ['Changes', 'We may update this policy to reflect changes in our practices or legal requirements. Please review it from time to time.'],
];

const Privacy = () => {
  useHead({
    title: 'Privacy Policy | MusicKeyboard.io',
    description: 'How MusicKeyboard.io handles cookies, advertising and your settings.',
    path: '/privacy',
  });
  return (
    <Section title="Privacy policy" as="h1" className="mx-auto max-w-3xl">
      <div className="prose-cozy">
        {SECTIONS.map(([title, text]) => (
          <section key={title} className="mb-5">
            <h2 className="mb-1 text-lg font-bold">{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <section>
          <h2 className="mb-1 text-lg font-bold">Contact</h2>
          <p>
            Questions about this policy? Write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </section>
      </div>
    </Section>
  );
};

export default Privacy;
