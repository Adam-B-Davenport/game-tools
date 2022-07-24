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
  return (
    <>
      <div className={`${character.isPlayer ? "player" : "enemy"} character`} >
        <div className='charGrid'>
          <div className='charName'>
            <input value={name} onChange={nameChange} />
          </div>
          <div className='initiative'>
            <button className='initiativeButton' onClick={() => changeInit(-5)}>-5</button>
            <button className='initiativeButton' onClick={() => changeInit(-1)}>-</button>
            <button className='initiativeButton' onClick={() => changeInit(1)}>+</button>
            <button className='initiativeButton' onClick={() => changeInit(5)}>5</button>
            <input typeof='number' value={initiative} onChange={initiativeChange} />
          </div>
        </div>
      </div >
      <div className='outerCol'>
        <input type='button' className='deleteButton' value='=' onClick={togglePlayer} tabIndex={9999}/>
        {!character.isPlayer &&
          <input type='button' className='deleteButton' value='X' onClick={deleteCharacter} tabIndex={9999} />
        }
      </div>
    </>
  )

}

const Editor = ({ characters, updateCharacters , deleteChar }: { characters: Array<Character>, updateCharacters: () => void, deleteChar: (char: Character) => void}) => {
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
    <div className='initiativeList'>
      {players.map((character: Character) => <EditorRow character={character} key={character.id} update={update} deleted={deleted} />)}
      {npc.map((character: Character) => <EditorRow character={character} key={character.id} update={update} deleted={deleted} />)}
    </div>
  )
}
export default Editor
