import { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState('');
  const [key, setKey] = useState('');
  const [step, setStep] = useState(0);
  const [transposeTo, setTransposeTo] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [lyricsTransposed, setLyricsTransposed] = useState('');

  const transposeChord = (chord, amount) => {
    const scale = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    const normalizeMap = {
      Cb: 'B',
      Db: 'C#',
      Eb: 'D#',
      Fb: 'E',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
      'E#': 'F',
      'B#': 'C',
    };

    return chord.replace(/[CDEFGAB](b|#)?/g, function (match) {
      const i =
        (scale.indexOf(normalizeMap[match] ? normalizeMap[match] : match) +
          parseInt(amount)) %
        scale.length;

      return scale[i < 0 ? i + scale.length : i];
    });
  };

  useEffect(() => {
    if (file) {
      try {
        const fileToLoad = file;
        const fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
          const renderedLyrics = fileLoadedEvent.target.result;

          const matchedKey = renderedLyrics?.match(/(=[A-Z#]+)/gi);
          let formatedKey = '';

          if (matchedKey) {
            formatedKey = matchedKey[0]?.replace('=', '') || '';
          } else {
            throw new Error('error');
          }

          const formattedRenderedLyrics = renderedLyrics
            .replace(/(-[A-Z#]+)/gi, (match) => {
              return transposeChord(match.replace('-', ''), step);
            })
            .replace('=', '');

          setKey(transposeChord(formatedKey, 0));
          setStep(0);
          setTransposeTo(transposeChord(formatedKey, 0));
          setLyrics(renderedLyrics);
          setLyricsTransposed(formattedRenderedLyrics);
        };
        fileReader.readAsText(fileToLoad, 'UTF-8');
      } catch (err) {
        setKey('');
        setStep(0);
        setTransposeTo('');
        setLyrics('');
        setLyricsTransposed('');
      }
    }
  }, [file]);

  useEffect(() => {
    setTransposeTo(transposeChord(key, step));
    setLyricsTransposed(
      lyrics
        .replace(/(-[A-Z#]+ ?)/gi, (match) => {
          const trimmedMatch = match.trim().replace('-', '');

          if (
            trimmedMatch.length !== transposeChord(trimmedMatch, step).length
          ) {
            return transposeChord(trimmedMatch, step);
          }

          return transposeChord(trimmedMatch, step) + ' ';
        })
        .replace('=', '')
    );
  }, [step]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Transpose Chords</h2>
      </header>

      <div className="container">
        <div className="setting">
          <input
            type="file"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setFile(e.target.files[0]);
            }}
          ></input>
          <div>
            Key
            <input type="text" value={key} readOnly></input>
            Step
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(e.target.value)}
              disabled={!file}
            ></input>
            To
            <input type="text" value={transposeTo} readOnly></input>
          </div>
        </div>

        {file && (
          <div className="lyrics">
            <textarea value={lyricsTransposed} readOnly></textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
