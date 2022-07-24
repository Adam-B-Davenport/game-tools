import { Character } from "@prisma/client"

const CharacterDisplay = ({ character }: { character: Character }) => {
  return (
    <div className={`${character.isPlayer ? "player" : "enemy"} character`}>
      <div className='charGrid'>
        <div className='charName'>
          {character.name}
        </div>
        <div className='initiative'>
          {character.initiative}
        </div>
      </div>
    </div>
  )
}
export default CharacterDisplay
