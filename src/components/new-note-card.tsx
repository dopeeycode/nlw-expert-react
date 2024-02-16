import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent] = useState('')
  const textareaContentRef = useRef<HTMLTextAreaElement>(null)

  const handleStartEditor = () => {
    setShouldShowOnboarding(false)
  }

  const handleContentChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)

    if (event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  const handleSaveNote = (event: FormEvent) => {
    event.preventDefault()

    if (content === '') {
      textareaContentRef.current?.focus()
      toast.error('Preencha o campo !', {
        style: {
          color: 'white',
        },
      })
      return
    }

    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true)

    toast.success('Nota adicionada')
  }

  const handleStartRecording = () => {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition'

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação!')
      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      if (!textareaContentRef.current) return

      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  const handleStopRecording = () => {
    setIsRecording(false)

    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 text-left gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none transition-all">
        <strong className="text-sm font-medium text-slate-200">
          Adicionar nota
        </strong>

        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 h-[60vh] -translate-y-1/2 max-w-[640px] w-full bg-slate-700 rounded-md flex flex-col outline-none overflow-hidden">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 group">
            <X className="group-hover:scale-90 size-5 transition-all group-hover:text-slate-100" />
          </Dialog.Close>

          <form className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5 ">
              <span className="text-sm font-medium text-slate-200">
                Adicionar nota
              </span>

              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{' '}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="text-lime-400 font-medium hover:underline underline-offset-[.325rem]"
                  >
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    onClick={handleStartEditor}
                    className="text-lime-400 font-medium hover:underline underline-offset-[.325rem]"
                  >
                    utilize apenas texto
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  ref={textareaContentRef}
                  value={content}
                  onChange={handleContentChanged}
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                />
              )}
            </div>

            {isRecording && (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full group flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 hover:text-slate-100 duration-300 transition-colors outline-none font-bold"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Gravando! (clique p/ interromper)
              </button>
            )}

            {!shouldShowOnboarding && (
              <button
                onClick={handleSaveNote}
                type="button"
                className="w-full group bg-lime-400 py-4 text-center text-sm text-lime-950 hover:bg-lime-500 transition-colors duration-300 outline-none font-bold"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
