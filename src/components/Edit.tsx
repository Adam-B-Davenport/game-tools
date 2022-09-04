import { Character } from '@prisma/client'
import { ChangeEvent, useState } from 'react'
import { trpc } from '../utils/trpc'

const EditorRow = ({ character, update, deleted }: { character: Character, update: () => void, deleted: (char: Character) => void }) => {
  const [name, setName] = useState(character.name)
  const [initiative, setInitiative] = useState(`${character.initiative}`)
  const [_, setIsPlayer] = useState(character.isPlayer)
  const del = trpc.useMutation(['deleteCharacter'])

  const togglePlayer = () => {
    character.isPlayer = !character.isPlayer
    setIsPlayer(character.isPlayer)
    update()
  }

  const nameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
    character.name = event.target.value
    update()
  }

  const deleteCharacter = () => {
    deleted(character)
    del.mutate(character.id)
  }

  const changeInit = (n: number) => {
    character.initiative += n
    setInitiative(character.initiative.toString())
    update()
  }

  const initiativeChange = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const val = parseFloat(event.target.value)
      if (val) {
        character.initiative = val
        update()
        setInitiative(event.target.value)
      } else {
        setInitiative(event.target.value)
      }
    }
    catch (e) {
      console.log('failed to process initiative change', e)
    }
  }

  const color = character.isPlayer ?  "#99aa77" : "#dd1122"

  return (
    <div className='grid char-columns h-[5rem] sm:h-[2.5rem] mb-10 box-content'>
      <div className={`grid-cols-1 col-span-1 text-neutral-50 text-lg text-left m-2 rounded-lg relative p-2 w-full bg-[${color}]`} >
        <div className='sm:w-1/2 w-full sm:h-full h-1/2 inline-block sm:block bg-blue-500 text-left float-left'>
          <input className={`text-2xl bg-[${color}] w-full h-full inline-block align-middle`} value={name} onChange={nameChange} />
        </div>
        <div className={`sm:w-1/2 w-full sm:h-full h-1/2 text-right inline-block bg-[${color}]`}>
          <button className='m-1 p-2 bg-neutral-600 w-10 rounded-lg' onClick={() => changeInit(-5)}>-5</button>
          <button className='m-1 p-2 bg-neutral-600 w-10 rounded-lg' onClick={() => changeInit(-1)}>-</button>
          <button className='m-1 p-2 bg-neutral-600 w-10 rounded-lg' onClick={() => changeInit(1)}>+</button>
          <button className='m-1 p-2 bg-neutral-600 w-10 rounded-lg' onClick={() => changeInit(5)}>5</button>
          <input className={`w-12 bg-[${color}] text-2xl`} typeof='number' value={initiative} onChange={initiativeChange} />
        </div>
      </div >
      <div className='grid-cols-1 col-span-1 '>
        <input
          type='button'
          className='bg-neutral-600 w-20 h-12 rounded-lg ml-4 text-xl inline-block mb-2'
          value={character.isPlayer ? "PC" : "NPC"}
          onClick={togglePlayer}
          tabIndex={9999} />
        {!character.isPlayer &&
          <input
            type='button'
            className='bg-neutral-600 w-20 h-12 rounded-lg text-xl inline-block float-left ml-4'
            value='X'
            onClick={deleteCharacter}
            tabIndex={9999} />
        }
      </div>
    </div>
  )

}

const Editor = ({ characters, updateCharacters, deleteChar }: { characters: Array<Character>, updateCharacters: () => void, deleteChar: (char: Character) => void }) => {
  characters = characters.sort((a, b) => a.name.localeCompare(b.name))
  const players = characters.filter(char => char.isPlayer)
  const npc = characters.filter(char => !char.isPlayer)
  const update = () => {
    updateCharacters()
  }

  const deleted = (char: Character) => {
    deleteChar(char)
  }

  return (
    <div className=''>
      {players.map((character: Character) => <EditorRow character={character} key={character.id} update={update} deleted={deleted} />)}
      {npc.map((character: Character) => <EditorRow character={character} key={character.id} update={update} deleted={deleted} />)}
    </div>
  )
}
export default Editor
