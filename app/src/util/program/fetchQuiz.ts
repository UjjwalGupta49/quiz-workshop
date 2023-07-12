import * as anchor from '@coral-xyz/anchor'
import { anchorProgram } from '@/util/helper';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';


export const getQuizAccount = async (
  wallet: anchor.Wallet,
  quizId: number,
) => {
  console.log(quizId)
  const program = anchorProgram(wallet);

  try {
    // @ts-ignore
    const data = await program.account.quiz.all(
      [{
        memcmp: { offset: 8, bytes: bs58.encode(Uint8Array.from([quizId])) }
      }]
    )

    if (!data || !data.length) {
      return {
        error: true
      }
    }
    return data[0]

  } catch (e: any) {
    console.log(e)
    return { error: e.toString(), sig: null }
  }
}
