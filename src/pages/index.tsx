import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { useState } from 'react';
import CharacterDisplay from '../components/CharacterDisplay';
import Editor from '../components/Edit';
import { Character, Party } from "@prisma/client";
//import styles from '../styles/Home.module.css'

const InitCompare = (a: Character, b: Character) => {
  return b.initiative - a.initiative

}

const CurrentFilter = (c: Character) => {
  return !c.isDone
}

const NextFilter = (c: Character) => {
  return c.isDone
}


const Main = (props: { chars: Array<Character>, party: Party }) => {
  const [characters, setChars] = useState(props.chars.sort(InitCompare))
  const [turn, setTurn] = useState(props.party.round)
  const [edit, setEdit] = useState(false)
  const post = trpc.useMutation(['addCharacter'])
  const update = trpc.useMutation(['updateCharacter'])
  const partyMut = trpc.useMutation(['updateParty'])

  const CurrentTurn = () => {
    return characters.filter(CurrentFilter).sort(InitCompare)
  }
  const NextTurn = () => {
    return characters.filter(NextFilter).sort(InitCompare)
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
    const currentTurn = CurrentTurn()
    if (currentTurn.length > 1) {
      currentTurn[0]!.isDone = true
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
    const nextTurn = NextTurn()
    if (nextTurn.length > 0 || turn > 1) {
      if (nextTurn.length > 0) {
        nextTurn[nextTurn.length - 1]!.isDone = false
      }
      else {
        let currentTurn = CurrentTurn()
        let last = currentTurn[nextTurn.length - 1]
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
      return CurrentTurn().slice(0, 1)
    }
    else {
      return CurrentTurn()
    }
  }

  if (!edit) {
    return (
      <div className="App">
        <h1>Turn {turn}</h1>
        <div className='initiativeList'>
          {currentTurnDisplay().map(char => <CharacterDisplay character={char} key={char.id} />)}
          <hr className='turnDivider' />
          {NextTurn().map(char => <CharacterDisplay character={char} key={char.id} />)}
        </div>
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
