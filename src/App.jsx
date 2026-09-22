import { useEffect, useRef, useState } from 'react'
import ImageEditor from '@unlayer/react-image-editor'
import { composePoster } from './lib/composePoster'
import { loadGallery, saveToGallery, removeFromGallery } from './lib/gallery'
import './App.css'

const STEPS = ['UPLOAD', 'CUSTOMIZE', 'RESULT']

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function App() {
  const [step, setStep] = useState('UPLOAD')
  const [posterBase, setPosterBase] = useState(null)
  const [suspectName, setSuspectName] = useState('')
  const [finalImage, setFinalImage] = useState(null)
  const [gallery, setGallery] = useState([])
  const [composing, setComposing] = useState(false)
  const [editorError, setEditorError] = useState(null)
  const editorRef = useRef(null)

  useEffect(() => {
    setGallery(loadGallery())
  }, [])

  async function handleFile(file) {
    if (!file) return
    setComposing(true)
    setEditorError(null)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const composed = await composePoster(dataUrl)
      setPosterBase(composed)
      setStep('CUSTOMIZE')
    } catch (err) {
      console.error(err)
      setEditorError('Could not read that image. Try a different file.')
    } finally {
      setComposing(false)
    }
  }

  async function handleSkipPhoto() {
    setComposing(true)
    const composed = await composePoster(null)
    setPosterBase(composed)
    setComposing(false)
    setStep('CUSTOMIZE')
  }

  function handleSave({ dataUrl }) {
    setFinalImage(dataUrl)
    setGallery(saveToGallery(dataUrl, suspectName))
    setStep('RESULT')
  }

  function handleStartOver() {
    setPosterBase(null)
    setFinalImage(null)
    setSuspectName('')
    setEditorError(null)
    setStep('UPLOAD')
  }

  function handleDownload() {
    if (!finalImage) return
    const a = document.createElement('a')
    a.href = finalImage
    a.download = `wanted-${(suspectName || 'suspect').toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  function handleDeleteEntry(id) {
    setGallery(removeFromGallery(id))
  }

  return (
    <div className="board">
      <header className="masthead">
        <p className="masthead__eyebrow">VICE CITY POLICE DEPARTMENT · BULLETIN BOARD</p>
        <h1 className="masthead__title">Wanted Poster Generator</h1>
        <p className="masthead__sub">
          Upload a mugshot, dress up the case file, and pin your suspect to the precinct board.
          Built with the Unlayer React Image Editor.
        </p>
      </header>

      <ol className="stepper" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className={s === step ? 'stepper__item stepper__item--active' : 'stepper__item'}>
            <span className="stepper__index">{i + 1}</span>
            <span>{s === 'UPLOAD' ? 'Upload photo' : s === 'CUSTOMIZE' ? 'Customize poster' : 'Pin to board'}</span>
          </li>
        ))}
      </ol>

      {step === 'UPLOAD' && (
        <section className="panel panel--paper">
          <h2>Book the suspect</h2>
          <p className="panel__hint">
            Choose a photo for the mugshot slot. It'll be dropped straight into the case file frame.
          </p>
          <label className="dropzone">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              hidden
            />
            <span className="dropzone__label">
              {composing ? 'Booking suspect…' : 'Click to choose a photo'}
            </span>
          </label>
          <button type="button" className="link-button" onClick={handleSkipPhoto} disabled={composing}>
            Skip — use a blank case file instead
          </button>
          {editorError && <p className="error-text">{editorError}</p>}
        </section>
      )}

      {step === 'CUSTOMIZE' && posterBase && (
        <section className="panel panel--editor">
          <div className="panel__row">
            <div>
              <h2>Fill in the case file</h2>
              <p className="panel__hint">
                Use the text tool for the suspect's name, charges, and bounty. Add stamps, shapes,
                or filters, then crop it however you like the frame. Save when it's ready to pin up.
              </p>
            </div>
            <input
              className="name-input"
              type="text"
              placeholder="Suspect name (for the gallery label)"
              value={suspectName}
              onChange={(e) => setSuspectName(e.target.value)}
            />
          </div>
          <div className="editor-shell">
            <ImageEditor
              ref={editorRef}
              image={posterBase}
              minHeight="640px"
              options={{ theme: 'dark' }}
              onSave={handleSave}
              onCancel={handleStartOver}
              onLoadError={() => setEditorError('The poster image failed to load into the editor.')}
              onError={(err) => {
                console.error('Image Editor error:', err)
                setEditorError('The editor ran into a problem loading. Try refreshing.')
              }}
            />
          </div>
          {editorError && <p className="error-text">{editorError}</p>}
        </section>
      )}

      {step === 'RESULT' && finalImage && (
        <section className="panel panel--paper panel--result">
          <h2>Pinned to the board</h2>
          <div className="result-frame">
            <img src={finalImage} alt={`Wanted poster for ${suspectName || 'suspect'}`} />
          </div>
          <div className="result-actions">
            <button type="button" className="btn btn--primary" onClick={handleDownload}>
              Download poster
            </button>
            <button type="button" className="btn" onClick={handleStartOver}>
              Book another suspect
            </button>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="panel panel--cork">
          <h2>Precinct board</h2>
          <p className="panel__hint">Every suspect you've pinned up, saved on this device.</p>
          <div className="gallery">
            {gallery.map((entry) => (
              <figure key={entry.id} className="gallery__card">
                <span className="gallery__pin" aria-hidden="true" />
                <img src={entry.dataUrl} alt={`Wanted poster for ${entry.label}`} />
                <figcaption>{entry.label}</figcaption>
                <button
                  type="button"
                  className="gallery__remove"
                  onClick={() => handleDeleteEntry(entry.id)}
                  aria-label={`Remove poster for ${entry.label}`}
                >
                  Take down
                </button>
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer className="foot-note">
        Built for the Build with React Image Editor Challenge · Not affiliated with Rockstar Games
      </footer>
    </div>
  )
}
