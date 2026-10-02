import dev from '../assets/dev-192.jpg';
import icon from '../assets/icon-192.png';
import Title from './Title';

const NEW_IN = '1.1.0';

const features = [
  { f: '6 octave piano keyboard', c: 'Play the piano from C2 to B7, 72 keys in total' },
  { f: 'Recorded piano sound', c: 'Recorded by engineers with 10 seconds of sustain; in mono, for the best quality and speed on every device' },
  { f: 'Sustain pedal', c: 'Hold the space bar (or turn it on in the settings) to let the notes ring', isNew: true },
  { f: 'Chords database', c: 'Play multiple notes simultaneously and see the chord or interval they form, in every key and inversion', isNew: true },
  { f: 'Notes tracking', c: 'See the notes you are playing in real time, ordered by pitch' },
  { f: 'Intuitive keymap', c: 'Play the piano using your computer keyboard, whatever its layout' },
  { f: 'Custom settings', c: 'Adjust the octaves played with the keymap, the zoom, the volume and the appearance of the keyboard. Your settings are remembered', isNew: true },
  { f: 'Color themes', c: 'Choose your favorite color theme and feel inspired' },
  { f: 'Frequency chart', c: 'Check the frequency of each note in the piano keyboard from C2 to B7', badge: 'See below' },
  { f: 'Suitable on portable devices', c: 'Use MusicKeyboard.io on your smartphone or tablet, with multi-touch' },
  { f: 'Free to use', c: 'Play the piano online without downloading any software' },
  { f: 'Auto-scrolling', c: 'Keep the notes you are playing in view with the auto-scrolling feature' },
];

const About = () => (
  <section className="mt-24">
    <Title>What is MusicKeyboard.io?</Title>
    <div className="flex flex-col text-justify mx-auto w-full px-4 max-w-4xl my-4 items-center">
      <p>
        Developed by Jaime Alonso, MusicKeyboard.io is a free online platform where you can play the piano in the most
        minimalistic way possible. Whether you&apos;re a beginner composer or an experienced musician, this virtual keyboard
        with realistic piano sound offers an intuitive and interactive way to practice and enjoy music. Benefit from the
        chords database, notes tracking, and intuitive keymap. Play music online without the need to download any
        software. Explore various features, including a frequency chart, custom settings for the music keyboard, and a
        variety of color themes. Play anywhere, anytime!
      </p>
      <div className="flex flex-row mt-12 gap-8">
        <img src={icon} alt="MusicKeyboard.io logo" className="w-24 h-24" width={96} height={96} loading="lazy" />
        <img
          src={dev}
          alt="The developer with sunglasses"
          className="w-24 h-24 p-1 rounded-full border"
          width={96}
          height={96}
          loading="lazy"
        />
      </div>
    </div>
    <div className="flex flex-col justify-center items-center text-center mt-12 px-4">
      <div className="border-2 rounded-xl shadow-xl p-4">
        <Title>Features</Title>
        <ul className="mt-12">
          {features.map(({ f, c, isNew, badge }) => (
            <li className="text-left" key={f}>
              <h3 className="py-2 text-lg">
                {'⦿ ' + f}
                {isNew && <span className="text-xs bg-green-300 rounded-xl p-1 ml-4 whitespace-nowrap">🎉 new {NEW_IN}</span>}
                {badge && (
                  <a href="#frequency-chart" className="text-xs bg-blue-200 rounded-xl p-1 ml-4 whitespace-nowrap">
                    {badge}
                  </a>
                )}
              </h3>
              <p className="font-light">{c}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default About;
