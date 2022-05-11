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
            .replace(/(-[A-Z#b/]+ ?)/gi, (match) => {
              const trimmedMatch = match.trim().replace('-', '');

              if (
                trimmedMatch.length !== transposeChord(trimmedMatch, 0).length
              ) {
                const extraSpace =
                  trimmedMatch.length - transposeChord(trimmedMatch, 0).length;

                if (extraSpace < 1) {
                  return transposeChord(trimmedMatch, 0) + ' ';
                }
                return (
                  transposeChord(trimmedMatch, 0) +
                  ' '.repeat(Math.abs(extraSpace) + 2)
                );
              }
              return transposeChord(trimmedMatch, 0) + '  ';
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
    const stepFallback = step || 0;

    setTransposeTo(transposeChord(key, stepFallback));
    setLyricsTransposed(
      lyrics
        .replace(/(-[A-Z#b/]+ ?)/gi, (match) => {
          const trimmedMatch = match.trim().replace('-', '');

          if (
            trimmedMatch.length !==
            transposeChord(trimmedMatch, stepFallback).length
          ) {
            const extraSpace =
              trimmedMatch.length -
              transposeChord(trimmedMatch, stepFallback).length;

            if (extraSpace < 1) {
              return transposeChord(trimmedMatch, stepFallback) + ' ';
            }
            return (
              transposeChord(trimmedMatch, stepFallback) +
              ' '.repeat(Math.abs(extraSpace) + 2)
            );
          }
          return transposeChord(trimmedMatch, stepFallback) + '  ';
        })
        .replace('=', '')
    );
  }, [step]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>
          <span>T</span>ranspose <span>C</span>hords
        </h2>
      </header>

      <div className="container">
        <div className="setting">
          <div className="upload-border">
            <input
              type="file"
              accept=".txt"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setFile(e.target.files[0]);
              }}
            ></input>
          </div>
          <div>
            Key
            <input type="text" value={key} readOnly></input>
            Step
            <button
              onClick={() => setStep((prevVal) => prevVal - 1)}
              disabled={!file}
            >
              -
            </button>
            <button onClick={() => setStep(0)} disabled={!file}>
              ↻
            </button>
            <button
              onClick={() => setStep((prevVal) => prevVal + 1)}
              disabled={!file}
            >
              +
            </button>
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
