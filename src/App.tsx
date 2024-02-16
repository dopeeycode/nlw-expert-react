import { ChangeEvent, useState } from 'react'
import logo from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'
import { v4 as uuid } from 'uuid'
import { toast } from 'sonner'

interface INote {
  id: string
  date: Date
  content: string
}

export function App() {
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState<INote[]>(() => {
    const notesOnStorage = localStorage.getItem('@nlw-expert/notes')

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage)
    }

    return []
  })

  const onNoteCreated = (content: string) => {
    const newNote = {
      id: uuid(),
      date: new Date(),
      content,
    }

    const notesArray = [newNote, ...notes]

    setNotes(notesArray)

    localStorage.setItem('@nlw-expert/notes', JSON.stringify(notesArray))
  }

  const onNoteDeleted = (id: string) => {
    const notesArray = notes.filter((note) => note.id !== id)

    setNotes(notesArray)
    toast.success('Nota deletada')

    localStorage.setItem('@nlw-expert/notes', JSON.stringify(notesArray))
  }

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value

    setSearch(query)
  }

  const filteredNotes =
    search !== ''
      ? notes.filter((note) =>
          note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        )
      : notes

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5 md:px-5 lg:px-1">
      <img src={logo} alt="NLW Expert" />

      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="w-full"
      >
        <input
          type="text"
          placeholder="Busque em suas notas..."
          onChange={handleSearch}
          className="w-full bg-transparent text-2xl font-semibold tracking-tight placeholder:text-slate-500 outline-none sm:text-3xl"
        />
      </form>

      <div className="h-px bg-slate-700" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        <NewNoteCard onNoteCreated={onNoteCreated} />
        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />
        ))}
      </div>
    </div>
  )
}
