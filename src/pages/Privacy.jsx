import Footer from '../components/Footer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import SiteHeader from '../components/SiteHeader';

const CONTACT = 'alonsog.jaime@gmail.com';

const sections = [
  ['1. Introduction', [
    'We respect your privacy and are committed to protecting any personal information you may share with us while using our website. This privacy policy explains how we handle information related to the use of cookies and third-party technologies, such as Google AdSense, to display advertisements on our site.',
  ]],
  ['2. Information Collection', [
    'Our website does not directly collect personal data from users. However, third parties, such as Google, may collect information through cookies or other tracking technologies to display relevant or personalized advertisements.',
    'Your keyboard settings (theme, zoom, notation…) are saved only in your own browser, using local storage, and are never sent to us.',
  ]],
  ['3. Cookies and Similar Technologies', [
    'Cookies are small text files that are placed on your device when you browse our website. These cookies may include necessary cookies, which enable the basic functionality of the site, and third-party cookies, such as those used by Google to display ads based on your browsing history.',
    'By using our website, you consent to the use of third-party cookies, including those used by Google, in accordance with their privacy policies.',
    'Google uses cookies to deliver relevant and personalized ads to users. You can find more details about how Google handles data collected through cookies in Google’s Privacy Policy (https://policies.google.com/technologies/ads).',
    'You can manage and configure the use of cookies through your browser settings. You may also visit Google Ad Settings (https://adssettings.google.com) to manage your ad preferences.',
  ]],
  ['4. User Consent', [
    'Before third-party cookies are loaded on our site, we ask for your explicit consent through a cookie consent banner. If you accept, Google and other third parties may place cookies to personalize ads and collect data. If you do not give your consent, only non-personalized ads will be shown.',
  ]],
  ['5. Purpose of Data Processing', [
    'The third-party cookies used on our website may collect data such as information about your device and browser, and browsing behavior data on this and other websites. This data is used to display ads that are more relevant to you.',
  ]],
  ['6. How to Disable Cookies', [
    'You can manage cookies through your browser settings or use third-party tools to block them. Please note that blocking cookies may affect your user experience and limit the functionality of certain parts of our website.',
  ]],
  ['7. Changes to the Privacy Policy', [
    'We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We recommend that you review this page regularly to stay informed.',
  ]],
];

const Privacy = () => {
  useDocumentTitle('Privacy Policy – MusicKeyboard.io');
  return (
    <>
      <main className="pt-4">
        <SiteHeader />
        <article className="max-w-3xl mx-auto px-4 mt-12 text-justify">
          <h1 className="text-xl text-center font-spaceage mb-8">Privacy Policy</h1>
          {sections.map(([title, paragraphs]) => (
            <section key={title} className="mb-6">
              <h2 className="font-bold mb-2">{title}</h2>
              {paragraphs.map((p) => <p key={p} className="mb-2">{p}</p>)}
            </section>
          ))}
          <section className="mb-6">
            <h2 className="font-bold mb-2">8. Contact</h2>
            <p>
              If you have any questions about this privacy policy or the use of cookies on our site, you can contact us
              at <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default Privacy;
