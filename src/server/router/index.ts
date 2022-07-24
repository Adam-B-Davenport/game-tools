// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { Character, Party } from '@prisma/client'

export const appRouter = createRouter()
  .transformer(superjson)
  .query("getAll", {
    async resolve({ ctx }) {
      // Todo - add party creation/selection
      let party = await ctx.prisma.party.findFirst()
      if (party === null){
        party = await ctx.prisma.party.create({
          data: {
            name: "Buckleberry Bandits",
            round: 1,
          }
        })
      }
      const characters = await ctx.prisma.character.findMany();
      return {characters: characters, party: party}
    }
  })
  .mutation("updateParty", {
    input: (val: unknown) => {
      return val as Party
    },
    async resolve({input, ctx}){
      return await ctx.prisma.party.update({
        data: input,
        where: {id: input.id}
      })
    }
  })
  .mutation("updateCharacter", {
    input: (val: unknown) => {
      return val as Character
    },
    async resolve({ input, ctx }) {
      console.log("updating", input)
      return await ctx.prisma.character.update({
        data: input,
        where: { id: input.id }
      })
    },
  })
  .mutation('updateCharacters', {
    input: (val: unknown) => {
      return val as Array<Character>
    },
    async resolve({ input, ctx }) {
      try {
        return await ctx.prisma.character.updateMany({
          data: input,
        })
      }
      catch {
        console.log('prisma failed')
      }
    },
  })
  .mutation("addCharacter", {
    input: (val: unknown) => {
      return val as Character
    },
    async resolve({ input, ctx }) {
      try {
        return await ctx.prisma.character.create({
          data: input
        })
      }
      catch {
        console.log('prisma failed.')
        return await ctx.prisma.character.create({
          data: input
        })
      }
    },
  })
  .mutation("deleteCharacter", {
    input: (val: unknown) => {
      return val as number
    },
    async resolve({ input, ctx }) {
      return await ctx.prisma.character.delete({
        where: {
          id: input
        }
      })
    },
  })
  .merge("example.", exampleRouter)
  .merge("auth.", authRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
