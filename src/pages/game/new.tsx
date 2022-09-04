import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { MouseEvent } from "react"
import type { Party } from "@prisma/client";

const PartyForm = ({ party }: { party?: Party }) => {
  const [name, setName] = useState("")
  const router = useRouter()

  const newMutation = trpc.useMutation(['createParty'])
  // const editMutation = trpc.useMutation(['mowing.updateLocation'])
  // const deleteMutation = trpc.useMutation(['mowing.deleteLocation'])

  useEffect(() => {
    if (party) {
      setName(party.name)
    }
  }, [])

  const clickEvent = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!party) {
      newMutation.mutate({ id: -1, name: name, round: 1 })
    }
    else {
      // party.name = name
      // editMutation.mutate(location)
    }
    if (newMutation.error)
      alert("Failed to post location.")
    // else if (editMutation.error)
    //   alert("Failed to update location.")
    else 
      router.push('/')
  }

  const deleteCLick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    // if (confirm("Are you sure you want to delete this record?")) {
    //   deleteMutation.mutate(router.query.id as string)
    //   if (!deleteMutation.error)
    //     router.push('/mowing')
    //   else
    //     alert("Failed to delete.")
    // }
  }

  const nameChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  return (
    <>
      <div className="w-full max-w-md m-auto">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-xl font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="block text-xl appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              name="name"
              id="name"
              onChange={nameChanged}>
            </input>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-green-500 rounded order-last col-start-2 col-span-1 w-2/3 m-auto px-5 py-1 mt-10 text-xl text-slate-100"
              onClick={clickEvent}>Add</button>
            {location && <button
              className="bg-red-500 rounded col-span-1 w-2/3 m-auto px-5 py-1 mt-10 text-xl text-slate-100"
              onClick={deleteCLick}>Delete</button>}
          </div>
        </form>
      </div>
    </>

  )
}

export default PartyForm

