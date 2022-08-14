import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { useState } from 'react';
import CharacterDisplay from '../components/CharacterDisplay';
import Editor from '../components/Edit';
import { Character, Party } from "@prisma/client";


const InitiativeDisplay = ({ current, next, turn }: { current: Array<Character>, next: Array<Character>, turn: number }) => {
  if (turn === 1) {
    return (
      <div className='initiativeList'>
        {current.slice(0, 1).map(char => <CharacterDisplay character={char} key={char.id} />)}
        {current.slice(1, current.length).map((char) => <div className="fog character" key={char.id} />)}
        <hr className='turnDivider' />
        {next.map(char => <CharacterDisplay character={char} key={char.id} />)}
      </div>
    )
  }
  return (
    <div className='initiativeList'>
      {current.map(char => <CharacterDisplay character={char} key={char.id} />)}
      <hr className='turnDivider' />
      {next.map(char => <CharacterDisplay character={char} key={char.id} />)}
    </div>
  )
}

const initCompare = (a: Character, b: Character) => {
  return b.initiative - a.initiative
}

const currentFilter = (c: Character) => {
  return !c.isDone
}

const nextFilter = (c: Character) => {
  return c.isDone
}

const Main = (props: { chars: Array<Character>, party: Party }) => {
  const [characters, setChars] = useState(props.chars.sort(initCompare))
  const [turn, setTurn] = useState(props.party.round)
  const [edit, setEdit] = useState(false)
  const post = trpc.useMutation(['addCharacter'])
  const update = trpc.useMutation(['updateCharacter'])
  const partyMut = trpc.useMutation(['updateParty'])

  const currentTurn = () => {
    return characters.filter(currentFilter).sort(initCompare)
  }

  const nextTurn = () => {
    return characters.filter(nextFilter).sort(initCompare)
  }

  const updateCharacters = async () => {
    for (let i = 0; i < characters.length; i++) {
      update.mutateAsync(characters[i] as Character)
        .catch(() => console.log('failed to update character'))
    }
    setChars(characters)
  }

  const addChar = async () => {
    let char = {
      id: 999 + Math.floor(Math.random() * 99999),
      name: "npc",
      initiative: 0,
      isPlayer: false,
      isDone: false,
    }
    char = await post.mutateAsync(char)
    setChars(characters.concat(char))
  }

  const deleteChar = (char: Character) => {
    const id = char.id
    setChars(characters.filter(c => c.id != id))
  }

  const toggleEdit = () => {
    setEdit(!edit)
    updateCharacters()
  }

  const startOver = () => {
    setEdit(false)
    characters.map(c => c.isDone = false)
    updateCharacters()
    props.party.round = 1
    partyMut.mutateAsync(props.party)
    setTurn(1)
  }

  const next = () => {
    const current = currentTurn()
    if (current.length > 1) {
      current[0]!.isDone = true
    }
    else {
      characters.map(c => c.isDone = false)
      updateCharacters()
      props.party.round = turn + 1
      partyMut.mutateAsync(props.party)
      setTurn(turn + 1)
    }
    updateCharacters()
  }
  const prev = () => {
    const next = nextTurn()
    if (next.length > 0 || turn > 1) {
      if (next.length > 0) {
        next[next.length - 1]!.isDone = false
      }
      else {
        let current = currentTurn()
        let last = current[current.length - 1]
        characters.map(c => c.isDone = true)
        last!.isDone = false
        props.party.round = turn - 1
        partyMut.mutateAsync(props.party)
        setTurn(turn - 1)
      }
    }
    updateCharacters()
  }

  const currentTurnDisplay = () => {
    if (turn === 1) {
      return currentTurn().slice(0, 1)
    }
    else {
      return currentTurn()
    }
  }

  if (!edit) {
    return (
      <div className="App">
        <h1>Turn {turn}</h1>
        <InitiativeDisplay current={currentTurn()} next={nextTurn()} turn={turn} />
        <div className='controls'>
          <button className='btn' onClick={prev}>&lt;=</button>
          <button className='btn' onClick={next}>=&gt;</button>
          <button className='btn' onClick={() => setEdit(!edit)}>≡</button>
        </div>
      </div>
    );

  }
  else {
    return (
      <div className="App">
        <h1>Turn {turn}</h1>
        <Editor characters={characters} updateCharacters={updateCharacters} deleteChar={deleteChar} />
        <div className='controls'>
          <button className='btn' onClick={addChar}>+</button>
          <button className='btn' onClick={startOver}>Reset</button>
          <button className='btn' onClick={toggleEdit}>≡</button>
        </div>
      </div>
    );
  }
}

const Home: NextPage = () => {
  const data = trpc.useQuery(['getAll'])
  if (data.data && data.data.party !== null) {
    return <Main chars={data.data.characters} party={data.data.party} />
  }
  else {
    return <h1>Loading...</h1>
  }
}


export default Home
