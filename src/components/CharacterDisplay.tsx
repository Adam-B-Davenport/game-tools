import { Character } from "@prisma/client"

const CharContent = ({ character }: { character: Character }) => {
  return (
    <div className='grid top-[50%] box-border absolute w-full translate-y-[-50%] pr-[10px] char-columns'>
      <div className='inline col-span-1 pl-2 w-full'>
        {character.name}
      </div>
      <div className='inline col-span-1 col-start-4 pr-2 text-right'>
        {character.initiative}
      </div>
    </div>
  )
}

const CharacterDisplay = ({ character }: { character: Character }) => {
  if (character.isPlayer) {
    return (
      <div className="w-full py-8 bg-[#99aa77] col-start-1 col-end-3 border-[#99aa77] text-left relative m-2 text-slate-50 rounded-lg text-2xl h-[2.5rem]">
        <CharContent character={character} />
      </div>
    )
  }
  return (
    <div className="w-full py-8 bg-[#dd1122] col-start-2 col-end-4 border-[#dd1122] text-left relative m-2 text-slate-50 rounded-lg text-2xl h-[2.5rem]">
      <CharContent character={character} />
    </div>
  )
}
export default CharacterDisplay
